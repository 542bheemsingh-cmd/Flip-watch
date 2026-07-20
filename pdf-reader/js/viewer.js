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
    this.visibleObserver = new IntersectionObserver((entries) => this.onVisible(entries), {
      root: this.shell,
      rootMargin: "900px 0px",
      threshold: 0.01,
    });
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
    this.track.className = `page-track ${this.settings.scrollMode}`;
    this.shell.style.direction = this.settings.direction === "rtl" ? "rtl" : "ltr";
    this.zoomLabel.textContent = `${Math.round(this.scale * 100)}%`;
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

  computeFitScale(viewport) {
    const shellRect = this.shell.getBoundingClientRect();
    const availableWidth = Math.max(220, shellRect.width - 36);
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
    await this.renderNearby();
  }

  async refreshLayout() {
    if (!this.pdf) return;
    await this.rerenderVisible();
    await this.goToPage(this.currentPage, false);
  }

  async renderNearby() {
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.total, this.currentPage + 3);
    await Promise.all(Array.from({ length: end - start + 1 }, (_, index) => this.renderPage(start + index)));
  }

  async goToPage(pageNumber, smooth = true) {
    if (!this.pdf) return;
    this.currentPage = clamp(Number(pageNumber) || 1, 1, this.total);
    this.pageInput.value = String(this.currentPage);
    this.pageSlider.value = String(this.currentPage);
    await this.renderNearby();
    const target = this.track.querySelector(`[data-page="${this.currentPage}"]`);
    if (target) target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center", inline: "center" });
    await this.saveProgress();
    this.status.textContent = `Page ${this.currentPage} of ${this.total} • ${this.readingTime()}`;
    this.dispatch("pagechange");
  }

  async nextPage() {
    await this.goToPage(this.currentPage + 1);
  }

  async prevPage() {
    await this.goToPage(this.currentPage - 1);
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

  dispatch(name) {
    document.dispatchEvent(new CustomEvent(`reader:${name}`, { detail: this }));
  }
}
