import { storage } from "./storage.js";

export const defaultSettings = {
  id: "reader",
  theme: "dark",
  brightness: 100,
  scrollMode: "continuous",
  fitMode: "width",
  direction: "ltr",
  pageFlip: "slide",
  fontSize: 100,
  animationSpeed: 100,
  highContrast: false,
};

export class SettingsController {
  constructor() {
    this.settings = { ...defaultSettings };
    this.listeners = new Set();
  }

  async load() {
    const saved = await storage.get("settings", "reader");
    this.settings = { ...defaultSettings, ...(saved || {}) };
    this.apply();
    return this.settings;
  }

  async update(patch) {
    this.settings = { ...this.settings, ...patch, id: "reader" };
    await storage.set("settings", this.settings);
    this.apply();
    this.listeners.forEach((listener) => listener(this.settings));
  }

  onChange(listener) {
    this.listeners.add(listener);
  }

  bind(panel) {
    panel.querySelectorAll("[data-setting]").forEach((control) => {
      const key = control.dataset.setting;
      if (control.type === "checkbox") {
        control.checked = Boolean(this.settings[key]);
      } else {
        control.value = this.settings[key];
      }

      control.addEventListener("input", () => {
        const value = control.type === "checkbox" ? control.checked : control.value;
        void this.update({ [key]: key === "brightness" || key === "fontSize" || key === "animationSpeed" ? Number(value) : value });
      });
    });
  }

  apply() {
    document.body.dataset.theme = this.settings.theme;
    document.body.classList.toggle("high-contrast", this.settings.highContrast);
    document.documentElement.style.setProperty("--brightness", String(this.settings.brightness / 100));
    document.documentElement.style.setProperty("--ui-scale", String(this.settings.fontSize / 100));
    document.documentElement.style.setProperty("--anim-scale", String(this.settings.animationSpeed / 100));
  }
}
