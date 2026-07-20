export class ThumbnailController {
  constructor(viewer, list) {
    this.viewer = viewer;
    this.list = list;
  }

  async render(limit = 80) {
    this.list.textContent = "";
    if (!this.viewer.pdf) return;

    const count = Math.min(this.viewer.total, limit);
    for (let pageNumber = 1; pageNumber <= count; pageNumber += 1) {
      const item = document.createElement("button");
      item.className = "thumb-item";
      item.innerHTML = `<strong>Page ${pageNumber}</strong><small>Tap to open</small>`;
      item.addEventListener("click", () => this.viewer.goToPage(pageNumber));
      this.list.append(item);
      void this.renderThumb(pageNumber, item);
    }

    if (this.viewer.total > limit) {
      const note = document.createElement("div");
      note.className = "list-item";
      note.innerHTML = `<strong>${this.viewer.total - limit} more pages</strong><small>Use the page slider for long PDFs.</small>`;
      this.list.append(note);
    }
  }

  async renderThumb(pageNumber, item) {
    try {
      const page = await this.viewer.pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 0.18 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: false });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      item.prepend(canvas);
    } catch (error) {
      console.warn("[PDFReader] Thumbnail failed", error);
    }
  }
}
