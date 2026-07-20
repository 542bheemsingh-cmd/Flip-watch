import { debounce } from "./utils.js";

export class SearchController {
  constructor(viewer, elements) {
    this.viewer = viewer;
    this.input = elements.input;
    this.results = elements.results;
    this.count = elements.count;
    this.matches = [];
    this.activeIndex = -1;
    this.input.addEventListener("input", debounce(() => this.search(this.input.value), 220));
  }

  async search(query) {
    const term = query.trim().toLowerCase();
    this.matches = [];
    this.activeIndex = -1;
    this.results.textContent = "";

    if (!term || !this.viewer.pdf) {
      this.count.textContent = "No search yet";
      return;
    }

    this.count.textContent = "Searching...";
    for (let page = 1; page <= this.viewer.total; page += 1) {
      const text = (await this.viewer.extractText(page)).toLowerCase();
      let index = text.indexOf(term);
      while (index !== -1) {
        this.matches.push({ page, index });
        index = text.indexOf(term, index + term.length);
      }
      if (page % 20 === 0) {
        this.count.textContent = `${this.matches.length} matches so far`;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    }

    this.count.textContent = `${this.matches.length} result${this.matches.length === 1 ? "" : "s"}`;
    this.renderResults();
    if (this.matches.length) await this.go(0);
  }

  renderResults() {
    this.results.textContent = "";
    this.matches.slice(0, 200).forEach((match, index) => {
      const button = document.createElement("button");
      button.className = "list-item";
      button.innerHTML = `<strong>Page ${match.page}</strong><small>Result ${index + 1}</small>`;
      button.addEventListener("click", () => this.go(index));
      this.results.append(button);
    });
  }

  async go(index) {
    if (!this.matches.length) return;
    this.activeIndex = (index + this.matches.length) % this.matches.length;
    const match = this.matches[this.activeIndex];
    this.count.textContent = `${this.activeIndex + 1} / ${this.matches.length}`;
    await this.viewer.goToPage(match.page);
    const card = this.viewer.track.querySelector(`[data-page="${match.page}"]`);
    card?.classList.add("search-hit");
    window.setTimeout(() => card?.classList.remove("search-hit"), 1200);
  }

  next() {
    return this.go(this.activeIndex + 1);
  }

  previous() {
    return this.go(this.activeIndex - 1);
  }
}
