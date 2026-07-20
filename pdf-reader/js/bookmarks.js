import { storage } from "./storage.js";

export class BookmarkController {
  constructor(viewer, list) {
    this.viewer = viewer;
    this.list = list;
  }

  key(page = this.viewer.currentPage) {
    return `${this.viewer.documentId}:${page}`;
  }

  async toggle() {
    if (!this.viewer.documentId) return;
    const id = this.key();
    const current = await storage.get("bookmarks", id);
    if (current) {
      await storage.delete("bookmarks", id);
    } else {
      await storage.set("bookmarks", {
        id,
        documentId: this.viewer.documentId,
        documentName: this.viewer.file.name,
        page: this.viewer.currentPage,
        createdAt: Date.now(),
      });
    }
    await this.render();
  }

  async render() {
    const all = await storage.all("bookmarks");
    const marks = all.filter((item) => item.documentId === this.viewer.documentId).sort((a, b) => a.page - b.page);
    this.list.textContent = "";
    if (!marks.length) {
      this.list.innerHTML = `<div class="list-item"><strong>No bookmarks</strong><small>Save important pages here.</small></div>`;
      return;
    }
    marks.forEach((mark) => {
      const button = document.createElement("button");
      button.className = "list-item";
      button.innerHTML = `<strong>Page ${mark.page}</strong><small>${mark.documentName}</small>`;
      button.addEventListener("click", () => this.viewer.goToPage(mark.page));
      this.list.append(button);
    });
  }
}
