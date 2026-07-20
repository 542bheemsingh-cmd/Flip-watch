import { storage } from "./storage.js";
import { addRipple, formatBytes } from "./utils.js";

export class ToolbarController {
  constructor(viewer, elements) {
    this.viewer = viewer;
    this.elements = elements;
    this.readingTimer = 0;
  }

  bind(actions) {
    document.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", addRipple);
    });

    this.elements.pageInput.addEventListener("change", () => this.viewer.goToPage(this.elements.pageInput.value));
    this.elements.pageSlider.addEventListener("input", () => this.viewer.goToPage(this.elements.pageSlider.value, false));

    Object.entries(actions).forEach(([name, handler]) => {
      document.querySelectorAll(`[data-action="${name}"]`).forEach((button) => {
        button.addEventListener("click", handler);
      });
    });

    window.addEventListener("keydown", (event) => this.handleKeys(event));
    this.startReadingTimer();
  }

  handleKeys(event) {
    if (event.target.matches("input, select")) return;
    if (event.key === "ArrowRight" || event.key === "PageDown") void this.viewer.nextPage();
    if (event.key === "ArrowLeft" || event.key === "PageUp") void this.viewer.prevPage();
    if (event.key === "+") void this.viewer.zoomBy(0.15);
    if (event.key === "-") void this.viewer.zoomBy(-0.15);
    if (event.key.toLowerCase() === "f") document.dispatchEvent(new CustomEvent("reader:fullscreen"));
    if (event.key.toLowerCase() === "u") document.dispatchEvent(new CustomEvent("reader:toggle-ui"));
  }

  async renderRecent(list) {
    const recents = (await storage.all("recent")).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 12);
    list.textContent = "";
    if (!recents.length) {
      list.innerHTML = `<div class="list-item"><strong>No recent PDFs</strong><small>Open a local PDF to start a history.</small></div>`;
      return;
    }
    recents.forEach((doc) => {
      const item = document.createElement("button");
      item.className = "list-item";
      item.innerHTML = `<strong>${doc.name}</strong><small>${formatBytes(doc.size)} • page ${doc.lastPage}/${doc.totalPages}</small>`;
      item.addEventListener("click", async () => {
        const saved = await storage.get("documents", doc.id);
        await this.viewer.loadStoredDocument(saved);
        await this.viewer.goToPage(doc.lastPage || 1);
      });
      list.append(item);
    });
  }

  startReadingTimer() {
    window.clearInterval(this.readingTimer);
    this.readingTimer = window.setInterval(() => {
      if (this.viewer.pdf) {
        this.viewer.status.textContent = `Page ${this.viewer.currentPage} of ${this.viewer.total} • ${this.viewer.readingTime()}`;
      }
    }, 30000);
  }
}
