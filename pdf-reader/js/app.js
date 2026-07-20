import { PDFViewer } from "./viewer.js";
import { SettingsController } from "./settings.js";
import { SearchController } from "./search.js";
import { BookmarkController } from "./bookmarks.js";
import { ThumbnailController } from "./thumbnails.js";
import { TOCController } from "./toc.js";
import { ToolbarController } from "./toolbar.js";
import { GestureController } from "./gestures.js";
import { $, $$ } from "./utils.js";

const settings = new SettingsController();
await settings.load();

const viewer = new PDFViewer({
  stage: $("[data-reader-stage]"),
  shell: $("[data-viewer-shell]"),
  track: $("[data-page-track]"),
  dropZone: $("[data-drop-zone]"),
  progress: $("[data-load-progress]"),
  docTitle: $("[data-doc-title]"),
  status: $("[data-reading-status]"),
  pageInput: $("[data-page-input]"),
  pageSlider: $("[data-page-slider]"),
  totalPages: $("[data-total-pages]"),
  zoomLabel: $("[data-zoom-label]"),
}, settings.settings);

const bookmarks = new BookmarkController(viewer, $("[data-bookmarks]"));
const thumbnails = new ThumbnailController(viewer, $("[data-thumbnails]"));
const toc = new TOCController(viewer, $("[data-toc]"));
const search = new SearchController(viewer, {
  input: $("[data-search-input]"),
  results: $("[data-search-results]"),
  count: $("[data-search-count]"),
});
const toolbar = new ToolbarController(viewer, {
  pageInput: $("[data-page-input]"),
  pageSlider: $("[data-page-slider]"),
});
const gestures = new GestureController(viewer, $("[data-reader-stage]"));

const fileInput = $("[data-file-input]");
const sidebar = $("[data-sidebar]");
const searchPanel = $("[data-search-panel]");
const settingsPanel = $("[data-settings-panel]");
const recentList = $("[data-recent]");

settings.bind(settingsPanel);
settings.onChange(async (next) => {
  Object.assign(viewer.settings, next);
  viewer.applyMode();
  await viewer.rerenderVisible();
});

toolbar.bind({
  home: () => { window.location.href = "../index.html"; },
  open: () => fileInput.click(),
  "open-empty": () => fileInput.click(),
  search: () => togglePanel(searchPanel),
  "close-search": () => searchPanel.hidden = true,
  settings: () => togglePanel(settingsPanel),
  "close-settings": () => settingsPanel.hidden = true,
  sidebar: () => togglePanel(sidebar),
  prev: () => viewer.prevPage(),
  next: () => viewer.nextPage(),
  "zoom-out": () => viewer.zoomBy(-0.15),
  "zoom-in": () => viewer.zoomBy(0.15),
  "fit-width": () => settings.update({ fitMode: "width" }),
  rotate: () => viewer.rotate(),
  print: () => viewer.print(),
  download: () => viewer.download(),
  bookmark: () => bookmarks.toggle(),
  fullscreen: () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(),
  "prev-result": () => search.previous(),
  "next-result": () => search.next(),
});
gestures.bind();

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (file) await openFile(file);
});

const dropZone = $("[data-drop-zone]");
["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("dragging");
  });
});
["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, () => dropZone.classList.remove("dragging"));
});
dropZone.addEventListener("drop", async (event) => {
  event.preventDefault();
  const file = event.dataTransfer?.files?.[0];
  if (file) await openFile(file);
});

$$("[data-panel-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$("[data-panel-tab]").forEach((item) => item.classList.toggle("active", item === tab));
    $$("[data-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tab.dataset.panelTab));
  });
});

document.addEventListener("reader:loaded", async () => {
  await Promise.all([thumbnails.render(), toc.render(), bookmarks.render(), toolbar.renderRecent(recentList)]);
  animateEnter();
});

document.addEventListener("reader:pagechange", () => {
  void bookmarks.render();
});

await toolbar.renderRecent(recentList);

async function openFile(file) {
  try {
    await viewer.loadFile(file);
  } catch (error) {
    console.error("[PDFReader] Could not open PDF", error);
    alert(error.message || "Could not open PDF.");
  }
}

function togglePanel(panel) {
  panel.hidden = !panel.hidden;
  if (!panel.hidden) panel.classList.add("material-enter");
}

function animateEnter() {
  if (window.gsap) {
    gsap.fromTo(".page-card", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.28, stagger: 0.025, ease: "power2.out" });
  }
}
