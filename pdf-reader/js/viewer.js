import * as pdfjsLib from "../vendor/pdf.js";
import { clamp, fileToArrayBuffer, formatBytes } from "./utils.js";
import { makeDocumentId, storage } from "./storage.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = "./vendor/pdf.worker.js";

export class PDFViewer {
  constructor(elements, settings) {
    this.stage = elements.stage;
    this.shell = elements.shell;
    this.track = elements.track;
    this.dropZone = elements.dropZone;
    this.progress = elements.progress;
    this.docTitle = elements.docTitle;
    this.status = elements.status;
    this.pageInput = elements.pageInput;
    this.pageSlider = elements.pageSlider;
    this.totalPages = elements.totalPages;
    this.zoomLabel = elements.zoomLabel;
    this.settings = settings;
    this.pdf = null;
    this.file = null;
    this.fileBuffer = null;
    this.documentId = "";
    this.currentPage = 1;
    this.total = 0;
    this.scale = 1;
    this.rotation = 0;
    this.rendered = new Map();
    this.rendering = new Set();
    this.textCache = new Map();
    this.startedAt = Date.now();
    this.flipState = null;
    this.dragState = null;
    this.suppressFlipClickUntil = 0;
    this.visibleObserver = new IntersectionObserver((entries) => this.onVisible(entries), {
      root: this.shell,
      rootMargin: "900px 0px",
      threshold: 0.01,
    });
    this.bindPageFlipInteractions();
  }

  async loadFile(file) {
    if (!file || file.type !== "application/pdf") {
      throw new Error("Please select a valid PDF file.");
    }

    this.file = file;
    this.fileBuffer = await fileToArrayBuffer(file);
    this.documentId = await makeDocumentId(file);
    await storage.set("documents", {
      id: this.documentId,
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
      data: this.fileBuffer.slice(0),
      lastPage: 1,
      totalPages: 0,
      updatedAt: Date.now(),
    });
    this.dropZone.hidden = true;
    this.shell.hidden = false;
    this.setProgress(8);
    this.docTitle.textContent = file.name;
    this.status.textContent = `${formatBytes(file.size)} • Loading`;

    const loadingTask = pdfjsLib.getDocument({ data: this.fileBuffer.slice(0) });
    loadingTask.onProgress = (progress) => {
      if (progress.total) this.setProgress(8 + (progress.loaded / progress.total) * 50);
    };

    this.pdf = await loadingTask.promise;
    this.total = this.pdf.numPages;
    this.currentPage = (await this.restoreLastPage()) || 1;
    this.rendered.clear();
    this.rendering.clear();
    this.textCache.clear();
    this.pageInput.max = String(this.total);
    this.pageSlider.max = String(this.total);
    this.totalPages.textContent = `/ ${this.total}`;
    this.buildPlaceholders();
    this.applyMode();
    await this.goToPage(this.currentPage, false);
    await this.saveRecent();
    this.setProgress(100);
    window.setTimeout(() => this.setProgress(0), 500);
    this.dispatch("loaded");
  }

  async loadStoredDocument(record) {
    if (!record?.data) return;
    const file = new File([record.data], record.name, {
      type: "application/pdf",
      lastModified: record.lastModified || Date.now(),
    });
    await this.loadFile(file);
  }

  buildPlaceholders() {
    this.track.textContent = "";
    for (let pageNumber = 1; pageNumber <= this.total; pageNumber += 1) {
      const page = document.createElement("article");
      page.className = "page-card loading";
      page.dataset.page = String(pageNumber);
      page.setAttribute("aria-label", `Page ${pageNumber}`);
      const pill = document.createElement("span");
      pill.className = "page-number-pill";
      pill.textContent = String(pageNumber);
      page.append(pill);
      this.track.append(page);
      this.visibleObserver.observe(page);
    }
  }

  applyMode() {
    const bookMode = this.settings.pageFlip === "realistic";
    const layoutMode = bookMode ? "horizontal" : this.settings.scrollMode;
    this.track.className = `page-track ${layoutMode}${bookMode ? " book-layout" : ""}`;
    this.shell.classList.toggle("book-reader", bookMode);
    this.shell.style.direction = this.settings.direction === "rtl" ? "rtl" : "ltr";
    this.zoomLabel.textContent = `${Math.round(this.scale * 100)}%`;
    this.updateSpreadVisibility();
  }

