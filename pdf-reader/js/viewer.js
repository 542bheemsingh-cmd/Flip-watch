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
    this.animationActive = false;
    this.deferredRenderPages = new Set();
    this.suppressFlipClickUntil = 0;
    this.bookPageRatio = null;
    this.bookPageBaseWidth = null;
    this.bookPageBox = null;
    this.bookPageBoxKey = "";
    this.visibleSpreadPages = new Set();
    this.visibleObserver = new IntersectionObserver((entries) => this.onVisible(entries), {
      root: this.shell,
      rootMargin: "900px 0px",
      threshold: 0.01,
    });
    this.createReusableFlipLayer();
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
    await this.initializeBookMetrics();
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

  async initializeBookMetrics() {
    if (!this.pdf) return;
    const firstPage = await this.pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 1, rotation: this.rotation });
    this.bookPageRatio = viewport.height / viewport.width;
    this.bookPageBaseWidth = viewport.width;
    this.bookPageBox = this.computeBookPageBoxFromShell();
    this.bookPageBoxKey = this.getBookPageBoxKey();
    this.applyBookPageBoxVars();
  }

  buildPlaceholders() {
    this.track.textContent = "";
    this.visibleSpreadPages.clear();
    for (let pageNumber = 1; pageNumber <= this.total; pageNumber += 1) {
      const page = document.createElement("article");
      page.className = "page-card loading";
      page.dataset.page = String(pageNumber);
      page.setAttribute("aria-label", `Page ${pageNumber}`);
      const canvas = document.createElement("canvas");
      canvas.className = "page-canvas";
      const pill = document.createElement("span");
      pill.className = "page-number-pill";
      pill.textContent = String(pageNumber);
      page.append(canvas, pill);
      this.track.append(page);
      this.visibleObserver.observe(page);
    }
  }

  createReusableFlipLayer() {
    const layer = document.createElement("div");
    layer.className = "page-flip-layer is-idle";

    const under = document.createElement("div");
    under.className = "flip-under-page";
    const underCanvas = document.createElement("canvas");
    under.append(underCanvas);

    const sheet = document.createElement("div");
    sheet.className = "flip-sheet";
    const front = document.createElement("div");
    front.className = "flip-face flip-front";
    const frontCanvas = document.createElement("canvas");
    front.append(frontCanvas);
    const back = document.createElement("div");
    back.className = "flip-face flip-back";
    const backCanvas = document.createElement("canvas");
    back.append(backCanvas);

    const highlight = document.createElement("div");
    highlight.className = "flip-fold-highlight";
    const curl = document.createElement("div");
    curl.className = "flip-curl";
    sheet.append(front, back, highlight, curl);

    const spine = document.createElement("div");
    spine.className = "flip-spine-shadow";
    const shadow = document.createElement("div");
    shadow.className = "flip-drop-shadow";
    layer.append(under, shadow, sheet, spine);
    this.shell.append(layer);

    this.flipDom = { layer, sheet, shadow, highlight, curl, underCanvas, frontCanvas, backCanvas };
  }

  applyMode() {
    const bookMode = this.settings.pageFlip === "realistic";
    const layoutMode = bookMode ? "horizontal" : this.settings.scrollMode;
    this.track.className = `page-track ${layoutMode}${bookMode ? " book-layout" : ""}`;
    this.shell.classList.toggle("book-reader", bookMode);
    this.shell.style.direction = this.settings.direction === "rtl" ? "rtl" : "ltr";
    this.zoomLabel.textContent = `${Math.round(this.scale * 100)}%`;
    this.syncAllSpreadVisibility();
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
    if (this.animationActive && this.settings.pageFlip === "realistic") {
      this.deferredRenderPages.add(pageNumber);
      return;
    }
    const container = this.track.querySelector(`[data-page="${pageNumber}"]`);
    if (!container) return;

    this.rendering.add(pageNumber);
    try {
      const page = await this.pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1, rotation: this.rotation });
      if (this.settings.pageFlip === "realistic") {
        await this.renderBookPage(page, baseViewport, container, pageNumber);
        return;
      }

      const fitScale = this.computeFitScale(baseViewport);
      const outputScale = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: fitScale * this.scale, rotation: this.rotation });
      const canvas = container.querySelector("canvas");
      const context = canvas.getContext("2d", { alpha: false });

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

      container.style.width = `${Math.floor(viewport.width)}px`;
      container.style.height = `${Math.floor(viewport.height)}px`;
      container.classList.toggle("page-turn", this.settings.pageFlip !== "realistic");

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

  hasRenderedSpread(spreadStart) {
    return this.rendered.has(spreadStart) && (spreadStart >= this.total || this.rendered.has(spreadStart + 1));
  }

  async renderBookPage(page, baseViewport, container, pageNumber) {
    const box = this.computeBookPageBox(baseViewport);
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);
    const contentScale = Math.min(box.width / baseViewport.width, box.height / baseViewport.height);
    const viewport = page.getViewport({ scale: contentScale, rotation: this.rotation });
    const canvas = container.querySelector("canvas");
    const context = canvas.getContext("2d", { alpha: false });

    canvas.width = Math.floor(box.width * outputScale);
    canvas.height = Math.floor(box.height * outputScale);
    canvas.style.width = `${Math.floor(box.width)}px`;
    canvas.style.height = `${Math.floor(box.height)}px`;
    context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
    context.fillStyle = "#fff";
    context.fillRect(0, 0, box.width, box.height);

    const offsetX = Math.max(0, (box.width - viewport.width) / 2);
    const offsetY = Math.max(0, (box.height - viewport.height) / 2);

    container.style.width = `${Math.floor(box.width)}px`;
    container.style.height = `${Math.floor(box.height)}px`;
    container.classList.remove("page-turn");

    await page.render({
      canvasContext: context,
      viewport,
      transform: [1, 0, 0, 1, offsetX, offsetY],
    }).promise;
    container.classList.remove("loading");
    this.rendered.set(pageNumber, canvas);
  }

  computeBookPageBox(baseViewport) {
    if (this.bookPageBox) {
      this.applyBookPageBoxVars();
      return this.bookPageBox;
    }

    if (!this.bookPageRatio) {
      this.bookPageRatio = baseViewport.height / baseViewport.width;
    }
    if (!this.bookPageBaseWidth) {
      this.bookPageBaseWidth = baseViewport.width;
    }

    const key = this.getBookPageBoxKey();
    this.bookPageBox = this.computeBookPageBoxFromShell();
    this.bookPageBoxKey = key;
    this.applyBookPageBoxVars();
    return this.bookPageBox;
  }

  applyBookPageBoxVars() {
    if (!this.bookPageBox) return;
    this.track.style.setProperty("--book-page-width", `${Math.round(this.bookPageBox.width)}px`);
    this.track.style.setProperty("--book-page-height", `${Math.round(this.bookPageBox.height)}px`);
  }

  getBookPageBoxKey() {
    const shellRect = this.shell.getBoundingClientRect();
    const maxWidth = Math.max(180, ((shellRect.width - 64) / 2) * this.scale);
    const maxHeight = Math.max(260, (shellRect.height - 36) * this.scale);
    return `${Math.round(maxWidth)}:${Math.round(maxHeight)}:${this.settings.fitMode}:${this.rotation}:${this.scale.toFixed(3)}:${(this.bookPageRatio || 0).toFixed(4)}:${Math.round(this.bookPageBaseWidth || 0)}`;
  }

  computeBookPageBoxFromShell() {
    const shellRect = this.shell.getBoundingClientRect();
    const maxWidth = Math.max(180, ((shellRect.width - 64) / 2) * this.scale);
    const maxHeight = Math.max(260, (shellRect.height - 36) * this.scale);
    if (this.settings.fitMode === "free") {
      return {
        width: Math.min(maxWidth, this.bookPageBaseWidth),
        height: Math.min(maxHeight, this.bookPageBaseWidth * this.bookPageRatio),
      };
    }

    const widthScale = maxWidth / this.bookPageBaseWidth;
    const heightScale = maxHeight / (this.bookPageBaseWidth * this.bookPageRatio);
    const fitScale = this.settings.fitMode === "page" ? Math.min(widthScale, heightScale) : widthScale;
    const width = Math.max(180, this.bookPageBaseWidth * fitScale);
    return {
      width,
      height: Math.min(maxHeight, width * this.bookPageRatio),
    };
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
    this.bookPageBox = null;
    this.bookPageBoxKey = "";
    this.track.querySelectorAll(".page-card").forEach((card) => {
      card.className = "page-card loading";
      const canvas = card.querySelector("canvas");
      if (canvas) {
        const context = canvas.getContext("2d");
        context?.clearRect(0, 0, canvas.width, canvas.height);
      }
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
    if (this.animationActive && this.settings.pageFlip === "realistic") {
      const spreadStart = this.getSpreadStart(this.currentPage);
      for (let page = Math.max(1, spreadStart - 2); page <= Math.min(this.total, spreadStart + 5); page += 1) {
        this.deferredRenderPages.add(page);
      }
      return;
    }

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

  async renderCurrentSpread() {
    const spreadStart = this.getSpreadStart(this.currentPage);
    await Promise.all([
      this.renderPage(spreadStart),
      spreadStart < this.total ? this.renderPage(spreadStart + 1) : Promise.resolve(),
    ]);
  }

  renderNearbyInBackground() {
    if (!this.pdf) return;
    window.requestIdleCallback?.(() => void this.renderNearby()) ?? window.setTimeout(() => void this.renderNearby(), 80);
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

    this.animationActive = true;
    try {
      await this.animatePageFlip(prepared, {
        from: options.from ?? 0,
        to: 1,
        velocity: options.velocity ?? 0,
      });
      await this.commitSpreadAfterFlip(targetPage);
    } finally {
      this.animationActive = false;
      this.flushDeferredRenders();
    }
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
    const {
      layer,
      sheet,
      shadow,
      highlight,
      curl,
      underCanvas: reusableUnderCanvas,
      frontCanvas: reusableFrontCanvas,
      backCanvas: reusableBackCanvas,
    } = this.flipDom;
    layer.className = `page-flip-layer ${direction > 0 ? "flip-next" : "flip-prev"}`;
    layer.style.left = `${cardRect.left - shellRect.left + this.shell.scrollLeft}px`;
    layer.style.top = `${cardRect.top - shellRect.top + this.shell.scrollTop}px`;
    layer.style.width = `${cardRect.width}px`;
    layer.style.height = `${cardRect.height}px`;

    this.copyCanvas(frontCanvas, reusableFrontCanvas);
    this.copyCanvas(backCanvas, reusableBackCanvas);
    this.copyCanvas(underCanvas, reusableUnderCanvas);
    currentCard.classList.add("page-is-flipping");

    this.flipState = { layer, sheet, shadow, highlight, curl, currentCard, direction };
    this.updateFlipProgress(0, direction);
    return this.flipState;
  }

  copyCanvas(source, target) {
    if (target.width !== source.width) target.width = source.width;
    if (target.height !== source.height) target.height = source.height;
    target.style.width = source.style.width;
    target.style.height = source.style.height;
    const context = target.getContext("2d", { alpha: false });
    context.clearRect(0, 0, target.width, target.height);
    context.drawImage(source, 0, 0);
  }

  updateFlipProgress(progress, direction) {
    if (!this.flipState) return;
    this.flipState.sheet.style.transform = this.pageFlipTransform(progress, direction);
  }

  pageFlipTransform(progress, direction) {
    const eased = clamp(progress, 0, 1);
    const angle = direction > 0 ? -180 * eased : 180 * eased;
    const curve = Math.sin(eased * Math.PI);
    const lift = curve * 18;
    const drift = (direction > 0 ? -1 : 1) * curve * 5;
    const skew = (direction > 0 ? -1 : 1) * curve * 4.2;
    return `translate3d(${drift}px, ${-lift}px, 0) rotateY(${angle}deg) skewY(${skew}deg)`;
  }

  easePageTurn(t, completing) {
    const smooth = t * t * (3 - 2 * t);
    const gravity = completing ? 1 - Math.pow(1 - t, 2.65) : Math.pow(t, 2.1);
    return clamp(gravity * 0.74 + smooth * 0.26, 0, 1);
  }

  animatePageFlip(state, { from, to, velocity = 0 }) {
    const distance = Math.abs(to - from);
    const velocityBoost = Math.min(Math.abs(velocity) / 1600, 0.45);
    const duration = clamp((620 - velocityBoost * 260) * distance, 300, 760) / (this.settings.animationSpeed / 100);
    const direction = state.direction;
    const mid = from + (to - from) * 0.58;
    const animation = state.sheet.animate([
      { transform: this.pageFlipTransform(from, direction), offset: 0 },
      { transform: this.pageFlipTransform(mid, direction), offset: 0.58 },
      { transform: this.pageFlipTransform(to, direction), offset: 1 },
    ], {
      duration,
      easing: to > from ? "cubic-bezier(0.18, 0.72, 0.2, 1)" : "cubic-bezier(0.25, 0.1, 0.25, 1)",
      fill: "forwards",
    });
    return animation.finished.then(() => {
      state.sheet.style.transform = this.pageFlipTransform(to, direction);
      animation.cancel();
    });
  }

  finishFlipLayer() {
    if (!this.flipState) return;
    this.flipState.currentCard.classList.remove("page-is-flipping");
    this.flipState.layer.className = "page-flip-layer is-idle";
    this.flipState = null;
  }

  async commitSpreadAfterFlip(targetPage) {
    await this.showPageAfterFlip(targetPage);
    await this.nextFrame();
    await this.nextFrame();
    this.finishFlipLayer();
  }

  async showPageAfterFlip(pageNumber) {
    this.currentPage = this.settings.pageFlip === "realistic" ? this.getSpreadStart(pageNumber) : clamp(Number(pageNumber) || 1, 1, this.total);
    this.pageInput.value = String(this.currentPage);
    this.pageSlider.value = String(this.currentPage);
    this.updateSpreadVisibility();
    if (!this.hasRenderedSpread(this.currentPage)) {
      await this.renderCurrentSpread();
    }
    const target = this.track.querySelector(`[data-page="${this.currentPage}"]`);
    if (target && this.settings.pageFlip !== "realistic") target.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
    this.status.textContent = `${this.pageStatus()} • ${this.readingTime()}`;
    this.dispatch("pagechange");
    this.renderNearbyInBackground();
    void this.saveProgress();
  }

  flushDeferredRenders() {
    if (!this.deferredRenderPages.size || !this.pdf) return;
    const pages = Array.from(this.deferredRenderPages).filter((page) => !this.rendered.has(page));
    this.deferredRenderPages.clear();
    const renderNext = () => {
      const page = pages.shift();
      if (!page) return;
      void this.renderPage(page).finally(() => {
        window.requestIdleCallback?.(renderNext) ?? window.setTimeout(renderNext, 40);
      });
    };
    window.requestIdleCallback?.(renderNext) ?? window.setTimeout(renderNext, 40);
  }

  nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async fadeOutFlipLayer() {
    if (!this.flipState) return;
    this.flipState.layer.classList.add("flip-settling");
    await this.wait(150);
    this.finishFlipLayer();
  }

  async cancelFlip(state, progress, velocity = 0) {
    this.animationActive = true;
    try {
      await this.animatePageFlip(state, { from: progress, to: 0, velocity });
      this.finishFlipLayer();
    } finally {
      this.animationActive = false;
      this.flushDeferredRenders();
    }
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
    this.animationActive = true;
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
      this.animationActive = true;
      try {
        await this.animatePageFlip(this.flipState, { from: drag.progress, to: 1, velocity: momentum });
        await this.commitSpreadAfterFlip(drag.targetPage);
      } finally {
        this.animationActive = false;
        this.flushDeferredRenders();
      }
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
    this.bookPageRatio = null;
    this.bookPageBaseWidth = null;
    this.bookPageBox = null;
    this.bookPageBoxKey = "";
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
    if (!bookMode) {
      this.track.querySelectorAll(".page-card").forEach((card) => {
        card.classList.add("spread-visible");
        card.setAttribute("aria-hidden", "false");
      });
      this.visibleSpreadPages.clear();
      return;
    }

    const nextVisible = new Set([this.currentPage, Math.min(this.currentPage + 1, this.total)]);
    const pagesToTouch = new Set([...this.visibleSpreadPages, ...nextVisible]);
    pagesToTouch.forEach((pageNumber) => {
      const card = this.track.querySelector(`[data-page="${pageNumber}"]`);
      if (!card) return;
      const visible = nextVisible.has(pageNumber);
      card.classList.toggle("spread-visible", visible);
      card.setAttribute("aria-hidden", visible ? "false" : "true");
    });
    this.visibleSpreadPages = nextVisible;
  }

  syncAllSpreadVisibility() {
    const bookMode = this.settings.pageFlip === "realistic";
    this.track.querySelectorAll(".page-card").forEach((card) => {
      const pageNumber = Number(card.dataset.page);
      const visible = !bookMode || this.isSpreadPage(pageNumber);
      card.classList.toggle("spread-visible", visible);
      card.setAttribute("aria-hidden", visible ? "false" : "true");
    });
    this.visibleSpreadPages = bookMode
      ? new Set([this.currentPage, Math.min(this.currentPage + 1, this.total)])
      : new Set();
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
