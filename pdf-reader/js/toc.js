import { createListButton } from "./utils.js";

export class TOCController {
  constructor(viewer, list) {
    this.viewer = viewer;
    this.list = list;
  }

  async render() {
    this.list.textContent = "";
    if (!this.viewer.pdf) return;

    const outline = await this.viewer.pdf.getOutline();
    if (!outline?.length) {
      this.list.innerHTML = `<div class="list-item"><strong>No table of contents</strong><small>This PDF does not expose outline data.</small></div>`;
      return;
    }

    for (const item of outline) {
      this.list.append(await this.createItem(item, 0));
    }
  }

  async createItem(item, depth) {
    const button = createListButton(item.title || "Untitled", "Jump to section");
    button.style.marginLeft = `${depth * 12}px`;
    button.addEventListener("click", async () => {
      try {
        const destination = Array.isArray(item.dest) ? item.dest : await this.viewer.pdf.getDestination(item.dest);
        const pageIndex = await this.viewer.pdf.getPageIndex(destination[0]);
        await this.viewer.goToPage(pageIndex + 1);
      } catch (error) {
        console.warn("[PDFReader] Could not open outline item", error);
      }
    });

    if (item.items?.length) {
      const wrapper = document.createElement("div");
      wrapper.append(button);
      for (const child of item.items) {
        wrapper.append(await this.createItem(child, depth + 1));
      }
      return wrapper;
    }

    return button;
  }
}