  async onVisible(entries) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const pageNumber = Number(entry.target.dataset.page);
        void this.renderPage(pageNumber);
      }
    }
  }

  async renderPage(pageNumber) {
    if (!this.pdf || this.rendered.has(pageNumber) || this.rendering.has(pageNumber)) return;
    const container = this.track.querySelector(`[data-page="${pageNumber}"]`);
    if (!container) return;

    this.rendering.add(pageNumber);
    try {
      const page = await this.pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1, rotation: this.rotation });
      const fitScale = this.computeFitScale(baseViewport);
      const outputScale = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: fitScale * this.scale, rotation: this.rotation });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: false });

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

      container.style.width = `${Math.floor(viewport.width)}px`;
      container.style.height = `${Math.floor(viewport.height)}px`;
      container.classList.add("page-turn");
      container.replaceChildren(canvas, this.makePagePill(pageNumber));

      await page.render({ canvasContext: context, viewport }).promise;
      container.classList.remove("loading");
      this.rendered.set(pageNumber, canvas);
    } catch (error) {
      container.textContent = `Failed to render page ${pageNumber}`;
      console.warn("[PDFReader] Render failed", error);
    } finally {
      this.rendering.delete(pageNumber);
    }
  }

  async getRenderedCanvas(pageNumber) {
    await this.renderPage(pageNumber);
    return this.rendered.get(pageNumber) || null;
  }

  computeFitScale(viewport) {
    const shellRect = this.shell.getBoundingClientRect();
    const spreadWidth = this.settings.pageFlip === "realistic" ? (shellRect.width - 64) / 2 : shellRect.width - 36;
    const availableWidth = Math.max(180, spreadWidth);
    const availableHeight = Math.max(260, shellRect.height - 36);
    if (this.settings.fitMode === "page") {
      return Math.max(0.2, Math.min(availableWidth / viewport.width, availableHeight / viewport.height));
    }
    if (this.settings.fitMode === "free") {
      return 1;
    }
    return Math.max(0.2, availableWidth / viewport.width);
  }

  makePagePill(pageNumber) {
    const pill = document.createElement("span");
    pill.className = "page-number-pill";
    pill.textContent = String(pageNumber);
    return pill;
  }

  async rerenderVisible() {
    if (!this.pdf) return;
    this.rendered.clear();
    this.rendering.clear();
    this.track.querySelectorAll(".page-card").forEach((card) => {
      card.className = "page-card loading";
      card.replaceChildren(this.makePagePill(Number(card.dataset.page)));
    });
    this.updateSpreadVisibility();
    await this.renderNearby();
  }

  async refreshLayout() {
    if (!this.pdf) return;
    await this.rerenderVisible();
    await this.goToPage(this.currentPage, false);
  }

  async renderNearby() {
    if (this.settings.pageFlip === "realistic") {
      const spreadStart = this.getSpreadStart(this.currentPage);
      const start = Math.max(1, spreadStart - 2);
      const end = Math.min(this.total, spreadStart + 5);
      await Promise.all(Array.from({ length: end - start + 1 }, (_, index) => this.renderPage(start + index)));
      return;
    }

    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.total, this.currentPage + 3);
    await Promise.all(Array.from({ length: end - start + 1 }, (_, index) => this.renderPage(start + index)));
  }

  async goToPage(pageNumber, smooth = true) {
    if (!this.pdf) return;
    const requestedPage = clamp(Number(pageNumber) || 1, 1, this.total);
    this.currentPage = this.settings.pageFlip === "realistic" ? this.getSpreadStart(requestedPage) : requestedPage;
    this.pageInput.value = String(this.currentPage);
    this.pageSlider.value = String(this.currentPage);
    this.updateSpreadVisibility();
    await this.renderNearby();
    const target = this.track.querySelector(`[data-page="${this.currentPage}"]`);
    if (target) target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center", inline: "center" });
    await this.saveProgress();
    this.status.textContent = `${this.pageStatus()} • ${this.readingTime()}`;
    this.dispatch("pagechange");
  }

  async nextPage() {
    await this.turnPage(1);
  }

  async prevPage() {
    await this.turnPage(-1);
  }

  async turnPage(direction, options = {}) {
    const step = this.settings.pageFlip === "realistic" ? 2 : 1;
    const targetPage = this.settings.pageFlip === "realistic"
      ? this.getSpreadStart(this.currentPage + direction * step)
      : clamp(this.currentPage + direction, 1, this.total);
    if (!this.pdf || targetPage === this.currentPage) return;

    const canAnimate = this.settings.pageFlip === "realistic" && !this.flipState && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canAnimate) {
      await this.goToPage(targetPage);
      return;
    }

    const prepared = await this.preparePageFlip(direction, targetPage);
    if (!prepared) {
      await this.goToPage(targetPage);
      return;
    }

    await this.animatePageFlip(prepared, {
      from: options.from ?? 0,
      to: 1,
      velocity: options.velocity ?? 0,
    });
    await this.goToPage(targetPage, false);
  }

  async preparePageFlip(direction, targetPage) {
    const spreadStart = this.getSpreadStart(this.currentPage);
    const flipPage = this.settings.pageFlip === "realistic"
      ? (direction > 0 ? Math.min(spreadStart + 1, this.total) : spreadStart)
      : this.currentPage;
    const backPage = this.settings.pageFlip === "realistic"
      ? (direction > 0 ? targetPage : Math.min(targetPage + 1, this.total))
      : targetPage;
    const underPage = this.settings.pageFlip === "realistic"
      ? (direction > 0 ? Math.min(targetPage + 1, this.total) : targetPage)
      : targetPage;
    const currentCard = this.track.querySelector(`[data-page="${flipPage}"]`);
    if (!currentCard) return null;

    const [frontCanvas, backCanvas, underCanvas] = await Promise.all([
      this.getRenderedCanvas(flipPage),
      this.getRenderedCanvas(backPage),
      this.getRenderedCanvas(underPage),
    ]);
    if (!frontCanvas || !backCanvas || !underCanvas) return null;

    const shellRect = this.shell.getBoundingClientRect();
    const cardRect = currentCard.getBoundingClientRect();
    const layer = document.createElement("div");
    layer.className = `page-flip-layer ${direction > 0 ? "flip-next" : "flip-prev"}`;
    layer.style.left = `${cardRect.left - shellRect.left + this.shell.scrollLeft}px`;
    layer.style.top = `${cardRect.top - shellRect.top + this.shell.scrollTop}px`;
    layer.style.width = `${cardRect.width}px`;
    layer.style.height = `${cardRect.height}px`;

    const under = document.createElement("div");
    under.className = "flip-under-page";
    under.append(this.cloneCanvas(underCanvas));

    const sheet = document.createElement("div");
    sheet.className = "flip-sheet";
    const front = document.createElement("div");
    front.className = "flip-face flip-front";
    front.append(this.cloneCanvas(frontCanvas));
    const back = document.createElement("div");
    back.className = "flip-face flip-back";
    back.append(this.cloneCanvas(backCanvas));
    sheet.append(front, back);

    const spine = document.createElement("div");
    spine.className = "flip-spine-shadow";
    const shadow = document.createElement("div");
    shadow.className = "flip-drop-shadow";
    const highlight = document.createElement("div");
    highlight.className = "flip-fold-highlight";
    const curl = document.createElement("div");
    curl.className = "flip-curl";
    sheet.append(highlight, curl);
    layer.append(under, shadow, sheet, spine);
    this.shell.append(layer);
    currentCard.classList.add("page-is-flipping");

    this.flipState = { layer, sheet, shadow, highlight, curl, currentCard, direction };
    this.updateFlipProgress(0, direction);
    return this.flipState;
  }

  cloneCanvas(source) {
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    canvas.style.width = source.style.width;
    canvas.style.height = source.style.height;
    const context = canvas.getContext("2d", { alpha: false });
    context.drawImage(source, 0, 0);
    return canvas;
  }

  updateFlipProgress(progress, direction) {
    if (!this.flipState) return;
    const eased = clamp(progress, 0, 1);
    const angle = direction > 0 ? -180 * eased : 180 * eased;
    const curve = Math.sin(eased * Math.PI);
    const lift = curve * 16;
    const skew = (direction > 0 ? -1 : 1) * curve * 5.5;
    const shadowStrength = 0.14 + curve * 0.48;
    const blur = 12 + curve * 32;
    this.flipState.layer.style.setProperty("--flip-progress", String(eased));
    this.flipState.layer.style.setProperty("--flip-shadow", String(shadowStrength));
    this.flipState.layer.style.setProperty("--flip-blur", `${blur}px`);
    this.flipState.sheet.style.transform = `translate3d(0, ${-lift}px, 0) rotateY(${angle}deg) skewY(${skew}deg)`;
    this.flipState.highlight.style.opacity = String(0.18 + curve * 0.5);
    this.flipState.curl.style.opacity = String(0.18 + curve * 0.42);
    this.flipState.shadow.style.opacity = String(shadowStrength);
    this.flipState.shadow.style.transform = `translateY(${lift * 0.45}px) scaleX(${1 - curve * 0.18})`;
  }

  animatePageFlip(state, { from, to, velocity = 0 }) {
    return new Promise((resolve) => {
      const distance = Math.abs(to - from);
      const velocityBoost = Math.min(Math.abs(velocity) / 1600, 0.45);
      const duration = clamp((520 - velocityBoost * 240) * distance, 260, 700) / (this.settings.animationSpeed / 100);
      const started = performance.now();
      const direction = state.direction;

      const step = (now) => {
        const elapsed = now - started;
        const t = clamp(elapsed / duration, 0, 1);
        const spring = 1 - Math.pow(1 - t, 3) + Math.sin(t * Math.PI) * 0.035;
        const progress = from + (to - from) * clamp(spring, 0, 1);
        this.updateFlipProgress(progress, direction);
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          this.finishFlipLayer();
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  finishFlipLayer() {
    if (!this.flipState) return;
    this.flipState.currentCard.classList.remove("page-is-flipping");
    this.flipState.layer.remove();
    this.flipState = null;
  }

  async cancelFlip(state, progress, velocity = 0) {
    await this.animatePageFlip(state, { from: progress, to: 0, velocity });
  }

  bindPageFlipInteractions() {
    this.shell.addEventListener("click", (event) => {
      if (!this.shouldUseBookFlip(event) || this.dragState) return;
      const card = event.target.closest?.(".page-card");
      if (!card) return;
      const pageNumber = Number(card.dataset.page);
      if (this.settings.pageFlip === "realistic" && !this.isSpreadPage(pageNumber)) return;
      const rect = card.getBoundingClientRect();
      const edge = Math.min(96, rect.width * 0.22);
      if (event.clientX > rect.right - edge && pageNumber === Math.min(this.currentPage + 1, this.total)) void this.turnPage(1);
      if (event.clientX < rect.left + edge && pageNumber === this.currentPage) void this.turnPage(-1);
    });

    this.shell.addEventListener("pointerdown", (event) => {
      if (!this.shouldUseBookFlip(event) || event.pointerType === "touch" && event.isPrimary === false) return;
      const card = event.target.closest?.(".page-card");
      if (!card) return;
      const pageNumber = Number(card.dataset.page);
      if (this.settings.pageFlip === "realistic" && !this.isSpreadPage(pageNumber)) return;
      const rect = card.getBoundingClientRect();
      const edge = Math.min(120, rect.width * 0.28);
      const nearRight = event.clientX > rect.right - edge;
      const nearLeft = event.clientX < rect.left + edge;
      const nearCorner = event.clientY < rect.top + rect.height * 0.3 || event.clientY > rect.bottom - rect.height * 0.3;
      if (!nearCorner && !nearLeft && !nearRight) return;
      const direction = nearRight && pageNumber === Math.min(this.currentPage + 1, this.total) ? 1 : nearLeft && pageNumber === this.currentPage ? -1 : 0;
      if (!direction) return;
      const targetPage = this.getSpreadStart(this.currentPage + direction * 2);
      if (targetPage === this.currentPage) return;
      event.preventDefault();
      this.startFlipDrag(event, direction, targetPage, rect);
    }, { passive: false });
  }

  shouldUseBookFlip(event) {
    return this.pdf && this.settings.pageFlip === "realistic" && !this.flipState && Date.now() > this.suppressFlipClickUntil && !(event.ctrlKey || event.metaKey);
  }

  async startFlipDrag(event, direction, targetPage, rect) {
    const state = await this.preparePageFlip(direction, targetPage);
    if (!state) return;
    this.dragState = {
      direction,
      targetPage,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      width: Math.max(1, rect.width),
      progress: 0,
      pointerId: event.pointerId,
    };
    this.shell.setPointerCapture?.(event.pointerId);

    const move = (moveEvent) => this.updateFlipDrag(moveEvent);
    const finish = (upEvent) => {
      this.shell.removeEventListener("pointermove", move);
      this.shell.removeEventListener("pointerup", finish);
      this.shell.removeEventListener("pointercancel", finish);
      void this.finishFlipDrag(upEvent);
    };

    this.shell.addEventListener("pointermove", move, { passive: false });
    this.shell.addEventListener("pointerup", finish);
    this.shell.addEventListener("pointercancel", finish);
  }

  updateFlipDrag(event) {
    if (!this.dragState) return;
    event.preventDefault();
    const now = performance.now();
    const deltaX = event.clientX - this.dragState.lastX;
    const elapsed = Math.max(1, now - this.dragState.lastTime);
    this.dragState.velocity = deltaX / elapsed * 1000;
    this.dragState.lastX = event.clientX;
    this.dragState.lastTime = now;
    const travel = this.dragState.direction > 0 ? this.dragState.startX - event.clientX : event.clientX - this.dragState.startX;
    const progress = clamp(travel / (this.dragState.width * 0.72), 0, 1);
    this.dragState.progress = progress;
    this.updateFlipProgress(progress, this.dragState.direction);
  }

  async finishFlipDrag(event) {
    if (!this.dragState || !this.flipState) return;
    const drag = this.dragState;
    this.dragState = null;
    this.suppressFlipClickUntil = Date.now() + 450;
    this.shell.releasePointerCapture?.(drag.pointerId);
    const momentum = drag.direction > 0 ? -drag.velocity : drag.velocity;
    const shouldComplete = drag.progress > 0.5 || momentum > 650;
    if (shouldComplete) {
      await this.animatePageFlip(this.flipState, { from: drag.progress, to: 1, velocity: momentum });
      await this.goToPage(drag.targetPage, false);
    } else {
      await this.cancelFlip(this.flipState, drag.progress, momentum);
    }
  }

  async zoomBy(delta) {
    this.scale = clamp(this.scale + delta, 0.35, 4);
    this.zoomLabel.textContent = `${Math.round(this.scale * 100)}%`;
    await this.rerenderVisible();
  }

  async setFitMode(mode) {
    this.settings.fitMode = mode;
    await this.rerenderVisible();
  }

  async rotate() {
    this.rotation = (this.rotation + 90) % 360;
    await this.rerenderVisible();
  }

  async extractText(pageNumber) {
    if (this.textCache.has(pageNumber)) return this.textCache.get(pageNumber);
    const page = await this.pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ");
    this.textCache.set(pageNumber, text);
    return text;
  }

  async saveProgress() {
    if (!this.documentId) return;
    const existing = await storage.get("documents", this.documentId);
    await storage.set("documents", {
      ...(existing || {}),
      id: this.documentId,
      name: this.file.name,
      size: this.file.size,
      lastModified: this.file.lastModified,
      lastPage: this.currentPage,
      totalPages: this.total,
      updatedAt: Date.now(),
    });
  }

  async restoreLastPage() {
    const doc = await storage.get("documents", this.documentId);
    return doc?.lastPage || 1;
  }

  async saveRecent() {
    await storage.set("recent", {
      id: this.documentId,
      name: this.file.name,
      size: this.file.size,
      lastPage: this.currentPage,
      totalPages: this.total,
      updatedAt: Date.now(),
    });
  }

  download() {
    if (!this.fileBuffer || !this.file) return;
    const blob = new Blob([this.fileBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = this.file.name;
    link.click();
    URL.revokeObjectURL(url);
  }

  print() {
    if (!this.fileBuffer) return;
    const blob = new Blob([this.fileBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const frame = document.createElement("iframe");
    frame.hidden = true;
    frame.src = url;
    document.body.append(frame);
    frame.onload = () => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
        frame.remove();
      }, 1000);
    };
  }

  setProgress(value) {
    this.progress.style.width = `${clamp(value, 0, 100)}%`;
  }

  readingTime() {
    const elapsed = Date.now() - this.startedAt;
    const minutes = Math.max(1, Math.round(elapsed / 60000));
    return `${minutes} min reading`;
  }

  getSpreadStart(pageNumber) {
    const page = clamp(Number(pageNumber) || 1, 1, this.total);
    return page % 2 === 0 ? Math.max(1, page - 1) : page;
  }

  isSpreadPage(pageNumber) {
    return pageNumber === this.currentPage || pageNumber === Math.min(this.currentPage + 1, this.total);
  }

  updateSpreadVisibility() {
    const bookMode = this.settings.pageFlip === "realistic";
    this.track.querySelectorAll(".page-card").forEach((card) => {
      const pageNumber = Number(card.dataset.page);
      const visible = !bookMode || this.isSpreadPage(pageNumber);
      card.classList.toggle("spread-visible", visible);
      card.setAttribute("aria-hidden", visible ? "false" : "true");
    });
  }

  pageStatus() {
    if (this.settings.pageFlip !== "realistic") {
      return `Page ${this.currentPage} of ${this.total}`;
    }
    const rightPage = Math.min(this.currentPage + 1, this.total);
    const label = rightPage === this.currentPage ? `Page ${this.currentPage}` : `Pages ${this.currentPage}-${rightPage}`;
    return `${label} of ${this.total}`;
  }

  dispatch(name) {
    document.dispatchEvent(new CustomEvent(`reader:${name}`, { detail: this }));
  }
}
