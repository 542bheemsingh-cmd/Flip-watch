export class GestureController {
  constructor(viewer, stage) {
    this.viewer = viewer;
    this.stage = stage;
    this.lastTap = 0;
  }

  bind() {
    this.stage.addEventListener("wheel", (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      void this.viewer.zoomBy(event.deltaY > 0 ? -0.12 : 0.12);
    }, { passive: false });

    this.stage.addEventListener("dblclick", () => {
      void this.viewer.zoomBy(this.viewer.scale < 1.8 ? 0.45 : -0.45);
    });

    if (window.Hammer) {
      const hammer = new Hammer.Manager(this.stage);
      hammer.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 50 }));
      hammer.add(new Hammer.Pinch({ enable: true }));
      hammer.add(new Hammer.Press({ time: 550 }));

      hammer.on("swipeleft", () => this.viewer.settings.direction === "rtl" ? this.viewer.prevPage() : this.viewer.nextPage());
      hammer.on("swiperight", () => this.viewer.settings.direction === "rtl" ? this.viewer.nextPage() : this.viewer.prevPage());
      hammer.on("pinchout", () => this.viewer.zoomBy(0.08));
      hammer.on("pinchin", () => this.viewer.zoomBy(-0.08));
      hammer.on("press", () => document.dispatchEvent(new CustomEvent("reader:longpress")));
    }

    this.stage.addEventListener("touchend", () => {
      const now = Date.now();
      if (now - this.lastTap < 280) void this.viewer.zoomBy(this.viewer.scale < 1.8 ? 0.45 : -0.45);
      this.lastTap = now;
    }, { passive: true });
  }
}
