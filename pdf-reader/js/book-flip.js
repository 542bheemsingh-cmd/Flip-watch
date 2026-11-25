/**
 * BookFlip — a small, self-contained realistic page-flip engine.
 *
 * Why this exists: the previous integration leaned on StPageFlip, whose
 * geometry is derived from the container width and whose internal DOM moves
 * fought our own layout, so flips flickered or snapped. This engine owns the
 * whole thing: two static page faces plus one turning sheet with a front and a
 * back, animated with a plain CSS 3D transform. Deterministic, no surprises.
 *
 * Layout:
 *
 *   [ left face ][ right face ]      <- static spread
 *              [ sheet ]             <- only while turning
 *
 * Next: the sheet sits on the right page, front = current right page,
 * back = the next left page; it rotates -180deg around the spine.
 * Prev: mirrored — the sheet sits on the left page and rotates +180deg.
 */

const CACHE_LIMIT = 48;

export class BookFlip {
  constructor(host, options) {
    this.host = host;
    this.getPageCanvas = options.getPageCanvas;
    this.getTotal = options.getTotal;
    this.getFlipMs = options.getFlipMs;
    this.onSpreadChange = options.onSpreadChange || (() => {});

    this.pageWidth = 300;
    this.pageHeight = 400;
    this.spreadStart = 1;
    this.turning = false;
    this.singlePage = false;

    this.root = document.createElement("div");
    this.root.className = "book-engine";
    this.root.setAttribute("aria-hidden", "true");
    this.root.innerHTML = `
      <div class="book-face book-face--left"><canvas></canvas></div>
      <div class="book-face book-face--right"><canvas></canvas></div>
      <div class="book-sheet">
        <div class="book-sheet__face book-sheet__face--front"><canvas></canvas></div>
        <div class="book-sheet__face book-sheet__face--back"><canvas></canvas></div>
      </div>
    `;
    host.append(this.root);

    this.leftCanvas = this.root.querySelector(".book-face--left canvas");
    this.rightCanvas = this.root.querySelector(".book-face--right canvas");
    this.sheet = this.root.querySelector(".book-sheet");
    this.frontCanvas = this.root.querySelector(".book-sheet__face--front canvas");
    this.backCanvas = this.root.querySelector(".book-sheet__face--back canvas");
  }

  setSize(width, height) {
    this.pageWidth = Math.max(80, Math.round(width));
    this.pageHeight = Math.max(80, Math.round(height));
    this.root.style.setProperty("--pw", `${this.pageWidth}px`);
    this.root.style.setProperty("--ph", `${this.pageHeight}px`);
  }

  setSinglePage(single) {
    this.singlePage = Boolean(single);
    this.root.classList.toggle("is-single", this.singlePage);
  }

  destroy() {
    this.root.remove();
  }

  async paint(canvas, pageNumber) {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.round(this.pageWidth * dpr);
    const height = Math.round(this.pageHeight * dpr);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const source = await this.getPageCanvas(pageNumber, this.pageWidth, this.pageHeight);
    if (!source) return;

    const scale = Math.min(canvas.width / source.width, canvas.height / source.height);
    const drawWidth = source.width * scale;
    const drawHeight = source.height * scale;
    ctx.drawImage(source, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
  }

  async renderSpread(start) {
    const total = this.getTotal();
    this.spreadStart = Math.max(1, start);
    const leftPage = this.singlePage ? this.spreadStart : this.spreadStart;
    const rightPage = this.singlePage ? null : this.spreadStart + 1;

    await Promise.all([
      this.paint(this.leftCanvas, leftPage),
      rightPage && rightPage <= total ? this.paint(this.rightCanvas, rightPage) : this.clear(this.rightCanvas),
    ]);
    this.root.classList.toggle("has-right", Boolean(rightPage && rightPage <= total));
  }

  clear(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  canNext() {
    const total = this.getTotal();
    return this.spreadStart + 2 <= total;
  }

  canPrev() {
    return this.spreadStart > 1;
  }

  wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async next() {
    if (this.turning || !this.canNext()) return false;
    this.turning = true;
    const total = this.getTotal();
    const start = this.spreadStart;

    // The sheet shows the current right page turning; the back shows the next
    // left page. Underneath, the right slot already shows the page after that.
    this.root.style.setProperty("--flip-ms", `${this.getFlipMs()}ms`);
    this.sheet.className = "book-sheet book-sheet--next";
    await Promise.all([
      this.paint(this.frontCanvas, start + 1),
      this.paint(this.backCanvas, Math.min(start + 2, total)),
      start + 3 <= total ? this.paint(this.rightCanvas, start + 3) : this.clear(this.rightCanvas),
    ]);
    this.root.classList.add("is-turning");
    // Force a frame so the transform transition actually runs.
    void this.sheet.offsetWidth;
    this.sheet.classList.add("is-turning");

    await this.wait(this.getFlipMs());
    this.sheet.classList.remove("is-turning");
    this.root.classList.remove("is-turning");
    this.sheet.className = "book-sheet";

    this.spreadStart = start + 2;
    await this.renderSpread(this.spreadStart);
    this.turning = false;
    this.onSpreadChange(this.spreadStart);
    return true;
  }

  async prev() {
    if (this.turning || !this.canPrev()) return false;
    this.turning = true;
    const start = this.spreadStart;

    this.root.style.setProperty("--flip-ms", `${this.getFlipMs()}ms`);
    this.sheet.className = "book-sheet book-sheet--prev";
    await Promise.all([
      this.paint(this.frontCanvas, start),
      this.paint(this.backCanvas, Math.max(start - 1, 1)),
      start - 2 >= 1 ? this.paint(this.leftCanvas, start - 2) : this.clear(this.leftCanvas),
    ]);
    this.root.classList.add("is-turning");
    void this.sheet.offsetWidth;
    this.sheet.classList.add("is-turning");

    await this.wait(this.getFlipMs());
    this.sheet.classList.remove("is-turning");
    this.root.classList.remove("is-turning");
    this.sheet.className = "book-sheet";

    this.spreadStart = Math.max(1, start - 2);
    await this.renderSpread(this.spreadStart);
    this.turning = false;
    this.onSpreadChange(this.spreadStart);
    return true;
  }
}

/** Renders PDF pages into cached offscreen canvases at a fixed box size. */
export class BookPagePainter {
  constructor(getPdf, getRotation) {
    this.getPdf = getPdf;
    this.getRotation = getRotation;
    this.cache = new Map();
  }

  clear() {
    this.cache.clear();
  }

  async get(pageNumber, width, height) {
    const pdf = this.getPdf();
    if (!pdf || pageNumber < 1) return null;
    const key = `${pageNumber}:${Math.round(width)}x${Math.round(height)}:${this.getRotation()}`;
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      // refresh LRU position
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached;
    }

    const page = await pdf.getPage(pageNumber);
    const base = page.getViewport({ scale: 1, rotation: this.getRotation() });
    const scale = Math.min(width / base.width, height / base.height);
    const viewport = page.getViewport({ scale, rotation: this.getRotation() });
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(viewport.width * dpr));
    canvas.height = Math.max(1, Math.round(viewport.height * dpr));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({
      canvasContext: ctx,
      viewport,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
    }).promise;

    this.cache.set(key, canvas);
    if (this.cache.size > CACHE_LIMIT) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    return canvas;
  }
}
