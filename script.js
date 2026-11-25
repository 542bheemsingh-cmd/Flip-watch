const display = document.querySelector(".display");
const appShell = document.querySelector("[data-app-shell]");
const dashboard = document.querySelector("[data-dashboard]");
const toolPanel = document.querySelector("[data-tool-panel]");
const calculatorPanel = document.querySelector("[data-calculator-panel]");
const equationPanel = document.querySelector("[data-equation-panel]");
const toolCards = document.querySelectorAll("[data-open-tool]");
const backDashboardButton = document.querySelector("[data-back-dashboard]");
const clockDisplay = document.querySelector(".clock-display");
const clockTime = document.querySelector(".clock-time");
const clockDate = document.querySelector(".clock-date");
const controls = document.querySelector("[data-controls]");
const startButton = document.querySelector('[data-action="start"]');
const stopButton = document.querySelector('[data-action="stop"]');
const resetButton = document.querySelector('[data-action="reset"]');
const modeButtons = document.querySelectorAll(".mode-button");
const timerOptions = document.querySelector("[data-timer-options]");
const presetButtons = document.querySelectorAll("[data-minutes]");
const customMinutesInput = document.querySelector("[data-custom-minutes]");
const stopwatchOptions = document.querySelector("[data-stopwatch-options]");
const stopwatchTypeButtons = document.querySelectorAll("[data-stopwatch-type]");
const stopwatchCustomTime = document.querySelector(".stopwatch-custom-time");
const stopwatchHoursInput = document.querySelector("[data-stopwatch-hours]");
const stopwatchMinutesInput = document.querySelector("[data-stopwatch-minutes]");
const stopwatchSecondsInput = document.querySelector("[data-stopwatch-seconds]");
const awakeToggle = document.querySelector("[data-awake-toggle]");
const wakeStatus = document.querySelector("[data-wake-status]");
const screenFitButton = document.querySelector("[data-screen-fit]");
const soundToggle = document.querySelector("[data-sound-toggle]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const liveTime = document.querySelector("[data-live-time]");
const hourFormatButton = document.querySelector("[data-hour-format]");
const lapButton = document.querySelector('[data-action="lap"]');
const lapClearButton = document.querySelector('[data-action="lap-clear"]');
const lapPanel = document.querySelector("[data-lap-panel]");
const lapList = document.querySelector("[data-laps]");
const hourCards = document.querySelectorAll('[data-unit="hours"] .flip-card');
const minuteCards = document.querySelectorAll('[data-unit="minutes"] .flip-card');
const secondCards = document.querySelectorAll('[data-unit="seconds"] .flip-card');
const millisText = document.querySelector('[data-unit="milliseconds"]');
const flipCards = document.querySelectorAll(".flip-card");
const calculatorInput = document.querySelector("[data-calc-input]");
const calculatorPrevious = document.querySelector("[data-calc-previous]");
const calculatorHistoryList = document.querySelector("[data-calc-history]");
const calculatorMemoryStatus = document.querySelector("[data-calc-memory-status]");
const calculatorAngleButton = document.querySelector("[data-calc-angle]");
const calculatorGuideButton = document.querySelector("[data-calc-guide]");
const calculatorGuidePanel = document.querySelector("[data-calc-guide-panel]");
const calculatorGuideClose = document.querySelector("[data-calc-guide-close]");
const equationDimensionButtons = document.querySelectorAll("[data-equation-dimension]");
const equationMetricButtons = document.querySelectorAll("[data-equation-metric]");
const equationShapeSelect = document.querySelector("[data-equation-shape]");
const equationGraphsPanel = document.querySelector("[data-equation-graphs]");
const equationGraphToolbar = document.querySelector(".equation-toolbar");
const equationGraphMetricTabs = document.querySelector(".equation-metric-tabs");
const equationGraphLayout = document.querySelector(".equation-layout");
const equationGraphReference = document.querySelector(".equation-reference");
const equationGraphSelect = document.querySelector("[data-equation-graph-select]");
const equationGraphAngleLabel = document.querySelector("[data-equation-graph-angle-label]");
const equationGraphAngleUnit = document.querySelector("[data-equation-graph-angle-unit]");
const equationGraphInput = document.querySelector("[data-equation-graph-input]");
const equationGraphReset = document.querySelector("[data-equation-graph-reset]");
const equationGraphTitle = document.querySelector("[data-equation-graph-title]");
const equationGraphFormula = document.querySelector("[data-equation-graph-formula]");
const equationPlot = document.querySelector("[data-equation-plot]");
const equationGraphReadout = document.querySelector("[data-equation-graph-readout]");
const equationGraphDomain = document.querySelector("[data-equation-graph-domain]");
const equationGraphRange = document.querySelector("[data-equation-graph-range]");
const equationGraphNote = document.querySelector("[data-equation-graph-note]");
const equationType = document.querySelector("[data-equation-type]");
const equationTitle = document.querySelector("[data-equation-title]");
const equationFormula = document.querySelector("[data-equation-formula]");
const equationDescription = document.querySelector("[data-equation-description]");
const equationFields = document.querySelector("[data-equation-fields]");
const equationResultLabel = document.querySelector("[data-equation-result-label]");
const equationResultValue = document.querySelector("[data-equation-result-value]");
const equationResultUnit = document.querySelector("[data-equation-unit]");
const equationDimensionLabel = document.querySelector("[data-equation-dimension-label]");
const equationVisual = document.querySelector("[data-equation-visual]");
const equationShapeGrid = document.querySelector("[data-equation-shape-grid]");
const equationReferenceCount = document.querySelector("[data-equation-reference-count]");
const equationBackButton = document.querySelector("[data-equation-back]");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

let elapsedBeforeStart = 0;
let startedAt = 0;
let stopwatchFrame = 0;
let clockTimer = 0;
let isRunning = false;
let activeMode = "stopwatch";
let wakeLock = null;
let wakeLockSupported = "wakeLock" in navigator;
let wakeLockLastError = "";
let lastRenderedCentiseconds = -1;
let selectedTimerDuration = 5 * 60 * 1000;
let timerRemainingBeforeStart = selectedTimerDuration;
let stopwatchType = "countup";
let selectedStopwatchStart = 5 * 60 * 1000;
let stopwatchElapsedBeforeStart = selectedStopwatchStart;
let prefersReducedMotion = motionPreference.matches;
let flipDuration = prefersReducedMotion ? 0 : 820;
let calculatorAngleMode = "DEG";
let calculatorMemory = 0;
let calculatorHistory = [];
let calculatorLastAnswer = 0;
let soundEnabled = true;
let audioContext = null;
let activeEquationDimension = "2d";
let activeEquationMetric = "primary";
let previousEquationGraphAngleUnit = "RAD";

// Live tab title while a stopwatch or timer is running.
const defaultDocumentTitle = document.title;
let lastTitleSecond = -1;

// Stopwatch laps.
let laps = [];
let lastLapAt = 0;

// Persisted state keys.
const storageKeys = {
  calcHistory: "flip-watch-calc-history",
  calcMemory: "flip-watch-calc-memory",
  timerMinutes: "flip-watch-timer-minutes",
  stopwatchStart: "flip-watch-stopwatch-start",
  session: "flip-watch-session",
};

function restartMotion(element, className) {
  if (!element) return;

  element.classList.remove(className);
  if (prefersReducedMotion) return;

  requestAnimationFrame(() => {
    element.classList.add(className);
  });
}

function animatePanelIn(panel) {
  restartMotion(panel, "panel-enter");
}

function animateDashboardIn() {
  if (!dashboard) return;
  restartMotion(dashboard, "dashboard-enter");
}

function applyRandomDashboardTheme() {
  if (!dashboard) return;

  const themes = ["studio", "aurora", "blueprint", "ember"];
  const storageKey = "flip-watch-dashboard-theme";
  let previousTheme = "";

  try {
    previousTheme = localStorage.getItem(storageKey) || "";
  } catch (error) {
    console.info("[Dashboard] Theme memory is unavailable; using a fresh random theme.");
  }

  const availableThemes = themes.filter((theme) => theme !== previousTheme);
  const randomIndex = window.crypto?.getRandomValues
    ? window.crypto.getRandomValues(new Uint32Array(1))[0] % availableThemes.length
    : Math.floor(Math.random() * availableThemes.length);
  const nextTheme = availableThemes[randomIndex];

  dashboard.dataset.dashboardTheme = nextTheme;
  try {
    localStorage.setItem(storageKey, nextTheme);
  } catch (error) {
    // Private browsing can reject storage; the current theme still works.
  }
}

toolCards.forEach((card, index) => {
  card.style.setProperty("--card-index", index);
});

function handleMotionPreferenceChange(event) {
  prefersReducedMotion = event.matches;
  flipDuration = prefersReducedMotion ? 0 : 820;
}

if (motionPreference.addEventListener) {
  motionPreference.addEventListener("change", handleMotionPreferenceChange);
} else {
  motionPreference.addListener(handleMotionPreferenceChange);
}

function getAudioContext() {
  if (audioContext) return audioContext;
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return null;
  audioContext = new AudioContextConstructor();
  return audioContext;
}

function playTone(frequency, duration = 0.055, type = "sine", volume = 0.035, glideTo = null, delay = 0) {
  if (!soundEnabled) return;
  const context = getAudioContext();
  if (!context) return;

  void context.resume().catch(() => {});
  const now = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (glideTo) oscillator.frequency.exponentialRampToValueAtTime(glideTo, now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.01);
}

function playTimeOverSound() {
  if (!soundEnabled) return;
  playTone(880, 0.16, "triangle", 0.045, 720, 0);
  playTone(660, 0.16, "triangle", 0.045, 540, 0.2);
  playTone(440, 0.32, "sine", 0.05, 360, 0.42);
}

function playButtonSound(kind) {
  const sounds = {
    key: [520, 0.045, "sine", 0.026, 470],
    function: [690, 0.06, "triangle", 0.03, 820],
    operator: [410, 0.065, "square", 0.018, 340],
    equals: [520, 0.12, "sine", 0.04, 780],
    navigation: [330, 0.08, "triangle", 0.03, 460],
    back: [460, 0.07, "triangle", 0.028, 300],
    toggle: [600, 0.06, "sine", 0.028, 720],
    action: [250, 0.06, "square", 0.018, 210],
    success: [720, 0.14, "sine", 0.035, 980],
    default: [440, 0.05, "sine", 0.025, 520],
  };
  const sound = sounds[kind] || sounds.default;
  playTone(...sound);
}

function getButtonSoundKind(button) {
  if (button.matches("[data-sound-toggle]")) return "toggle";
  if (button.matches("[data-calc-action=equals]")) return "equals";
  if (button.matches("[data-calc-value]")) {
    if (button.classList.contains("calc-function")) return "function";
    if (button.classList.contains("calc-operator")) return "operator";
    return "key";
  }
  if (button.matches("[data-calc-action]")) return "action";
  if (button.matches("[data-open-tool], .mode-button, .preset-button")) return "navigation";
  if (button.matches(".back-button, [data-calculator-back], [data-calc-guide-close]")) return "back";
  if (button.matches('[data-action="start"], .calc-equals')) return "success";
  if (button.matches('[data-action="stop"], [data-action="reset"], [data-screen-fit], [data-calc-guide], [data-calc-angle]')) return "toggle";
  return "default";
}

function updateSoundToggle() {
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.setAttribute("aria-label", soundEnabled ? "Turn sound effects off" : "Turn sound effects on");
  soundToggle.title = soundEnabled ? "Turn sound effects off" : "Turn sound effects on";
  soundToggle.querySelector("span").textContent = soundEnabled ? "🔊" : "🔇";
}

const themeStorageKey = "flip-watch-color-theme";

const themeSystemQuery = window.matchMedia("(prefers-color-scheme: light)");

function resolveTheme(pref) {
  if (pref === "system") return themeSystemQuery.matches ? "light" : "dark";
  return pref === "light" ? "light" : "dark";
}

function updateThemeToggle(pref, resolved) {
  if (!themeToggle) return;
  const label = pref === "system" ? `Theme: system (${resolved})` : `Theme: ${pref}`;
  themeToggle.setAttribute("aria-pressed", String(resolved === "light"));
  themeToggle.setAttribute("aria-label", `${label}. Click to change.`);
  themeToggle.title = `${label} — click to change`;
  themeToggle.querySelector("span").textContent = pref === "system" ? "◐" : resolved === "light" ? "☀" : "☾";
}

function applyTheme(pref = "system", persist = true) {
  const nextPref = ["light", "dark", "system"].includes(pref) ? pref : "system";
  const resolved = resolveTheme(nextPref);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePref = nextPref;
  updateThemeToggle(nextPref, resolved);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", resolved === "light" ? "#f6f7ff" : "#0a0b16");
  if (persist) {
    try {
      localStorage.setItem(themeStorageKey, nextPref);
    } catch (error) {
      // Storage can be unavailable in private browsing; the theme still applies.
    }
  }
}

function toggleTheme() {
  const current = document.documentElement.dataset.themePref || "system";
  const order = ["dark", "light", "system"];
  applyTheme(order[(order.indexOf(current) + 1) % order.length]);
}

themeSystemQuery.addEventListener("change", () => {
  if ((document.documentElement.dataset.themePref || "system") === "system") {
    applyTheme("system", false);
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  playButtonSound(getButtonSoundKind(button));
}, true);

function updateScreenFitControl(isActive) {
  appShell.classList.toggle("is-screen-fit", isActive);
  document.body.classList.toggle("screen-fit-active", isActive);
  screenFitButton.setAttribute("aria-pressed", String(isActive));
  screenFitButton.setAttribute("aria-label", isActive ? "Exit screen fit" : "Enter screen fit");
  screenFitButton.title = isActive ? "Exit screen fit" : "Enter screen fit";
}

async function toggleScreenFit() {
  const isFullscreen = document.fullscreenElement === appShell;

  if (isFullscreen || appShell.classList.contains("is-screen-fit")) {
    if (!isFullscreen) {
      updateScreenFitControl(false);
      return;
    }

    try {
      await document.exitFullscreen();
      updateScreenFitControl(false);
    } catch (error) {
      console.warn("[ScreenFit] Could not exit browser fullscreen.", error);
      updateScreenFitControl(false);
    }
    return;
  }

  // Retain an app-like viewport layout when the browser blocks fullscreen.
  updateScreenFitControl(true);

  if (!appShell.requestFullscreen) {
    console.info("[ScreenFit] Browser fullscreen is unavailable; using viewport-fit layout.");
    return;
  }

  try {
    await appShell.requestFullscreen({ navigationUI: "hide" });
  } catch (error) {
    console.warn("[ScreenFit] Browser fullscreen was not granted; viewport-fit layout remains enabled.", error);
  }
}

function pad(value, size) {
  return String(value).padStart(size, "0");
}

function validateCountingInputs(n, r) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(r) || n < 0 || r < 0) {
    throw new Error("n and r must be non-negative whole numbers");
  }
  if (r > n) throw new Error("r cannot be greater than n");
  return [n, r];
}

function calculatePermutation(n, r) {
  validateCountingInputs(n, r);
  let result = 1;
  for (let index = 0; index < r; index += 1) result *= n - index;
  if (!Number.isFinite(result)) throw new Error("Permutation result is too large");
  return result;
}

function calculateCombination(n, r) {
  validateCountingInputs(n, r);
  const pairs = Math.min(r, n - r);
  let result = 1;
  for (let index = 1; index <= pairs; index += 1) {
    result = result * (n - pairs + index) / index;
    if (!Number.isFinite(result)) throw new Error("Combination result is too large");
  }
  return result;
}

const calculatorFunctions = {
  sin: (value) => Math.sin(calculatorAngleMode === "DEG" ? value * Math.PI / 180 : value),
  cos: (value) => Math.cos(calculatorAngleMode === "DEG" ? value * Math.PI / 180 : value),
  tan: (value) => {
    const radians = calculatorAngleMode === "DEG" ? value * Math.PI / 180 : value;
    if (Math.abs(Math.cos(radians)) < 1e-12) throw new Error("tan is undefined at this angle");
    return Math.tan(radians);
  },
  cosec: (value) => {
    const result = Math.sin(calculatorAngleMode === "DEG" ? value * Math.PI / 180 : value);
    if (Math.abs(result) < 1e-12) throw new Error("cosec is undefined at this angle");
    return 1 / result;
  },
  sec: (value) => {
    const result = Math.cos(calculatorAngleMode === "DEG" ? value * Math.PI / 180 : value);
    if (Math.abs(result) < 1e-12) throw new Error("sec is undefined at this angle");
    return 1 / result;
  },
  cot: (value) => {
    const radians = calculatorAngleMode === "DEG" ? value * Math.PI / 180 : value;
    const result = Math.sin(radians);
    if (Math.abs(result) < 1e-12) throw new Error("cot is undefined at this angle");
    return Math.cos(radians) / result;
  },
  asin: (value) => calculatorAngleMode === "DEG" ? Math.asin(value) * 180 / Math.PI : Math.asin(value),
  acos: (value) => calculatorAngleMode === "DEG" ? Math.acos(value) * 180 / Math.PI : Math.acos(value),
  atan: (value) => calculatorAngleMode === "DEG" ? Math.atan(value) * 180 / Math.PI : Math.atan(value),
  acosec: (value) => {
    if (Math.abs(value) < 1) throw new Error("acosec is defined only when |x| is at least 1");
    const radians = Math.asin(1 / value);
    return calculatorAngleMode === "DEG" ? radians * 180 / Math.PI : radians;
  },
  asec: (value) => {
    if (Math.abs(value) < 1) throw new Error("asec is defined only when |x| is at least 1");
    const radians = Math.acos(1 / value);
    return calculatorAngleMode === "DEG" ? radians * 180 / Math.PI : radians;
  },
  acot: (value) => {
    const radians = value === 0
      ? Math.PI / 2
      : value > 0
        ? Math.atan(1 / value)
        : Math.atan(1 / value) + Math.PI;
    return calculatorAngleMode === "DEG" ? radians * 180 / Math.PI : radians;
  },
  sqrt: Math.sqrt,
  abs: Math.abs,
  ln: Math.log,
  log: (value, base = 10) => {
    if (value <= 0 || base <= 0 || base === 1) {
      throw new Error("Log needs a positive value and a base greater than 0 (not 1)");
    }
    return Math.log(value) / Math.log(base);
  },
  exp: Math.exp,
  floor: Math.floor,
  ceil: Math.ceil,
  round: (value) => Math.round((value + Math.sign(value) * Number.EPSILON) * 100) / 100,
  npr: calculatePermutation,
  ncr: calculateCombination,
  pow: Math.pow,
  mod: (left, right) => left % right,
  min: Math.min,
  max: Math.max,
};

const equationShapes = {
  square: {
    dimension: "2d",
    label: "Square",
    formula: "A = s²",
    perimeterFormula: "P = 4s",
    description: "Area of a square is side multiplied by side.",
    fields: [{ key: "side", label: "Side (s)", value: 5 }],
    calculate: ({ side }) => side ** 2,
    calculatePerimeter: ({ side }) => 4 * side,
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Square diagram"><rect class="shape-fill" x="82" y="42" width="156" height="156" rx="3"/><path class="shape-line" d="M82 215h156"/><text class="shape-label" x="160" y="232">s</text></svg>`,
  },
  rectangle: {
    dimension: "2d",
    label: "Rectangle",
    formula: "A = l × w",
    perimeterFormula: "P = 2(l + w)",
    description: "Area is the product of the rectangle's length and width.",
    fields: [
      { key: "length", label: "Length (l)", value: 8 },
      { key: "width", label: "Width (w)", value: 5 },
    ],
    calculate: ({ length, width }) => length * width,
    calculatePerimeter: ({ length, width }) => 2 * (length + width),
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Rectangle diagram"><rect class="shape-fill" x="50" y="70" width="220" height="100" rx="3"/><path class="shape-line" d="M50 195h220M35 70v100"/><text class="shape-label" x="160" y="216">l</text><text class="shape-label" x="18" y="125">w</text></svg>`,
  },
  triangle: {
    dimension: "2d",
    label: "Triangle",
    formula: "A = ½ × b × h",
    perimeterFormula: "P = a + b + c",
    description: "Use the base, perpendicular height and the other two sides.",
    fields: [
      { key: "base", label: "Base (b)", value: 8 },
      { key: "height", label: "Height (h)", value: 4 },
      { key: "sideA", label: "Side 1 (a)", value: 5 },
      { key: "sideB", label: "Side 2 (c)", value: 5 },
    ],
    calculate: ({ base, height }) => 0.5 * base * height,
    calculatePerimeter: ({ base, sideA, sideB }) => base + sideA + sideB,
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Triangle diagram"><path class="shape-fill" d="M55 190L160 42L265 190Z"/><path class="shape-line" d="M55 207h210M160 42v148"/><text class="shape-label" x="160" y="228">b</text><text class="shape-label" x="177" y="125">h</text></svg>`,
  },
  circle: {
    dimension: "2d",
    label: "Circle",
    formula: "A = πr²",
    perimeterFormula: "P = 2πr",
    description: "Multiply pi by the radius squared.",
    fields: [{ key: "radius", label: "Radius (r)", value: 5 }],
    calculate: ({ radius }) => Math.PI * radius ** 2,
    calculatePerimeter: ({ radius }) => 2 * Math.PI * radius,
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Circle diagram"><circle class="shape-fill" cx="150" cy="120" r="78"/><path class="shape-line" d="M150 120h78"/><text class="shape-label" x="190" y="110">r</text></svg>`,
  },
  parallelogram: {
    dimension: "2d",
    label: "Parallelogram",
    formula: "A = b × h",
    perimeterFormula: "P = 2(a + b)",
    description: "Area uses the base and height; perimeter uses the base and side length.",
    fields: [
      { key: "base", label: "Base (b)", value: 8 },
      { key: "height", label: "Height (h)", value: 4 },
      { key: "side", label: "Side (a)", value: 5 },
    ],
    calculate: ({ base, height }) => base * height,
    calculatePerimeter: ({ base, side }) => 2 * (base + side),
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Parallelogram diagram"><path class="shape-fill" d="M88 55H270L232 185H50Z"/><path class="shape-line" d="M50 204h182M88 55v130"/><text class="shape-label" x="141" y="225">b</text><text class="shape-label" x="101" y="126">h</text></svg>`,
  },
  trapezium: {
    dimension: "2d",
    label: "Trapezium",
    formula: "A = ½(a + b)h",
    perimeterFormula: "P = a + b + c + d",
    description: "Use the two parallel sides, height and both non-parallel sides.",
    fields: [
      { key: "baseA", label: "Base 1 (a)", value: 8 },
      { key: "baseB", label: "Base 2 (b)", value: 5 },
      { key: "height", label: "Height (h)", value: 4 },
      { key: "legA", label: "Side 1 (c)", value: 4 },
      { key: "legB", label: "Side 2 (d)", value: 4 },
    ],
    calculate: ({ baseA, baseB, height }) => 0.5 * (baseA + baseB) * height,
    calculatePerimeter: ({ baseA, baseB, legA, legB }) => baseA + baseB + legA + legB,
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Trapezium diagram"><path class="shape-fill" d="M92 48H228L270 190H50Z"/><path class="shape-line" d="M50 210h220M160 48v142"/><text class="shape-label" x="160" y="230">h</text><text class="shape-label" x="160" y="38">a</text><text class="shape-label" x="160" y="207">b</text></svg>`,
  },
  ellipse: {
    dimension: "2d",
    label: "Ellipse",
    formula: "A = πab",
    perimeterFormula: "P ≈ π[3(a + b) − √((3a + b)(a + 3b))]",
    description: "Multiply pi by the semi-major axis and semi-minor axis.",
    fields: [
      { key: "semiMajor", label: "Semi-major axis (a)", value: 7 },
      { key: "semiMinor", label: "Semi-minor axis (b)", value: 4 },
    ],
    calculate: ({ semiMajor, semiMinor }) => Math.PI * semiMajor * semiMinor,
    calculatePerimeter: ({ semiMajor, semiMinor }) => Math.PI * (3 * (semiMajor + semiMinor) - Math.sqrt((3 * semiMajor + semiMinor) * (semiMajor + 3 * semiMinor))),
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Ellipse diagram"><ellipse class="shape-fill" cx="160" cy="120" rx="112" ry="66"/><path class="shape-line" d="M48 120h224M160 54v132"/><text class="shape-label" x="214" y="110">a</text><text class="shape-label" x="174" y="86">b</text></svg>`,
  },
  "regular-polygon": {
    dimension: "2d",
    label: "Regular Polygon",
    formula: "A = ns² / (4 tan(π/n))",
    perimeterFormula: "P = ns",
    description: "Use the number of equal sides and the side length.",
    fields: [
      { key: "sides", label: "Number of sides (n)", value: 6 },
      { key: "side", label: "Side length (s)", value: 4 },
    ],
    calculate: ({ sides, side }) => (sides * side ** 2) / (4 * Math.tan(Math.PI / sides)),
    calculatePerimeter: ({ sides, side }) => sides * side,
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Regular polygon diagram"><polygon class="shape-fill" points="160,38 238,83 238,157 160,202 82,157 82,83"/><path class="shape-line" d="M82 83h156M160 120v82"/><text class="shape-label" x="160" y="226">s</text><text class="shape-label" x="253" y="124">n sides</text></svg>`,
  },
  cone: {
    dimension: "3d",
    label: "Cone",
    formula: "TSA = πr(r + l)",
    description: "Total surface area includes the circular base and curved surface. l is slant height.",
    fields: [
      { key: "radius", label: "Radius (r)", value: 5 },
      { key: "slant", label: "Slant height (l)", value: 8 },
      { key: "height", label: "Vertical height (h)", value: 6 },
    ],
    calculate: ({ radius, slant }) => Math.PI * radius * (radius + slant),
    volumeFormula: "V = ⅓πr²h",
    calculateVolume: ({ radius, height }) => (Math.PI * radius ** 2 * height) / 3,
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Cone diagram"><path class="shape-fill" d="M160 36L62 188Q160 226 258 188Z"/><ellipse class="shape-fill" cx="160" cy="188" rx="98" ry="30"/><path class="shape-line" d="M160 36L258 188"/><text class="shape-label" x="213" y="108">l</text><text class="shape-label" x="211" y="195">r</text></svg>`,
  },
  cube: {
    dimension: "3d",
    label: "Cube",
    formula: "TSA = 6a²",
    description: "A cube has six equal square faces.",
    fields: [{ key: "edge", label: "Edge (a)", value: 4 }],
    calculate: ({ edge }) => 6 * edge ** 2,
    volumeFormula: "V = a³",
    calculateVolume: ({ edge }) => edge ** 3,
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Cube diagram"><path class="shape-fill" d="M78 82L160 42L242 82L160 122Z"/><path class="shape-fill" d="M78 82v92l82 42v-94Z"/><path class="shape-fill" d="M242 82v92l-82 42v-94Z"/><path class="shape-line" d="M78 190h82M160 215v-94"/><text class="shape-label" x="119" y="231">a</text></svg>`,
  },
  cuboid: {
    dimension: "3d",
    label: "Cuboid",
    formula: "TSA = 2(lw + wh + hl)",
    description: "Add the three pairwise face areas and multiply by two.",
    fields: [
      { key: "length", label: "Length (l)", value: 6 },
      { key: "width", label: "Width (w)", value: 4 },
      { key: "height", label: "Height (h)", value: 3 },
    ],
    calculate: ({ length, width, height }) => 2 * (length * width + width * height + height * length),
    volumeFormula: "V = l × w × h",
    calculateVolume: ({ length, width, height }) => length * width * height,
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Cuboid diagram"><path class="shape-fill" d="M65 78L178 42L255 78L142 116Z"/><path class="shape-fill" d="M65 78v100l77 38v-100Z"/><path class="shape-fill" d="M255 78v100l-113 38v-100Z"/><path class="shape-line" d="M65 194h77M142 216v-100"/><text class="shape-label" x="104" y="228">l</text><text class="shape-label" x="220" y="67">w</text><text class="shape-label" x="150" y="160">h</text></svg>`,
  },
  sphere: {
    dimension: "3d",
    label: "Sphere",
    formula: "TSA = 4πr²",
    description: "Surface area of a sphere is four times pi times radius squared.",
    fields: [{ key: "radius", label: "Radius (r)", value: 5 }],
    calculate: ({ radius }) => 4 * Math.PI * radius ** 2,
    volumeFormula: "V = ⁴⁄₃πr³",
    calculateVolume: ({ radius }) => (4 * Math.PI * radius ** 3) / 3,
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Sphere diagram"><circle class="shape-fill" cx="160" cy="120" r="82"/><ellipse class="shape-line" cx="160" cy="120" rx="82" ry="30"/><path class="shape-line" d="M160 38v164M78 120h164"/><text class="shape-label" x="204" y="110">r</text></svg>`,
  },
  cylinder: {
    dimension: "3d",
    label: "Cylinder",
    formula: "TSA = 2πr(r + h)",
    description: "Total surface area includes two circular bases and the curved surface.",
    fields: [
      { key: "radius", label: "Radius (r)", value: 4 },
      { key: "height", label: "Height (h)", value: 8 },
    ],
    calculate: ({ radius, height }) => 2 * Math.PI * radius * (radius + height),
    volumeFormula: "V = πr²h",
    calculateVolume: ({ radius, height }) => Math.PI * radius ** 2 * height,
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Cylinder diagram"><path class="shape-fill" d="M78 62v116M242 62v116"/><ellipse class="shape-fill" cx="160" cy="62" rx="82" ry="27"/><ellipse class="shape-fill" cx="160" cy="178" rx="82" ry="27"/><path class="shape-line" d="M78 62v116M242 62v116M160 62v116"/><text class="shape-label" x="207" y="54">r</text><text class="shape-label" x="178" y="126">h</text></svg>`,
  },
  pyramid: {
    dimension: "3d",
    label: "Regular Pyramid",
    formula: "TSA = B + ½Pℓ",
    description: "For a regular pyramid, B is base area, P is base perimeter and ℓ is slant height.",
    fields: [
      { key: "sides", label: "Base sides (n)", value: 4 },
      { key: "side", label: "Base side (s)", value: 5 },
      { key: "slant", label: "Slant height (ℓ)", value: 7 },
      { key: "height", label: "Vertical height (h)", value: 6 },
    ],
    calculate: ({ sides, side, slant }) => {
      const baseArea = (sides * side ** 2) / (4 * Math.tan(Math.PI / sides));
      return baseArea + 0.5 * sides * side * slant;
    },
    volumeFormula: "V = ⅓Bh",
    calculateVolume: ({ sides, side, height }) => {
      const baseArea = (sides * side ** 2) / (4 * Math.tan(Math.PI / sides));
      return (baseArea * height) / 3;
    },
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Regular pyramid diagram"><polygon class="shape-fill" points="160,35 75,165 160,125"/><polygon class="shape-fill" points="160,35 160,125 245,165"/><polygon class="shape-fill" points="160,35 245,165 160,207"/><polygon class="shape-fill" points="160,35 160,207 75,165"/><polygon class="shape-fill" points="75,165 160,125 245,165 160,207"/><path class="shape-line" d="M160 35L160 125M160 35L245 165M75 165h85M160 207h0"/><text class="shape-label" x="205" y="108">ℓ</text><text class="shape-label" x="118" y="226">s</text></svg>`,
  },
  prism: {
    dimension: "3d",
    label: "General Prism",
    formula: "TSA = 2B + Ph",
    description: "Use the base area B, base perimeter P and prism height h.",
    fields: [
      { key: "baseArea", label: "Base area (B)", value: 20 },
      { key: "perimeter", label: "Base perimeter (P)", value: 18 },
      { key: "height", label: "Height (h)", value: 8 },
    ],
    calculate: ({ baseArea, perimeter, height }) => 2 * baseArea + perimeter * height,
    volumeFormula: "V = Bh",
    calculateVolume: ({ baseArea, height }) => baseArea * height,
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="General prism diagram"><polygon class="shape-fill" points="70,170 125,55 180,170"/><polygon class="shape-fill" points="140,190 195,75 250,190"/><polygon class="shape-fill" points="70,170 125,55 195,75 140,190"/><polygon class="shape-fill" points="125,55 180,170 250,190 195,75"/><polygon class="shape-fill" points="70,170 180,170 250,190 140,190"/><path class="shape-line" d="M70 170L140 190M125 55L195 75M180 170L250 190"/><text class="shape-label" x="125" y="146">B</text><text class="shape-label" x="218" y="138">h</text></svg>`,
  },
  hemisphere: {
    dimension: "3d",
    label: "Hemisphere",
    formula: "TSA = 3πr²",
    description: "Total surface area includes the curved half-sphere and its circular base.",
    fields: [{ key: "radius", label: "Radius (r)", value: 5 }],
    calculate: ({ radius }) => 3 * Math.PI * radius ** 2,
    volumeFormula: "V = ⅔πr³",
    calculateVolume: ({ radius }) => (2 * Math.PI * radius ** 3) / 3,
    visual: () => `<svg viewBox="0 0 320 240" role="img" aria-label="Hemisphere diagram"><path class="shape-fill" d="M68 135a92 72 0 0 1 184 0Z"/><ellipse class="shape-fill" cx="160" cy="135" rx="92" ry="25"/><path class="shape-line" d="M160 135V63"/><text class="shape-label" x="180" y="101">r</text></svg>`,
  },
};

const equationMetricFields = {
  triangle: {
    primary: ["base", "height"],
    secondary: ["base", "sideA", "sideB"],
  },
  parallelogram: {
    primary: ["base", "height"],
    secondary: ["base", "side"],
  },
  trapezium: {
    primary: ["baseA", "baseB", "height"],
    secondary: ["baseA", "baseB", "legA", "legB"],
  },
  cone: {
    primary: ["radius", "slant"],
    secondary: ["radius", "height"],
  },
  pyramid: {
    primary: ["sides", "side", "slant"],
    secondary: ["sides", "side", "height"],
  },
};

const equationGraphs = {
  sin: { title: "sin(x)", formula: "y = sin(x)", angleType: "direct", domain: "All real numbers", domainDeg: "All real numbers", range: "[-1, 1]", rangeDeg: "[-1, 1]", xRange: [-2 * Math.PI, 2 * Math.PI], yRange: [-1.5, 1.5], defaultInput: 0, note: "Trigonometric graph input is in radians.", evaluate: Math.sin },
  cos: { title: "cos(x)", formula: "y = cos(x)", angleType: "direct", domain: "All real numbers", domainDeg: "All real numbers", range: "[-1, 1]", rangeDeg: "[-1, 1]", xRange: [-2 * Math.PI, 2 * Math.PI], yRange: [-1.5, 1.5], defaultInput: 0, note: "Trigonometric graph input is in radians.", evaluate: Math.cos },
  tan: { title: "tan(x)", formula: "y = tan(x)", angleType: "direct", domain: "All real numbers except x = π/2 + kπ", domainDeg: "All real numbers except x = 90° + k·180°", range: "All real numbers", rangeDeg: "All real numbers", xRange: [-2 * Math.PI, 2 * Math.PI], yRange: [-5, 5], defaultInput: 0, note: "Vertical asymptotes are shown as breaks. Input is in radians.", evaluate: (x) => Math.abs(Math.cos(x)) < 0.035 ? null : Math.tan(x) },
  cosec: { title: "cosec(x)", formula: "y = 1 / sin(x)", angleType: "direct", domain: "All real numbers except x = kπ", domainDeg: "All real numbers except x = k·180°", range: "(-∞, -1] ∪ [1, ∞)", rangeDeg: "(-∞, -1] ∪ [1, ∞)", xRange: [-2 * Math.PI, 2 * Math.PI], yRange: [-5, 5], defaultInput: Math.PI / 2, note: "Vertical asymptotes are shown as breaks. Input is in radians.", evaluate: (x) => Math.abs(Math.sin(x)) < 0.035 ? null : 1 / Math.sin(x) },
  sec: { title: "sec(x)", formula: "y = 1 / cos(x)", angleType: "direct", domain: "All real numbers except x = π/2 + kπ", domainDeg: "All real numbers except x = 90° + k·180°", range: "(-∞, -1] ∪ [1, ∞)", rangeDeg: "(-∞, -1] ∪ [1, ∞)", xRange: [-2 * Math.PI, 2 * Math.PI], yRange: [-5, 5], defaultInput: 0, note: "Vertical asymptotes are shown as breaks. Input is in radians.", evaluate: (x) => Math.abs(Math.cos(x)) < 0.035 ? null : 1 / Math.cos(x) },
  cot: { title: "cot(x)", formula: "y = cos(x) / sin(x)", angleType: "direct", domain: "All real numbers except x = kπ", domainDeg: "All real numbers except x = k·180°", range: "All real numbers", rangeDeg: "All real numbers", xRange: [-2 * Math.PI, 2 * Math.PI], yRange: [-5, 5], defaultInput: Math.PI / 4, note: "Vertical asymptotes are shown as breaks. Input is in radians.", evaluate: (x) => Math.abs(Math.sin(x)) < 0.035 ? null : Math.cos(x) / Math.sin(x) },
  asin: { title: "asin(x)", formula: "y = sin⁻¹(x)", angleType: "inverse", domain: "[-1, 1]", domainDeg: "[-1, 1]", range: "[-π/2, π/2]", rangeDeg: "[-90°, 90°]", xRange: [-1, 1], yRange: [-1.8, 1.8], defaultInput: 0.5, note: "Inverse trigonometric output is in radians.", evaluate: (x) => x < -1 || x > 1 ? null : Math.asin(x) },
  acos: { title: "acos(x)", formula: "y = cos⁻¹(x)", angleType: "inverse", domain: "[-1, 1]", domainDeg: "[-1, 1]", range: "[0, π]", rangeDeg: "[0°, 180°]", xRange: [-1, 1], yRange: [-0.2, 3.4], defaultInput: 0.5, note: "Inverse trigonometric output is in radians.", evaluate: (x) => x < -1 || x > 1 ? null : Math.acos(x) },
  atan: { title: "atan(x)", formula: "y = tan⁻¹(x)", angleType: "inverse", domain: "All real numbers", domainDeg: "All real numbers", range: "(-π/2, π/2)", rangeDeg: "(-90°, 90°)", xRange: [-6, 6], yRange: [-1.8, 1.8], defaultInput: 1, note: "Inverse trigonometric output is in radians.", evaluate: Math.atan },
  acosec: { title: "acosec(x)", formula: "y = cosec⁻¹(x)", angleType: "inverse", domain: "(-∞, -1] ∪ [1, ∞)", domainDeg: "(-∞, -1] ∪ [1, ∞)", range: "[-π/2, 0) ∪ (0, π/2]", rangeDeg: "[-90°, 0°) ∪ (0°, 90°]", xRange: [-6, 6], yRange: [-1.8, 1.8], defaultInput: 2, note: "Inverse trigonometric output is in radians. Input must satisfy |x| ≥ 1.", evaluate: (x) => Math.abs(x) < 1 ? null : Math.asin(1 / x) },
  asec: { title: "asec(x)", formula: "y = sec⁻¹(x)", angleType: "inverse", domain: "(-∞, -1] ∪ [1, ∞)", domainDeg: "(-∞, -1] ∪ [1, ∞)", range: "[0, π/2) ∪ (π/2, π]", rangeDeg: "[0°, 90°) ∪ (90°, 180°]", xRange: [-6, 6], yRange: [-0.2, 3.4], defaultInput: 2, note: "Inverse trigonometric output is in radians. Input must satisfy |x| ≥ 1.", evaluate: (x) => Math.abs(x) < 1 ? null : Math.acos(1 / x) },
  acot: { title: "acot(x)", formula: "y = cot⁻¹(x)", angleType: "inverse", domain: "All real numbers", domainDeg: "All real numbers", range: "(0, π)", rangeDeg: "(0°, 180°)", xRange: [-6, 6], yRange: [-0.2, 3.4], defaultInput: 1, note: "Inverse trigonometric output is in radians. Principal range is (0, π).", evaluate: (x) => x === 0 ? Math.PI / 2 : x > 0 ? Math.atan(1 / x) : Math.atan(1 / x) + Math.PI },
  abs: { title: "|x|", formula: "y = |x|", domain: "All real numbers", range: "[0, ∞)", xRange: [-8, 8], yRange: [-1, 8], defaultInput: -3, note: "Modulus returns distance from zero, so output is never negative.", evaluate: Math.abs },
  ln: { title: "ln(x)", formula: "y = ln(x)", domain: "(0, ∞)", range: "All real numbers", xRange: [0.05, 10], yRange: [-3, 3], defaultInput: 1, note: "Natural logarithm has base e and is defined only for x > 0.", evaluate: (x) => x <= 0 ? null : Math.log(x) },
  log10: { title: "log₁₀(x)", formula: "y = log₁₀(x)", domain: "(0, ∞)", range: "All real numbers", xRange: [0.05, 10], yRange: [-2, 2], defaultInput: 10, note: "Common logarithm has base 10 and is defined only for x > 0.", evaluate: (x) => x <= 0 ? null : Math.log10(x) },
  signum: { title: "sgn(x)", formula: "y = -1, 0, or 1", domain: "All real numbers", range: "{-1, 0, 1}", xRange: [-6, 6], yRange: [-1.5, 1.5], defaultInput: 0, note: "Signum returns -1 for negative x, 0 at x = 0 and 1 for positive x.", evaluate: (x) => Math.sign(x) },
  floor: { title: "floor(x)", formula: "y = ⌊x⌋", domain: "All real numbers", range: "All integers", xRange: [-6, 6], yRange: [-6, 6], defaultInput: 2.6, note: "Greatest integer function rounds down to the next lower integer.", evaluate: Math.floor },
  fractional: { title: "{x}", formula: "y = x − ⌊x⌋", domain: "All real numbers", range: "[0, 1)", xRange: [-6, 6], yRange: [-0.1, 1.1], defaultInput: 2.6, note: "Fractional part keeps only the part after the decimal point.", evaluate: (x) => x - Math.floor(x) },
  ceil: { title: "ceil(x)", formula: "y = ⌈x⌉", domain: "All real numbers", range: "All integers", xRange: [-6, 6], yRange: [-6, 6], defaultInput: 2.4, note: "Least integer function rounds up to the next higher integer.", evaluate: Math.ceil },
  exp: { title: "eˣ", formula: "y = eˣ", domain: "All real numbers", range: "(0, ∞)", xRange: [-3, 3], yRange: [0, 22], defaultInput: 1, note: "The exponential function is always positive and passes through (0, 1).", evaluate: Math.exp },
  square: { title: "x²", formula: "y = x²", domain: "All real numbers", range: "[0, ∞)", xRange: [-4, 4], yRange: [-1, 17], defaultInput: 2, note: "A quadratic function with a minimum value of 0.", evaluate: (x) => x ** 2 },
  sqrt: { title: "√x", formula: "y = √x", domain: "[0, ∞)", range: "[0, ∞)", xRange: [0, 16], yRange: [-0.2, 4.5], defaultInput: 4, note: "Square root is defined only for x ≥ 0.", evaluate: (x) => x < 0 ? null : Math.sqrt(x) },
  reciprocal: { title: "1/x", formula: "y = 1/x", domain: "All real numbers except 0", range: "All real numbers except 0", xRange: [-6, 6], yRange: [-6, 6], defaultInput: 2, note: "The graph has a vertical asymptote at x = 0.", evaluate: (x) => Math.abs(x) < 0.035 ? null : 1 / x },
};

function formatEquationNumber(value) {
  if (Math.abs(value) < 1e-10) return "0";
  return Number(value.toFixed(2)).toString();
}

function formatGraphTick(value) {
  if (Math.abs(value) < 1e-9) return "0";
  return formatEquationNumber(value);
}

function getEquationGraphDefaultInput(graph) {
  if (graph.angleType === "direct" && equationGraphAngleUnit.value === "DEG") {
    return graph.defaultInput * 180 / Math.PI;
  }
  return graph.defaultInput;
}

function renderEquationGraph() {
  const graph = equationGraphs[equationGraphSelect.value];
  if (!graph) return;

  const isAngleGraph = Boolean(graph.angleType);
  const isDegree = isAngleGraph && equationGraphAngleUnit.value === "DEG";
  const xRange = graph.angleType === "direct" && isDegree
    ? graph.xRange.map((value) => value * 180 / Math.PI)
    : graph.xRange;
  const yRange = graph.angleType === "inverse" && isDegree
    ? graph.yRange.map((value) => value * 180 / Math.PI)
    : graph.yRange;
  const evaluateDisplayed = (value) => {
    const calculationInput = graph.angleType === "direct" && isDegree ? value * Math.PI / 180 : value;
    const result = graph.evaluate(calculationInput);
    return graph.angleType === "inverse" && isDegree && Number.isFinite(result) ? result * 180 / Math.PI : result;
  };

  const rawInput = equationGraphInput.value.trim();
  const inputValue = rawInput === "" ? null : Number(rawInput);
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const plot = { left: 58, top: 24, width: 650, height: 350 };
  const xToSvg = (value) => plot.left + ((value - xMin) / (xMax - xMin)) * plot.width;
  const yToSvg = (value) => plot.top + ((yMax - value) / (yMax - yMin)) * plot.height;
  const parts = [`<title>${graph.title} graph</title>`];

  for (let index = 0; index <= 8; index += 1) {
    const value = xMin + ((xMax - xMin) * index) / 8;
    const x = xToSvg(value);
    parts.push(`<line class="graph-grid-line" x1="${x}" y1="${plot.top}" x2="${x}" y2="${plot.top + plot.height}"/>`);
    parts.push(`<text class="graph-axis-label" x="${x}" y="${plot.top + plot.height + 24}" text-anchor="middle">${formatGraphTick(value)}</text>`);
  }

  for (let index = 0; index <= 6; index += 1) {
    const value = yMin + ((yMax - yMin) * index) / 6;
    const y = yToSvg(value);
    parts.push(`<line class="graph-grid-line" x1="${plot.left}" y1="${y}" x2="${plot.left + plot.width}" y2="${y}"/>`);
    parts.push(`<text class="graph-axis-label" x="${plot.left - 10}" y="${y + 4}" text-anchor="end">${formatGraphTick(value)}</text>`);
  }

  if (xMin <= 0 && xMax >= 0) {
    const x = xToSvg(0);
    parts.push(`<line class="graph-axis" x1="${x}" y1="${plot.top}" x2="${x}" y2="${plot.top + plot.height}"/>`);
  }
  if (yMin <= 0 && yMax >= 0) {
    const y = yToSvg(0);
    parts.push(`<line class="graph-axis" x1="${plot.left}" y1="${y}" x2="${plot.left + plot.width}" y2="${y}"/>`);
  }

  const paths = [];
  let path = "";
  const samples = 560;
  for (let index = 0; index <= samples; index += 1) {
    const x = xMin + ((xMax - xMin) * index) / samples;
    const y = evaluateDisplayed(x);
    const isValid = Number.isFinite(y) && y >= yMin && y <= yMax;

    if (!isValid) {
      if (path) paths.push(path);
      path = "";
      continue;
    }

    path += `${path ? "L" : "M"}${xToSvg(x).toFixed(2)},${yToSvg(y).toFixed(2)} `;
  }
  if (path) paths.push(path);
  paths.forEach((pathData) => parts.push(`<path class="graph-path" d="${pathData}"/>`));

  let readout = "Enter a number to map an input.";
  if (inputValue !== null && Number.isFinite(inputValue)) {
    const output = evaluateDisplayed(inputValue);
    const insideDomain = inputValue >= xMin && inputValue <= xMax;
    if (!Number.isFinite(output)) {
      readout = `Input x = ${formatGraphTick(inputValue)} · Output y = undefined`;
    } else if (!insideDomain || output < yMin || output > yMax) {
      readout = `Input x = ${formatGraphTick(inputValue)} · Output y = ${formatEquationNumber(output)} · outside plotted range`;
    } else {
      const pointX = xToSvg(inputValue);
      const pointY = yToSvg(output);
      parts.push(`<line class="graph-point-guide" x1="${pointX}" y1="${plot.top + plot.height}" x2="${pointX}" y2="${pointY}"/>`);
      parts.push(`<line class="graph-point-guide" x1="${plot.left}" y1="${pointY}" x2="${pointX}" y2="${pointY}"/>`);
      parts.push(`<circle class="graph-point-halo" cx="${pointX}" cy="${pointY}" r="10"/>`);
      parts.push(`<circle class="graph-point" cx="${pointX}" cy="${pointY}" r="5"/>`);
      readout = `Input x = ${formatGraphTick(inputValue)} · Output y = ${formatEquationNumber(output)}`;
    }
  }

  equationGraphTitle.textContent = graph.title;
  equationGraphFormula.textContent = graph.formula;
  equationGraphAngleLabel.hidden = !isAngleGraph;
  equationGraphAngleUnit.hidden = !isAngleGraph;
  equationGraphDomain.textContent = isDegree ? (graph.domainDeg || graph.domain) : graph.domain;
  equationGraphRange.textContent = isDegree ? (graph.rangeDeg || graph.range) : graph.range;
  equationGraphNote.textContent = isAngleGraph
    ? `${graph.note.replace("in radians", isDegree ? "in degrees" : "in radians")}`
    : graph.note;
  equationGraphReadout.textContent = readout;
  equationPlot.innerHTML = parts.join("");
  restartMotion(equationPlot, "graph-refresh");
}

function getEquationShapesForDimension() {
  return Object.entries(equationShapes).filter(([, shape]) => shape.dimension === activeEquationDimension);
}

function getEquationFields(shape) {
  const shapeId = equationShapeSelect.value;
  const metricKeys = equationMetricFields[shapeId]?.[activeEquationMetric];
  if (!metricKeys) return shape.fields;
  return shape.fields.filter((field) => metricKeys.includes(field.key));
}

function readEquationValues(shape) {
  const values = {};

  getEquationFields(shape).forEach((field) => {
    const input = equationFields.querySelector(`[data-equation-field="${field.key}"]`);
    const value = Number(input.value);

    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${field.label} must be greater than 0.`);
    }
    if (field.key === "sides" && (!Number.isInteger(value) || value < 3)) {
      throw new Error("Number of sides must be a whole number of 3 or more.");
    }

    values[field.key] = value;
  });

  return values;
}

function getEquationMetric(shape) {
  if (shape.dimension === "2d") {
    if (activeEquationMetric === "secondary") {
      return {
        label: "Perimeter",
        type: "2D PERIMETER",
        formula: shape.perimeterFormula,
        unit: "linear units",
        calculate: shape.calculatePerimeter,
      };
    }

    return {
      label: "Area",
      type: "2D AREA",
      formula: shape.formula,
      unit: "square units",
      calculate: shape.calculate,
    };
  }

  if (activeEquationMetric === "secondary") {
    return {
      label: "Volume",
      type: "3D VOLUME",
      formula: shape.volumeFormula,
      unit: "cubic units",
      calculate: shape.calculateVolume,
    };
  }

  return {
    label: "Total surface area",
    type: "3D SURFACE AREA",
    formula: shape.formula,
    unit: "square units",
    calculate: shape.calculate,
  };
}

function calculateEquation() {
  const shape = equationShapes[equationShapeSelect.value];
  if (!shape) return;

  try {
    const values = readEquationValues(shape);
    const metric = getEquationMetric(shape);
    const result = metric.calculate(values);
    equationResultValue.textContent = `${formatEquationNumber(result)} ${metric.unit}`;
    equationResultValue.removeAttribute("data-error");
  } catch (error) {
    equationResultValue.textContent = error.message || "Enter valid measurements.";
    equationResultValue.setAttribute("data-error", "true");
  }
  restartMotion(equationResultValue, "result-pop");
}

function renderEquationFields(shape) {
  const previousValues = new Map(
    [...equationFields.querySelectorAll("[data-equation-field]")].map((input) => [input.dataset.equationField, input.value]),
  );
  const fields = getEquationFields(shape);
  equationFields.replaceChildren();

  fields.forEach((field) => {
    const label = document.createElement("label");
    const labelText = document.createElement("span");
    const input = document.createElement("input");

    label.className = "equation-field";
    labelText.textContent = field.label;
    input.type = "number";
    input.min = "0";
    input.step = field.key === "sides" ? "1" : "any";
    input.value = previousValues.get(field.key) ?? String(field.value);
    input.inputMode = "decimal";
    input.setAttribute("data-equation-field", field.key);
    input.addEventListener("input", calculateEquation);

    label.append(labelText, input);
    equationFields.append(label);
  });
}

function renderEquationReference() {
  const shapes = getEquationShapesForDimension();
  equationReferenceCount.textContent = `${shapes.length} formulas`;
  equationShapeGrid.replaceChildren();

  shapes.forEach(([id, shape]) => {
    const button = document.createElement("button");
    const title = document.createElement("strong");
    const formula = document.createElement("span");

    button.className = "equation-shape-card";
    button.type = "button";
    button.dataset.equationReference = id;
    button.classList.toggle("active", id === equationShapeSelect.value);
    title.textContent = shape.label;
    formula.textContent = activeEquationMetric === "secondary"
      ? (shape.dimension === "2d" ? shape.perimeterFormula : shape.volumeFormula)
      : shape.formula;
    button.append(title, formula);
    button.addEventListener("click", () => {
      equationShapeSelect.value = id;
      renderEquationShape();
    });
    equationShapeGrid.append(button);
  });
}

function updateEquationShapeOptions() {
  const shapes = getEquationShapesForDimension();
  const nextShapeId = shapes.some(([id]) => id === equationShapeSelect.value) ? equationShapeSelect.value : shapes[0][0];

  equationShapeSelect.replaceChildren();
  shapes.forEach(([id, shape]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = shape.label;
    equationShapeSelect.append(option);
  });
  equationShapeSelect.value = nextShapeId;
}

function renderEquationShape() {
  const shape = equationShapes[equationShapeSelect.value];
  if (!shape) return;

  const metric = getEquationMetric(shape);
  equationMetricButtons.forEach((button) => {
    const isPrimary = button.dataset.equationMetric === "primary";
    button.textContent = shape.dimension === "2d"
      ? (isPrimary ? "Area" : "Perimeter")
      : (isPrimary ? "Surface Area" : "Volume");
    button.setAttribute("aria-pressed", String((isPrimary ? "primary" : "secondary") === activeEquationMetric));
    button.classList.toggle("active", (isPrimary ? "primary" : "secondary") === activeEquationMetric);
  });

  equationType.textContent = metric.type;
  equationTitle.textContent = shape.label;
  equationFormula.textContent = metric.formula;
  equationDescription.textContent = shape.description;
  equationResultLabel.textContent = metric.label;
  equationResultUnit.textContent = metric.unit;
  equationDimensionLabel.textContent = shape.dimension.toUpperCase();
  equationVisual.innerHTML = shape.visual();
  renderEquationFields(shape);
  renderEquationReference();
  calculateEquation();
  restartMotion(equationVisual, "shape-refresh");
  restartMotion(equationFields, "fields-refresh");
}

function setEquationDimension(dimension) {
  activeEquationDimension = dimension;
  activeEquationMetric = "primary";
  const isGraphs = dimension === "graphs";
  equationDimensionButtons.forEach((button) => {
    const isActive = button.dataset.equationDimension === dimension;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  equationGraphsPanel.hidden = !isGraphs;
  equationGraphToolbar.hidden = isGraphs;
  equationGraphMetricTabs.hidden = isGraphs;
  equationGraphLayout.hidden = isGraphs;
  equationGraphReference.hidden = isGraphs;

  if (isGraphs) {
    renderEquationGraph();
    return;
  }

  updateEquationShapeOptions();
  renderEquationShape();
}

function setEquationMetric(metric) {
  activeEquationMetric = metric;
  renderEquationShape();
}

function tokenizeCalculator(expression) {
  const tokens = [];
  const pattern = /\s*(?:(\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|([a-zA-Z]+)|([+\-*/^%(),!]))/y;
  let position = 0;

  while (position < expression.length) {
    pattern.lastIndex = position;
    const match = pattern.exec(expression);
    if (!match) {
      if (expression.slice(position).trim()) {
        throw new Error("Invalid character");
      }
      break;
    }

    const raw = match[0].trim();
    position = pattern.lastIndex;
    if (match[1]) {
      tokens.push({ type: "number", value: Number(raw) });
    } else if (match[2]) {
      tokens.push({ type: "name", value: match[2].toLowerCase() });
    } else {
      tokens.push({ type: "operator", value: match[3] });
    }
  }

  return tokens;
}

function evaluateCalculatorExpression(expression) {
  const tokens = tokenizeCalculator(expression.replaceAll("×", "*").replaceAll("÷", "/").replaceAll("−", "-"));
  let position = 0;

  const peek = () => tokens[position];
  const take = (value) => {
    if (peek()?.value !== value) {
      throw new Error(`Expected ${value}`);
    }
    position += 1;
  };

  function parseExpression() {
    let value = parseTerm();
    while (peek()?.value === "+" || peek()?.value === "-") {
      const operator = tokens[position++].value;
      const right = parseTerm();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  function parseTerm() {
    let value = parseUnary();
    while (peek()?.value === "*" || peek()?.value === "/") {
      const operator = tokens[position++].value;
      const right = parseUnary();
      if (operator === "/" && right === 0) {
        throw new Error("Cannot divide by zero");
      }
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  }

  function parsePower() {
    const value = parsePostfix();
    if (peek()?.value === "^") {
      position += 1;
      return Math.pow(value, parseUnary());
    }
    return value;
  }

  function parseUnary() {
    if (peek()?.value === "+") {
      position += 1;
      return parseUnary();
    }
    if (peek()?.value === "-") {
      position += 1;
      return -parseUnary();
    }
    return parsePower();
  }

  function parsePostfix() {
    let value = parsePrimary();
    while (peek()?.value === "!" || peek()?.value === "%") {
      const operator = tokens[position++].value;
      if (operator === "%") {
        value /= 100;
        continue;
      }
      if (!Number.isInteger(value) || value < 0 || value > 170) {
        throw new Error("Factorial needs an integer from 0 to 170");
      }
      let result = 1;
      for (let index = 2; index <= value; index += 1) result *= index;
      value = result;
    }
    return value;
  }

  function parsePrimary() {
    const token = peek();
    if (!token) throw new Error("Incomplete expression");

    if (token.type === "number") {
      position += 1;
      return token.value;
    }

    if (token.type === "name") {
      position += 1;
      if (peek()?.value === "(") {
        const functionName = token.value;
        const functionToCall = calculatorFunctions[functionName];
        if (!functionToCall) throw new Error(`Unknown function: ${functionName}`);
        take("(");
        const args = [];
        if (peek()?.value !== ")") {
          args.push(parseExpression());
          while (peek()?.value === ",") {
            position += 1;
            args.push(parseExpression());
          }
        }
        take(")");
        return functionToCall(...args);
      }
      if (token.value === "pi") return Math.PI;
      if (token.value === "e") return Math.E;
      if (token.value === "ans") return calculatorLastAnswer;
      throw new Error(`Unknown value: ${token.value}`);
    }

    if (token.value === "(") {
      position += 1;
      const value = parseExpression();
      take(")");
      return value;
    }

    throw new Error("Expected a number");
  }

  const result = parseExpression();
  if (position !== tokens.length) throw new Error("Check the expression");
  if (!Number.isFinite(result)) throw new Error("Result is not finite");
  return Object.is(result, -0) ? 0 : result;
}

function normalizeCalculatorValue(value) {
  const epsilon = 1e-12;
  if (Math.abs(value) < epsilon) return 0;

  const nearestInteger = Math.round(value);
  if (Math.abs(value - nearestInteger) < epsilon) return nearestInteger;
  return value;
}

function formatCalculatorResult(value) {
  const normalized = normalizeCalculatorValue(value);
  return Number(normalized.toPrecision(12)).toString();
}

function renderCalculatorHistory() {
  calculatorHistoryList.textContent = "";
  if (!calculatorHistory.length) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "Your calculations will appear here.";
    calculatorHistoryList.append(empty);
    return;
  }

  calculatorHistory.forEach(({ expression, result }) => {
    const item = document.createElement("button");
    item.className = "history-item";
    item.type = "button";
    item.innerHTML = `<span class="history-expression"></span><span class="history-result"></span>`;
    item.querySelector(".history-expression").textContent = expression;
    item.querySelector(".history-result").textContent = result;
    item.addEventListener("click", () => {
      calculatorInput.value = result;
      calculatorPrevious.textContent = expression;
      calculatorInput.focus();
    });
    calculatorHistoryList.append(item);
  });
}

function setCalculatorError(message) {
  calculatorPrevious.textContent = message;
  calculatorInput.setAttribute("aria-invalid", "true");
}

function clearCalculatorError() {
  calculatorInput.removeAttribute("aria-invalid");
}

function evaluateCalculator() {
  const expression = calculatorInput.value.trim();
  if (!expression) return;

  try {
    const result = formatCalculatorResult(evaluateCalculatorExpression(expression));
    calculatorLastAnswer = Number(result);
    calculatorPrevious.textContent = `${expression} =`;
    calculatorInput.value = result;
    calculatorHistory = [{ expression, result }, ...calculatorHistory].slice(0, 30);
    writeStored(storageKeys.calcHistory, calculatorHistory);
    renderCalculatorHistory();
    clearCalculatorError();
    restartMotion(calculatorPrevious, "result-pop");
    restartMotion(calculatorInput, "result-pop");
  } catch (error) {
    setCalculatorError(error.message || "Invalid expression");
    restartMotion(calculatorPrevious, "result-pop");
  }
}

function insertCalculatorValue(value) {
  const input = calculatorInput;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const shouldReplaceEmptyDisplay = input.value === "";
  const shouldReplaceZero = input.value === "0" && (/[0-9.]/.test(value) || value === "pi" || value === "e");
  if (shouldReplaceEmptyDisplay || shouldReplaceZero) {
    input.value = value;
  } else {
    input.value = `${input.value.slice(0, start)}${value}${input.value.slice(end)}`;
  }
  clearCalculatorError();
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

function currentCalculatorValue() {
  return evaluateCalculatorExpression(calculatorInput.value || "0");
}

function updateCalculatorMemoryStatus() {
  calculatorMemoryStatus.textContent = calculatorMemory === 0 ? "Memory empty" : `M = ${formatCalculatorResult(calculatorMemory)}`;
}

function setCalculatorGuide(open) {
  calculatorGuidePanel.hidden = !open;
  calculatorGuideButton.setAttribute("aria-expanded", String(open));
  if (open) {
    restartMotion(calculatorGuidePanel, "guide-enter");
    calculatorGuideClose.focus();
  }
}

function handleCalculatorAction(action) {
  if (action === "clear") {
    calculatorInput.value = "";
    calculatorPrevious.textContent = "Ready";
    clearCalculatorError();
    calculatorInput.focus();
    return;
  }
  if (action === "delete") {
    calculatorInput.value = calculatorInput.value.slice(0, -1);
    clearCalculatorError();
    calculatorInput.focus();
    return;
  }
  if (action === "equals") {
    evaluateCalculator();
    return;
  }
  if (action === "history-clear") {
    calculatorHistory = [];
    renderCalculatorHistory();
    return;
  }
  if (action === "memory-clear") {
    calculatorMemory = 0;
  } else if (action === "memory-recall") {
    insertCalculatorValue(formatCalculatorResult(calculatorMemory));
  } else if (action === "memory-add" || action === "memory-subtract") {
    try {
      const value = currentCalculatorValue();
      calculatorMemory += action === "memory-add" ? value : -value;
    } catch (error) {
      setCalculatorError(error.message || "Invalid memory value");
      return;
    }
  }
  writeStored(storageKeys.calcMemory, calculatorMemory);
  updateCalculatorMemoryStatus();
}

function createFlipHalf(className, value) {
  const half = document.createElement("span");
  const valueElement = document.createElement("span");

  half.className = className;
  half.setAttribute("aria-hidden", "true");
  valueElement.textContent = value;
  half.append(valueElement);

  return half;
}

function setWakeIndicator(status, message) {
  wakeStatus.dataset.wakeStatus = status;
  wakeStatus.textContent = message;
  wakeStatus.title = wakeLockLastError;
}

function setNativeKeepScreenOn(enabled) {
  if (!window.AndroidBridge?.setKeepScreenOn) {
    return false;
  }

  try {
    window.AndroidBridge.setKeepScreenOn(enabled);
    console.info(`[WakeLock] Android native keep-screen-on ${enabled ? "enabled" : "disabled"}.`);
    return true;
  } catch (error) {
    console.warn("[WakeLock] Android native keep-screen-on bridge failed.", error);
    return false;
  }
}

function setHalfValue(card, selector, value) {
  card.querySelector(`${selector} span`).textContent = value;
}

function prepareFlipCards() {
  flipCards.forEach((card) => {
    const initialValue = card.textContent.trim() || "0";

    card.textContent = "";
    card.dataset.value = initialValue;
    card._flipTimers = [];
    card.setAttribute("aria-label", initialValue);
    card.append(
      createFlipHalf("flip-half flip-top", initialValue),
      createFlipHalf("flip-half flip-bottom", initialValue),
      createFlipHalf("flip-fold fold-top", initialValue),
      createFlipHalf("flip-fold fold-bottom", initialValue),
    );

    const impactShadow = document.createElement("span");
    impactShadow.className = "impact-shadow";
    impactShadow.setAttribute("aria-hidden", "true");
    card.append(impactShadow);
  });
}

function setCardValue(card, nextValue) {
  const currentValue = card.dataset.value;
  if (currentValue === nextValue) {
    return;
  }

  card._flipTimers?.forEach((timer) => window.clearTimeout(timer));
  card._flipTimers = [];

  if (card._flipFrame) {
    cancelAnimationFrame(card._flipFrame);
    card._flipFrame = 0;
  }

  card.getAnimations?.({ subtree: true }).forEach((animation) => animation.cancel());

  setHalfValue(card, ".flip-top", currentValue);
  setHalfValue(card, ".flip-bottom", currentValue);
  setHalfValue(card, ".fold-top", currentValue);
  setHalfValue(card, ".fold-bottom", nextValue);

  card.classList.remove("is-flipping");
  card.dataset.value = nextValue;
  card.setAttribute("aria-label", nextValue);

  if (flipDuration === 0) {
    setHalfValue(card, ".flip-top", nextValue);
    setHalfValue(card, ".flip-bottom", nextValue);
    return;
  }

  card._flipFrame = requestAnimationFrame(() => {
    card._flipFrame = 0;
    card.classList.add("is-flipping");
    card._flipTimers.push(window.setTimeout(() => {
      setHalfValue(card, ".flip-top", nextValue);
    }, flipDuration / 2));

    card._flipTimers.push(window.setTimeout(() => {
      setHalfValue(card, ".flip-bottom", nextValue);
      card.classList.remove("is-flipping");
      card._flipTimers = [];
    }, flipDuration));
  });
}

function setCardPair(cards, value) {
  const padded = pad(value, 2);
  setCardValue(cards[0], padded[0]);
  setCardValue(cards[1], padded[1]);
}

async function requestWakeLock() {
  if (!isRunning || activeMode === "clock" || !awakeToggle.checked) {
    return;
  }

  setWakeIndicator("active", "Screen Awake On");
  const nativeWakeEnabled = setNativeKeepScreenOn(true);

  if (!wakeLockSupported) {
    wakeLockLastError = "Wake Lock API is not supported in this browser.";
    console.warn(`[WakeLock] ${wakeLockLastError}`);
    setWakeIndicator("active", "Screen Awake On");
    return;
  }

  if (wakeLock || document.visibilityState !== "visible") {
    return;
  }

  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLockLastError = "";
    console.info("[WakeLock] Screen wake lock acquired.");
    setWakeIndicator("active", "Screen Awake On");

    wakeLock.addEventListener("release", () => {
      console.info("[WakeLock] Screen wake lock released by browser/system.");
      wakeLock = null;
      if (isRunning && activeMode !== "clock" && awakeToggle.checked && document.visibilityState === "visible") {
        setWakeIndicator("active", "Screen Awake On");
        void requestWakeLock();
      } else {
        setWakeIndicator("idle", "Screen Awake: Off");
      }
    });
  } catch (error) {
    wakeLockLastError = `Browser denied Wake Lock: ${error?.name || "Error"}`;
    console.warn("[WakeLock] Failed to acquire screen wake lock.", error);
    if (nativeWakeEnabled) {
      console.info("[WakeLock] Browser Wake Lock failed, Android native keep-screen-on remains active.");
    }
    wakeLock = null;
    setWakeIndicator("active", "Screen Awake On");
  }
}

async function releaseWakeLock(reason = "manual") {
  setNativeKeepScreenOn(false);

  if (!wakeLock) {
    if (!isRunning) {
      setWakeIndicator("idle", "Screen Awake: Off");
    }
    return;
  }

  const lock = wakeLock;
  wakeLock = null;

  try {
    await lock.release();
    wakeLockLastError = "";
    console.info(`[WakeLock] Screen wake lock released (${reason}).`);
  } catch (error) {
    console.warn("[WakeLock] Failed while releasing screen wake lock.", error);
  } finally {
    setWakeIndicator("idle", "Screen Awake: Off");
  }
}

function getElapsed() {
  if (!isRunning) {
    return elapsedBeforeStart;
  }

  return elapsedBeforeStart + performance.now() - startedAt;
}

function getTimerRemaining() {
  if (!isRunning) {
    return timerRemainingBeforeStart;
  }

  return Math.max(0, timerRemainingBeforeStart - (performance.now() - startedAt));
}

function getCustomStopwatchElapsed() {
  if (!isRunning) {
    return stopwatchElapsedBeforeStart;
  }

  return stopwatchElapsedBeforeStart + performance.now() - startedAt;
}

function formatTitleClock(durationMs) {
  const total = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0
    ? `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}`
    : `${pad(minutes, 2)}:${pad(seconds, 2)}`;
}

// Show the running time in the browser tab so it is visible from any tab.
function updateDocumentTitle(durationMs) {
  if (!isRunning || activeMode === "clock") {
    if (lastTitleSecond !== -1) {
      lastTitleSecond = -1;
      document.title = defaultDocumentTitle;
    }
    return;
  }
  const totalSeconds = Math.floor(durationMs / 1000);
  if (totalSeconds === lastTitleSecond) return;
  lastTitleSecond = totalSeconds;
  const label = activeMode === "timer" ? "Timer" : "Stopwatch";
  document.title = `(${formatTitleClock(durationMs)}) ${label} — Flip Watch`;
}

/* ---------------------------------------------------------------- laps */
function formatLapTime(ms) {
  const total = Math.max(0, Math.floor(ms / 10));
  const centis = total % 100;
  const seconds = Math.floor(total / 100) % 60;
  const minutes = Math.floor(total / 6000) % 60;
  const hours = Math.floor(total / 360000);
  const base = hours > 0
    ? `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}`
    : `${pad(minutes, 2)}:${pad(seconds, 2)}`;
  return `${base}.${pad(centis, 2)}`;
}

function currentStopwatchElapsed() {
  return stopwatchType === "custom" ? getCustomStopwatchElapsed() : getElapsed();
}

function updateLapControls() {
  if (lapButton) lapButton.hidden = !(activeMode === "stopwatch" && isRunning);
  if (lapPanel) lapPanel.hidden = !(activeMode === "stopwatch" && laps.length > 0);
}

function renderLaps() {
  if (!lapList) return;
  lapList.replaceChildren();
  if (!laps.length) {
    updateLapControls();
    return;
  }
  const splits = laps.map((lap) => lap.split);
  const best = Math.min(...splits);
  const worst = Math.max(...splits);
  laps.forEach((lap) => {
    const row = document.createElement("li");
    row.className = "lap-row";
    if (laps.length > 1 && lap.split === best) row.classList.add("is-best");
    else if (laps.length > 1 && lap.split === worst) row.classList.add("is-worst");
    const index = document.createElement("span");
    index.className = "lap-index";
    index.textContent = String(lap.index);
    const split = document.createElement("span");
    split.className = "lap-split";
    split.textContent = formatLapTime(lap.split);
    const total = document.createElement("span");
    total.className = "lap-total";
    total.textContent = formatLapTime(lap.total);
    row.append(index, split, total);
    lapList.append(row);
  });
  updateLapControls();
}

function recordLap() {
  if (!isRunning || activeMode !== "stopwatch") return;
  const total = currentStopwatchElapsed();
  laps.push({ index: laps.length + 1, split: total - lastLapAt, total });
  lastLapAt = total;
  renderLaps();
}

function clearLaps() {
  laps = [];
  lastLapAt = 0;
  renderLaps();
}

/* --------------------------------------------------------- persistence */
function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage can be unavailable; the app keeps working without it.
  }
}

function saveSession() {
  writeStored(storageKeys.session, {
    mode: activeMode,
    stopwatchType,
    elapsed: elapsedBeforeStart,
    customElapsed: stopwatchElapsedBeforeStart,
    timerRemaining: timerRemainingBeforeStart,
    timerDuration: selectedTimerDuration,
    customStart: selectedStopwatchStart,
  });
}

function restoreSession() {
  const saved = readStored(storageKeys.session, null);
  if (saved && typeof saved === "object") {
    if (Number.isFinite(saved.elapsed)) elapsedBeforeStart = saved.elapsed;
    if (Number.isFinite(saved.customElapsed)) stopwatchElapsedBeforeStart = saved.customElapsed;
    if (Number.isFinite(saved.timerRemaining)) timerRemainingBeforeStart = saved.timerRemaining;
    if (Number.isFinite(saved.timerDuration) && saved.timerDuration > 0) selectedTimerDuration = saved.timerDuration;
    if (Number.isFinite(saved.customStart)) selectedStopwatchStart = saved.customStart;
    if (saved.stopwatchType === "custom") stopwatchType = "custom";
    if (["stopwatch", "timer", "clock"].includes(saved.mode)) activeMode = saved.mode;
  }

  const history = readStored(storageKeys.calcHistory, null);
  if (Array.isArray(history)) {
    calculatorHistory = history
      .filter((item) => item && typeof item.expression === "string" && typeof item.result === "string")
      .slice(0, 30);
  }
  const memory = readStored(storageKeys.calcMemory, null);
  if (Number.isFinite(memory)) calculatorMemory = memory;

  const savedMinutes = readStored(storageKeys.timerMinutes, null);
  const minutes = Number.isFinite(savedMinutes)
    ? savedMinutes
    : Math.max(1, Math.round(selectedTimerDuration / 60000));
  setTimerDuration(minutes);

  const totalSeconds = Math.max(0, Math.round(selectedStopwatchStart / 1000));
  stopwatchHoursInput.value = String(Math.min(99, Math.floor(totalSeconds / 3600)));
  stopwatchMinutesInput.value = String(Math.floor((totalSeconds % 3600) / 60));
  stopwatchSecondsInput.value = String(totalSeconds % 60);
  setStopwatchDuration();

  stopwatchCustomTime.hidden = stopwatchType !== "custom";
  stopwatchTypeButtons.forEach((button) => {
    const isActive = button.dataset.stopwatchType === stopwatchType;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  toolPanel.dataset.activeMode = activeMode;
  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === activeMode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

/* --------------------------------------------------------------- toast */
let appToastTimer = 0;

function hideAppToast() {
  const toast = document.querySelector(".app-toast");
  if (!toast) return;
  toast.classList.remove("is-visible");
  window.clearTimeout(appToastTimer);
}

function showAppToast(message, action) {
  let toast = document.querySelector(".app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "app-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }
  toast.replaceChildren();
  const text = document.createElement("span");
  text.textContent = message;
  toast.append(text);
  if (action) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.label;
    button.addEventListener("click", () => {
      hideAppToast();
      action.onClick();
    });
    toast.append(button);
  }
  window.requestAnimationFrame(() => toast.classList.add("is-visible"));
  window.clearTimeout(appToastTimer);
  appToastTimer = window.setTimeout(hideAppToast, action ? 15000 : 5000);
}

function renderDuration(durationMs, force = false) {
  const centiseconds = Math.floor(durationMs / 10);

  if (!force && centiseconds === lastRenderedCentiseconds) {
    return false;
  }

  lastRenderedCentiseconds = centiseconds;
  updateDocumentTitle(durationMs);

  const hours = Math.floor(durationMs / 3600000) % 100;
  const minutes = Math.floor((durationMs % 3600000) / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  const millis = Math.floor((durationMs % 1000) / 10);

  setCardPair(hourCards, hours);
  setCardPair(minuteCards, minutes);
  setCardPair(secondCards, seconds);
  millisText.textContent = pad(millis, 2);

  return true;
}

function renderStopwatch(force = false) {
  const elapsed = stopwatchType === "custom" ? getCustomStopwatchElapsed() : getElapsed();
  const didRender = renderDuration(elapsed, force);

  if (!didRender) {
    if (isRunning && activeMode === "stopwatch") {
      stopwatchFrame = requestAnimationFrame(() => renderStopwatch(false));
    }
    return;
  }

  if (isRunning && activeMode === "stopwatch") {
    stopwatchFrame = requestAnimationFrame(() => renderStopwatch(false));
  }
}

function renderTimer(force = false) {
  const remaining = getTimerRemaining();
  const timerWasRunning = isRunning;

  if (remaining <= 0) {
    renderDuration(0, true);
    isRunning = false;
    timerRemainingBeforeStart = 0;
    cancelAnimationFrame(stopwatchFrame);
    startButton.hidden = false;
    stopButton.hidden = true;
    if (timerWasRunning) playTimeOverSound();
    void releaseWakeLock("timer complete");
    return;
  }

  const didRender = renderDuration(remaining, force);

  if (!didRender) {
    if (isRunning && activeMode === "timer") {
      stopwatchFrame = requestAnimationFrame(() => renderTimer(false));
    }
    return;
  }

  if (isRunning && activeMode === "timer") {
    stopwatchFrame = requestAnimationFrame(() => renderTimer(false));
  }
}

function startCurrentMode() {
  if (isRunning) {
    return;
  }

  if (activeMode === "timer" && timerRemainingBeforeStart <= 0) {
    timerRemainingBeforeStart = selectedTimerDuration;
  }
  lastLapAt = stopwatchType === "custom" ? stopwatchElapsedBeforeStart : elapsedBeforeStart;
  isRunning = true;
  startedAt = performance.now();
  startButton.hidden = true;
  stopButton.hidden = false;
  updateLapControls();
  saveSession();
  if (activeMode === "timer") {
    renderTimer(true);
  } else {
    renderStopwatch(true);
  }
  void requestWakeLock();
}

function stopCurrentMode() {
  if (!isRunning) {
    return;
  }

  if (activeMode === "timer") {
    timerRemainingBeforeStart = getTimerRemaining();
  } else if (stopwatchType === "custom") {
    stopwatchElapsedBeforeStart = getCustomStopwatchElapsed();
  } else {
    elapsedBeforeStart = getElapsed();
  }

  isRunning = false;
  cancelAnimationFrame(stopwatchFrame);
  startButton.hidden = false;
  stopButton.hidden = true;
  updateLapControls();
  saveSession();
  if (activeMode === "timer") {
    renderTimer(true);
  } else {
    renderStopwatch(true);
  }
  void releaseWakeLock("paused");
}

function resetCurrentMode() {
  if (activeMode === "timer") {
    timerRemainingBeforeStart = selectedTimerDuration;
  } else if (stopwatchType === "custom") {
    stopwatchElapsedBeforeStart = selectedStopwatchStart;
  } else {
    elapsedBeforeStart = 0;
  }

  startedAt = performance.now();
  isRunning = false;
  cancelAnimationFrame(stopwatchFrame);
  lastRenderedCentiseconds = -1;
  startButton.hidden = false;
  stopButton.hidden = true;
  clearLaps();
  updateLapControls();
  saveSession();
  if (activeMode === "timer") {
    renderTimer(true);
  } else {
    renderStopwatch(true);
  }
  void releaseWakeLock("reset");
}

let hourFormat = "24";
const hourFormatStorageKey = "flip-watch-hour-format";

function formatClockTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: hourFormat === "12",
  });
}

function renderLiveTime() {
  if (liveTime) liveTime.textContent = formatClockTime(new Date());
}

function updateHourFormatButton() {
  if (!hourFormatButton) return;
  const is12 = hourFormat === "12";
  hourFormatButton.textContent = is12 ? "12H" : "24H";
  hourFormatButton.setAttribute("aria-pressed", String(is12));
  const label = is12 ? "Switch to 24-hour time" : "Switch to 12-hour time";
  hourFormatButton.setAttribute("aria-label", label);
  hourFormatButton.title = label;
}

function setHourFormat(format, persist = true) {
  hourFormat = format === "12" ? "12" : "24";
  updateHourFormatButton();
  renderLiveTime();
  if (activeMode === "clock") renderClock();
  if (persist) {
    try {
      localStorage.setItem(hourFormatStorageKey, hourFormat);
    } catch (error) {
      // Storage can be unavailable in private browsing; the format still applies.
    }
  }
}

function renderClock() {
  const now = new Date();
  clockTime.textContent = formatClockTime(now);
  clockDate.textContent = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// A wall clock only changes once a second, so tick on the second boundary instead of
// repainting on every animation frame. The same ticker keeps the live time readout in
// the status row fresh while any time tool is open.
function scheduleClockTick() {
  window.clearTimeout(clockTimer);
  const delay = 1000 - (Date.now() % 1000) + 20;
  clockTimer = window.setTimeout(() => {
    if (toolPanel.hidden) return;
    renderLiveTime();
    if (activeMode === "clock") renderClock();
    scheduleClockTick();
  }, delay);
}

function setMode(nextMode) {
  if (isRunning) {
    stopCurrentMode();
  }

  activeMode = nextMode;
  toolPanel.dataset.activeMode = nextMode;
  const isClock = nextMode === "clock";
  const isTimer = nextMode === "timer";

  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === nextMode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  display.hidden = isClock;
  controls.hidden = isClock;
  clockDisplay.hidden = !isClock;
  timerOptions.hidden = !isTimer;
  stopwatchOptions.hidden = nextMode !== "stopwatch";

  window.clearTimeout(clockTimer);
  cancelAnimationFrame(stopwatchFrame);
  lastRenderedCentiseconds = -1;

  renderLiveTime();
  scheduleClockTick();
  updateLapControls();
  saveSession();

  if (isClock) {
    void releaseWakeLock("clock mode");
    renderClock();
  } else if (isTimer) {
    renderTimer(true);
    if (isRunning) {
      void requestWakeLock();
    }
  } else {
    renderStopwatch(true);
    if (isRunning) {
      void requestWakeLock();
    }
  }
}

let lastToolTrigger = null;

// Move focus into a freshly opened panel so keyboard and screen-reader users are
// not left on the (now hidden) tool card.
function focusPanel(panel) {
  if (!panel) return;
  window.requestAnimationFrame(() => {
    if (!panel.hidden) panel.focus({ preventScroll: true });
  });
}

function openTool(mode) {
  window.clearTimeout(clockTimer);
  if (mode === "pdf") {
    window.location.href = "pdf-reader/index.html";
    return;
  }

  // Remember what opened the panel so focus can return to it on "Dashboard".
  lastToolTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  if (mode === "calculator") {
    dashboard.hidden = true;
    toolPanel.hidden = true;
    equationPanel.hidden = true;
    calculatorPanel.hidden = false;
    animatePanelIn(calculatorPanel);
    calculatorInput.focus();
    return;
  }

  if (mode === "equation") {
    dashboard.hidden = true;
    toolPanel.hidden = true;
    calculatorPanel.hidden = true;
    equationPanel.hidden = false;
    animatePanelIn(equationPanel);
    renderEquationShape();
    focusPanel(equationPanel);
    return;
  }

  if (UTILITY_TOOLS.includes(mode)) {
    openUtility(mode);
    return;
  }

  dashboard.hidden = true;
  toolPanel.hidden = false;
  calculatorPanel.hidden = true;
  equationPanel.hidden = true;
  setMode(mode);
  animatePanelIn(toolPanel);
  focusPanel(toolPanel);
}

function showDashboard() {
  if (isRunning) {
    stopCurrentMode();
  }

  window.clearTimeout(clockTimer);
  cancelAnimationFrame(stopwatchFrame);
  toolPanel.hidden = true;
  calculatorPanel.hidden = true;
  equationPanel.hidden = true;
  if (utilityPanel) utilityPanel.hidden = true;
  dashboard.hidden = false;
  animateDashboardIn();
  if (lastToolTrigger && document.contains(lastToolTrigger) && !lastToolTrigger.hidden) {
    lastToolTrigger.focus({ preventScroll: true });
  }
}

function setTimerDuration(minutes) {
  const safeMinutes = Math.min(Math.max(Number(minutes) || 1, 1), 5999);
  selectedTimerDuration = safeMinutes * 60 * 1000;
  timerRemainingBeforeStart = selectedTimerDuration;
  customMinutesInput.value = String(safeMinutes);
  writeStored(storageKeys.timerMinutes, safeMinutes);
  lastRenderedCentiseconds = -1;

  presetButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.minutes) === safeMinutes);
  });

  if (activeMode === "timer" && !isRunning) {
    renderTimer(true);
  }
}

function setStopwatchDuration() {
  const hours = Math.min(Math.max(Number(stopwatchHoursInput.value) || 0, 0), 99);
  const minutes = Math.min(Math.max(Number(stopwatchMinutesInput.value) || 0, 0), 59);
  const seconds = Math.min(Math.max(Number(stopwatchSecondsInput.value) || 0, 0), 59);
  stopwatchHoursInput.value = String(hours);
  stopwatchMinutesInput.value = String(minutes);
  stopwatchSecondsInput.value = String(seconds);

  selectedStopwatchStart = ((hours * 60 + minutes) * 60 + seconds) * 1000;
  stopwatchElapsedBeforeStart = selectedStopwatchStart;
  writeStored(storageKeys.stopwatchStart, { hours, minutes, seconds });
  lastRenderedCentiseconds = -1;

  if (activeMode === "stopwatch" && stopwatchType === "custom" && !isRunning) {
    renderStopwatch(true);
  }
}

startButton.addEventListener("click", startCurrentMode);
stopButton.addEventListener("click", stopCurrentMode);
resetButton.addEventListener("click", resetCurrentMode);
if (lapButton) lapButton.addEventListener("click", recordLap);
if (lapClearButton) lapClearButton.addEventListener("click", clearLaps);

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

toolCards.forEach((card) => {
  card.addEventListener("click", () => openTool(card.dataset.openTool));
});

backDashboardButton.addEventListener("click", showDashboard);
document.querySelector("[data-calculator-back]").addEventListener("click", showDashboard);
equationBackButton.addEventListener("click", showDashboard);
screenFitButton.addEventListener("click", () => {
  void toggleScreenFit();
});

soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  updateSoundToggle();
});

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

if (hourFormatButton) {
  hourFormatButton.addEventListener("click", () => setHourFormat(hourFormat === "12" ? "24" : "12"));
}

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement === appShell) {
    updateScreenFitControl(true);
  }
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => setTimerDuration(button.dataset.minutes));
});

stopwatchTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (isRunning) stopCurrentMode();
    stopwatchType = button.dataset.stopwatchType;
    stopwatchCustomTime.hidden = stopwatchType !== "custom";
    stopwatchTypeButtons.forEach((typeButton) => {
      const isActive = typeButton.dataset.stopwatchType === stopwatchType;
      typeButton.classList.toggle("active", isActive);
      typeButton.setAttribute("aria-pressed", String(isActive));
    });
    if (stopwatchType === "custom") {
      setStopwatchDuration();
    } else {
      stopwatchElapsedBeforeStart = 0;
      lastRenderedCentiseconds = -1;
      renderStopwatch(true);
    }
  });
});

[stopwatchHoursInput, stopwatchMinutesInput, stopwatchSecondsInput].forEach((input) => {
  input.addEventListener("input", setStopwatchDuration);
});

customMinutesInput.addEventListener("input", () => setTimerDuration(customMinutesInput.value));
customMinutesInput.addEventListener("change", () => setTimerDuration(customMinutesInput.value));

document.querySelectorAll("[data-calc-value]").forEach((button) => {
  button.addEventListener("click", () => insertCalculatorValue(button.dataset.calcValue));
});

document.querySelectorAll("[data-calc-action]").forEach((button) => {
  button.addEventListener("click", () => handleCalculatorAction(button.dataset.calcAction));
});

calculatorAngleButton.addEventListener("click", () => {
  calculatorAngleMode = calculatorAngleMode === "DEG" ? "RAD" : "DEG";
  calculatorAngleButton.textContent = calculatorAngleMode;
  calculatorAngleButton.setAttribute("aria-pressed", String(calculatorAngleMode === "RAD"));
});

calculatorGuideButton.addEventListener("click", () => {
  setCalculatorGuide(calculatorGuidePanel.hidden);
});

calculatorGuideClose.addEventListener("click", () => {
  setCalculatorGuide(false);
  calculatorGuideButton.focus();
});

equationDimensionButtons.forEach((button) => {
  button.addEventListener("click", () => setEquationDimension(button.dataset.equationDimension));
});

equationMetricButtons.forEach((button) => {
  button.addEventListener("click", () => setEquationMetric(button.dataset.equationMetric));
});

// Arrow-key navigation inside each segmented control (Home/End jump to the ends).
const keyboardGroups = document.querySelectorAll(
  ".mode-row, .stopwatch-type-row, .equation-section-tabs, .equation-metric-tabs"
);
keyboardGroups.forEach((group) => {
  group.addEventListener("keydown", (event) => {
    const handled = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!handled.includes(event.key)) return;
    const buttons = Array.from(group.querySelectorAll("button")).filter(
      (button) => !button.disabled && button.offsetParent !== null
    );
    const current = buttons.indexOf(document.activeElement);
    if (current === -1) return;
    event.preventDefault();
    let next = current;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (current - 1 + buttons.length) % buttons.length;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (current + 1) % buttons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    buttons[next].focus();
  });
});

equationShapeSelect.addEventListener("change", renderEquationShape);
equationGraphSelect.addEventListener("change", () => {
  const graph = equationGraphs[equationGraphSelect.value];
  equationGraphInput.value = String(getEquationGraphDefaultInput(graph));
  renderEquationGraph();
});
equationGraphAngleUnit.addEventListener("change", () => {
  const graph = equationGraphs[equationGraphSelect.value];
  const currentInput = Number(equationGraphInput.value);
  if (graph.angleType === "direct" && Number.isFinite(currentInput)) {
    const switchedToDegrees = previousEquationGraphAngleUnit === "RAD" && equationGraphAngleUnit.value === "DEG";
    equationGraphInput.value = String(switchedToDegrees
      ? currentInput * 180 / Math.PI
      : currentInput * Math.PI / 180);
  }
  previousEquationGraphAngleUnit = equationGraphAngleUnit.value;
  renderEquationGraph();
});
equationGraphInput.addEventListener("input", renderEquationGraph);
equationGraphReset.addEventListener("click", () => {
  const graph = equationGraphs[equationGraphSelect.value];
  equationGraphInput.value = String(getEquationGraphDefaultInput(graph));
  renderEquationGraph();
  equationGraphInput.focus();
});

// Space starts/stops, R resets, L records a lap while a time tool is open.
document.addEventListener("keydown", (event) => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target;
  if (target && target.closest && target.closest("input, textarea, select, [contenteditable='true']")) return;
  if (toolPanel.hidden) return;

  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    if (isRunning) stopCurrentMode();
    else startCurrentMode();
    return;
  }
  if (event.key === "r" || event.key === "R") {
    event.preventDefault();
    resetCurrentMode();
    return;
  }
  if ((event.key === "l" || event.key === "L") && activeMode === "stopwatch") {
    event.preventDefault();
    recordLap();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !calculatorGuidePanel.hidden) {
    setCalculatorGuide(false);
    calculatorGuideButton.focus();
  }
});

calculatorInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    evaluateCalculator();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    if (!calculatorGuidePanel.hidden) {
      setCalculatorGuide(false);
    } else {
      handleCalculatorAction("clear");
    }
  }
});

awakeToggle.addEventListener("change", () => {
  if (awakeToggle.checked && isRunning && activeMode !== "clock") {
    void requestWakeLock();
    return;
  }

  if (!awakeToggle.checked) {
    void releaseWakeLock("screen awake disabled");
  }
});

document.addEventListener("visibilitychange", () => {
  document.documentElement.classList.toggle("is-tab-hidden", document.hidden);
  if (document.visibilityState === "visible") {
    console.info("[WakeLock] Tab visible; checking wake lock state.");
    void requestWakeLock();
  } else {
    console.info("[WakeLock] Tab hidden; browser may release wake lock.");
  }
});

window.addEventListener("pagehide", () => {
  saveSession();
  void releaseWakeLock("page hidden");
});

prepareFlipCards();
applyRandomDashboardTheme();
animateDashboardIn();
restoreSession();
renderStopwatch(true);
renderCalculatorHistory();
updateCalculatorMemoryStatus();
updateSoundToggle();
applyTheme(document.documentElement.dataset.themePref || "system", false);
try {
  const storedHourFormat = localStorage.getItem(hourFormatStorageKey);
  if (storedHourFormat === "12" || storedHourFormat === "24") hourFormat = storedHourFormat;
} catch (error) {
  // Storage can be unavailable; the default 24-hour format still applies.
}
setHourFormat(hourFormat, false);
setWakeIndicator(wakeLockSupported ? "idle" : "warning", wakeLockSupported ? "Screen Awake: Off" : "Wake Lock Unsupported");
setEquationDimension("2d");

// Register the service worker so the app can be installed and works offline,
// and offer a reload when a new version has been downloaded.
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("service-worker.js");
      const promptUpdate = (worker) => {
        showAppToast("A new version is available.", {
          label: "Reload",
          onClick: () => worker.postMessage({ type: "SKIP_WAITING" }),
        });
      };
      if (registration.waiting) promptUpdate(registration.waiting);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            promptUpdate(worker);
          }
        });
      });
      // Only reload when an *update* replaces an existing worker. On the very first
      // visit the worker claims the page, and reloading there would be jarring.
      const hadController = Boolean(navigator.serviceWorker.controller);
      let reloading = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!hadController || reloading) return;
        reloading = true;
        window.location.reload();
      });
    } catch (error) {
      console.warn("[PWA] Service worker registration failed.", error);
    }
  });
}

/* =====================================================================
   Extra utilities: unit converter, password generator, word counter,
   to-do list and date calculator.
   ===================================================================== */
const UTILITY_TOOLS = ["converter", "password", "wordcount", "todo", "dates", "gst", "emi", "fuel", "json", "base64", "color", "random"];
const utilityPanel = document.querySelector("[data-utility-panel]");
const utilityKicker = document.querySelector("[data-utility-kicker]");
const utilityTitle = document.querySelector("[data-utility-title]");
const utilitySub = document.querySelector("[data-utility-sub]");
const utilityBody = document.querySelector("[data-utility-body]");

const utilityMeta = {
  converter: { kicker: "Convert", title: "Unit Converter", sub: "Length, weight, temperature, area, volume, speed, time and data." },
  password: { kicker: "Generate", title: "Password Generator", sub: "Strong random passwords and passphrases, created on your device." },
  wordcount: { kicker: "Count", title: "Word Counter", sub: "Words, characters, reading time and case tools as you type." },
  todo: { kicker: "Organise", title: "To-Do List", sub: "Tasks are saved in this browser, so they survive a reload." },
  dates: { kicker: "Calculate", title: "Date Calculator", sub: "Age, the gap between dates, or adding days to a date." },
  gst: { kicker: "Tax", title: "GST Calculator", sub: "Add or remove GST and split it into CGST and SGST." },
  emi: { kicker: "Loans", title: "EMI Calculator", sub: "Monthly EMI, total interest and total payment." },
  fuel: { kicker: "Travel", title: "Fuel Cost Calculator", sub: "Fuel needed and cost, split between people." },
  json: { kicker: "Developer", title: "JSON Formatter", sub: "Format, minify and validate JSON in your browser." },
  base64: { kicker: "Developer", title: "Base64, URL & Hash", sub: "Encode, decode and hash text offline." },
  color: { kicker: "Design", title: "Colour Toolkit", sub: "Convert colours, build tints and check contrast." },
  random: { kicker: "Decide", title: "Random Picker", sub: "Numbers, dice, a coin flip or a name from a list." },
};

const UTIL_KEYS = {
  converter: "flip-watch-converter",
  password: "flip-watch-password",
  wordcount: "flip-watch-wordcount",
  dates: "flip-watch-dates",
  todo: "flip-watch-todos",
};

function openUtility(kind) {
  if (!utilityPanel) return;
  dashboard.hidden = true;
  toolPanel.hidden = true;
  calculatorPanel.hidden = true;
  equationPanel.hidden = true;
  utilityPanel.hidden = false;
  const meta = utilityMeta[kind] || utilityMeta.converter;
  utilityPanel.dataset.kind = kind;
  utilityKicker.textContent = meta.kicker;
  utilityTitle.textContent = meta.title;
  utilitySub.textContent = meta.sub;
  renderUtility(kind);
  animatePanelIn(utilityPanel);
  focusPanel(utilityPanel);
}

function renderUtility(kind) {
  if (!utilityBody) return;
  if (kind === "converter") renderConverter();
  else if (kind === "password") renderPassword();
  else if (kind === "wordcount") renderWordCounter();
  else if (kind === "todo") renderTodo();
  else if (kind === "dates") renderDateCalculator();
  else if (kind === "gst") renderGst();
  else if (kind === "emi") renderEmi();
  else if (kind === "fuel") renderFuel();
  else if (kind === "json") renderJson();
  else if (kind === "base64") renderBase64();
  else if (kind === "color") renderColor();
  else if (kind === "random") renderRandom();
}

/* ------------------------------------------------------- shared helpers */
function utilCopy(text, message) {
  if (!text) return;
  const done = () => showAppToast(message || "Copied.");
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.append(area);
      area.select();
      try { document.execCommand("copy"); } catch (error) { /* ignore */ }
      area.remove();
      done();
    });
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  document.body.append(area);
  area.select();
  try { document.execCommand("copy"); } catch (error) { /* ignore */ }
  area.remove();
  done();
}

function utilFormat(value, decimals) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-6)) return value.toExponential(4);
  const rounded = Number(value.toFixed(decimals ?? 6));
  return rounded.toLocaleString("en-IN", { maximumFractionDigits: decimals ?? 6 });
}

/* ------------------------------------------------------- unit converter */
const CONVERTER = {
  Length: {
    units: {
      mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144,
      mi: 1609.344, nmi: 1852, "µm": 1e-6,
    },
    from: "m", to: "ft",
  },
  Weight: {
    units: { mg: 1e-6, g: 0.001, kg: 1, t: 1000, oz: 0.028349523125, lb: 0.45359237, st: 6.35029318, ct: 0.0002 },
    from: "kg", to: "lb",
  },
  Temperature: { special: true, units: { "°C": 1, "°F": 1, K: 1 }, from: "°C", to: "°F" },
  Area: {
    units: { "cm²": 1e-4, "m²": 1, ha: 10000, "km²": 1e6, "in²": 0.00064516, "ft²": 0.09290304, "yd²": 0.83612736, "mi²": 2589988.110336, acre: 4046.8564224 },
    from: "m²", to: "ft²",
  },
  Volume: {
    units: { mL: 0.001, L: 1, "m³": 1000, tsp: 0.00492892159375, tbsp: 0.01478676478125, "fl oz": 0.0295735295625, cup: 0.2365882365, pt: 0.473176473, qt: 0.946352946, gal: 3.785411784 },
    from: "L", to: "gal",
  },
  Speed: { units: { "m/s": 1, "km/h": 0.2777777778, mph: 0.44704, knot: 0.5144444444, "ft/s": 0.3048 }, from: "km/h", to: "mph" },
  Time: { units: { ms: 0.001, s: 1, min: 60, h: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 }, from: "min", to: "h" },
  Data: { units: { bit: 0.125, B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776, PB: 1125899906842624 }, from: "MB", to: "GB" },
};

function convertTemperature(value, from, to) {
  const celsius = from === "°C" ? value : from === "°F" ? ((value - 32) * 5) / 9 : value - 273.15;
  return to === "°C" ? celsius : to === "°F" ? (celsius * 9) / 5 + 32 : celsius + 273.15;
}

function renderConverter() {
  const categories = Object.keys(CONVERTER);
  const saved = readStored(UTIL_KEYS.converter, null) || {};

  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="conv-cat">Category</label>
      <select id="conv-cat" data-conv-category>
        ${categories.map((c) => `<option value="${c}">${c}</option>`).join("")}
      </select>
    </div>
    <div class="conv-row">
      <div class="util-field">
        <label for="conv-value">From</label>
        <input id="conv-value" type="number" inputmode="decimal" step="any" value="1" data-conv-value />
        <select data-conv-from aria-label="Convert from unit"></select>
      </div>
      <button class="util-swap" type="button" data-conv-swap title="Swap units" aria-label="Swap units">⇄</button>
      <div class="util-field">
        <label for="conv-result">To</label>
        <input id="conv-result" type="text" readonly data-conv-result />
        <select data-conv-to aria-label="Convert to unit"></select>
      </div>
    </div>
    <div class="util-actions">
      <button class="util-btn" type="button" data-conv-copy>Copy result</button>
      <button class="util-btn" type="button" data-conv-reset>Reset</button>
    </div>
    <p class="util-note" data-conv-note></p>
    <div class="util-table-wrap">
      <table class="util-table">
        <caption>Same value in every unit</caption>
        <tbody data-conv-table></tbody>
      </table>
    </div>
  `;

  const categoryEl = utilityBody.querySelector("[data-conv-category]");
  const valueEl = utilityBody.querySelector("[data-conv-value]");
  const fromEl = utilityBody.querySelector("[data-conv-from]");
  const toEl = utilityBody.querySelector("[data-conv-to]");
  const resultEl = utilityBody.querySelector("[data-conv-result]");
  const noteEl = utilityBody.querySelector("[data-conv-note]");
  const tableEl = utilityBody.querySelector("[data-conv-table]");

  const persist = () => writeStored(UTIL_KEYS.converter, {
    category: categoryEl.value, from: fromEl.value, to: toEl.value,
  });

  const compute = (value, from, to, cfg) => (cfg.special
    ? convertTemperature(value, from, to)
    : (value * cfg.units[from]) / cfg.units[to]);

  const fillUnits = () => {
    const cfg = CONVERTER[categoryEl.value];
    const names = Object.keys(cfg.units);
    fromEl.innerHTML = names.map((u) => `<option value="${u}">${u}</option>`).join("");
    toEl.innerHTML = names.map((u) => `<option value="${u}">${u}</option>`).join("");
    const wantFrom = saved.category === categoryEl.value && cfg.units[saved.from] ? saved.from : cfg.from;
    const wantTo = saved.category === categoryEl.value && cfg.units[saved.to] ? saved.to : cfg.to;
    fromEl.value = wantFrom;
    toEl.value = wantTo;
    update();
  };

  const update = () => {
    const cfg = CONVERTER[categoryEl.value];
    const raw = Number(valueEl.value);
    if (!Number.isFinite(raw)) {
      resultEl.value = "";
      noteEl.textContent = "Enter a number to convert.";
      tableEl.innerHTML = "";
      return;
    }
    const from = fromEl.value;
    const to = toEl.value;
    const out = compute(raw, from, to, cfg);
    resultEl.value = utilFormat(out);
    noteEl.textContent = `${utilFormat(raw)} ${from} = ${utilFormat(out)} ${to}   ·   ${utilFormat(compute(1, from, to, cfg))} ${to} per 1 ${from}`;

    if (cfg.special) {
      const celsius = from === "°C" ? raw : from === "°F" ? ((raw - 32) * 5) / 9 : raw - 273.15;
      if (celsius < -273.15) noteEl.textContent += "   ·   Below absolute zero";
    }

    tableEl.innerHTML = Object.keys(cfg.units)
      .map((unit) => `<tr><th scope="row">${unit}</th><td>${utilFormat(compute(raw, from, unit, cfg))}</td></tr>`)
      .join("");
    persist();
  };

  categoryEl.value = saved.category && CONVERTER[saved.category] ? saved.category : categories[0];
  categoryEl.addEventListener("change", () => { saved.category = categoryEl.value; fillUnits(); });
  [valueEl, fromEl, toEl].forEach((el) => el.addEventListener("input", update));

  utilityBody.querySelector("[data-conv-swap]").addEventListener("click", () => {
    const from = fromEl.value;
    fromEl.value = toEl.value;
    toEl.value = from;
    const converted = resultEl.value.replace(/,/g, "");
    if (converted && Number.isFinite(Number(converted))) valueEl.value = converted;
    update();
  });
  utilityBody.querySelector("[data-conv-copy]").addEventListener("click", () => utilCopy(resultEl.value, "Result copied."));
  utilityBody.querySelector("[data-conv-reset]").addEventListener("click", () => {
    valueEl.value = "1";
    fillUnits();
  });

  fillUnits();
}

/* --------------------------------------------------- password generator */
const PASSPHRASE_WORDS = ("acorn admiral agate almond alpaca alder alley alloy almanac alpine altar amber anchor angle anvil apricot arbor arcade archer arctic arena argon armor aroma arrow aspen aspen astro atlas attic auburn aurora avocado axis azure badge bagel bakery balance baltic bamboo banner barley basil basin basket baton bayou beach beaker beetle bell belt bench bengal berry beryl bike birch biscuit bison blade blank blaze blend blimp blink bloom bluff board boat bobcat bolero bonus border boulder bouquet bow bowline bracket braid brass brawl bread breeze brick bridle brine brisk bronze brooch broom brush bubble bucket buffalo bulb bundle bunker buoy burrow bushel butane cabin cable cadet camel camera canal canary canoe canopy caper capsule caramel cardinal cargo carnival carrot cart carve cascade cashew castle catnip cavern caviar cedar cellar chalk chapel charm chart chime chisel chorus cider cinder cinnamon circle citrus civic clamp clarity clay cliff climate clinic cloak clock clove clover cluster coast cobra cocoa coconut coil comet compass cone copper coral cord cork corn cosmos cottage cougar council courier cove coyote crab cradle craft crane crater crayon creek crest cricket crimson crisp crocus crown cruise crumb crystal cube cumin curator curl current curve cushion cyclone cymbal dahlia dairy daisy dance dandelion dapper daring darter dawn deal decade decor deer delta denim depot derby desert detail dew diagonal dial diary diesel digit dill diner dinghy dinner disco dish dock doctor dodge dogwood dollar dolphin dome donkey donut doodle dory dove draft dragon drama drawer dream drift drill drizzle drone droplet drum dryad duchy dune dusk dust duty dwell dynamo eager eagle earl early earth easel east easy ebony echo eclipse eclair edge eddy editor effort egg eight elbow elder electric elegant element elephant elevn elixir elk elm ember emblem emerald emery empire engine english enigma envoy epic epoch equal equator era errand escape espresso essay estate etching ether ethics eucalyptus evening event everglade exact exit expert explorer extra fable fabric facade factor factory fahrenheit fair fairy falcon fall family famous fandom fantasy far farm fashion fathom feather fedora feline fellow fence fennel fern ferry festival fiber fiction fiddle field figure file filter final finch finder finger fir fire first fjord flag flair flannel flare flash flax fleet flicker flint float flock floor floral flour flow fluid flute foam fog foil fold foliage folk fond font food ford forest forge fork formal fortune forum fossil fountain foxglove frame free fresh friend fringe frock front frost fruit fudge fuel fudge galaxy gallery garden garlic garnet gate gather gauge gazebo gazelle gear gecko gem general gentle genuine geode geology gesture ghost giant gift ginger giraffe glacier glade gland glass glaze gleam glen glide glitter globe gloom glory glove glow glue gold gondola gong goose gorge gospel govern grace grade grain grand granite graph grasp grass gravel gravity gray grease green greet grid grill grin grip grove grow guard guest guide gulf gull gust habit hail hair hall halo hammer hamster harbor harmony harp harvest hatch haven hawk hay hazel head heart heath hedge helium helm herb herd heritage hero heron hickory hidden high hike hill hinge hint hippo hive hobby hockey hold hollow holly honey hood hoof horizon horn horse host hotel hound house hub huge human humble humid humor hunter hurdle hut hydro hymn ibex ice icon idea igloo image impact inch index indigo ink inlet inner input iris iron island ivory ivy jackal jacket jade jaguar jar jasmine jasper jaw jazz jelly jet jewel jigsaw job jog join joke journal journey joy judge juice jumbo jump junco jungle juniper jury justice kale kanga kayak keel keen kelp kernel kettle key keystone kid kiln kind king kiosk kite kitten kiwi knoll knot koala koi label labor ladder lagoon lake lamb lamp lance land lane lantern lap larch large larva laser lasso latch late lava lawn layer leaf league leather ledge leek legend legume lemon lentil leopard level lever liberty library lichen life lift light lilac lily lime limit linen link lion liquid list literal little live lizard llama load loaf lobby lobster local lock lodge loft logic log lotus loud lounge love loyal lucid lucky lumber lunar lunch lupine lyric macaw machine magma magnet maize major mango manor mantle maple marble march margin marina mark market marsh mask mason mast match matrix mauve meadow medal media medley meet melody melon member memory menthol menu mercury merge merit mesa mesh message metal meteor method metric midge midnight might mild mile milk mill miller mimic mind mine mint minute mirage mirror mist mitten mix moat mobile model modern modest module mohair moist molar moment monarch money monitor monkey monsoon month moon moose moped moral more morning mortar mosaic moss motel moth motion motor mound mount mouse mouth move movie mower mud muffin mug mulberry mule museum mushroom music mustang myrtle mystic nadir nail name napkin narrow native nature naval near neat nectar needle neighbor neon nephew nest net nettle network neutral new news next nice niche nickel niece night nimble nine noble nod noise nomad noon north nose note notice novel nudge number nurse nut oak oasis oat ocean ochre octave odd offer office often oil old olive omega onion online onset opal open opera orbit orchard orchid order organ orient origin osprey otter ounce outer outfit oval oven over owl own oxide oxygen oyster pace pack paddle page paint pair palace pale palm panda panel panic pantry papaya paper parade parcel parfait park parrot parsley part party pass pasta pastel patio patrol pattern pause pave peach peacock peak peanut pear pearl pebble pecan pedal peel pegasus pelican pen pencil penguin penny peony pepper perch perfect pet petal pewter phantom phase pheasant phone photo phrase piano picnic picture pie pier pigeon pike pilot pinch pine pink pint pioneer pipe piston pitch pivot pixel pizza place plain plane planet plank plant plaster plate play plaza pleasant pledge plenty plot plow plum plumber plunge plywood pocket poem poet point polar pole polish pollen pond pony poodle pool poppy porch portal porter pose posit postal pot potato pottery pouch pounce powder power prairie praise prawn precise prefix press pretty price pride prime prince print prism prize probe process produce profit prompt proof proper prose protect proud prove prune public pudding puddle puff pull pulley pulse puma pumpkin punch pupil puppy purple purse puzzle pyramid quail quaint quake quality quartz quay queen quest quick quiet quill quilt quince quiver quote rabbit raccoon race rack radar radio radish raft rail rain rainbow raise raisin rake rally ram ranch range rapid rare raven ray razor reach read ready realm reason rebel recall recipe record red reed reef refer reflect regal region relay release relic relief rely remain remedy remind remote render renew rent repair repeat report rescue reserve reset resin resolve resort rest result retina retreat return reveal review revive reward rhino rhubarb ribbon rice ridge rifle right rigid rim ring rinse ripe ripple rise risk ritual rival river road roast robin robot rock rocket rod rodeo roll roof rook room root rope rose rotate rough round route rover row royal rub ruby rudder rugby ruler rumble runner rural rush rust safe saffron sage sail saint salad salmon salon salt sample sand sandal sapphire sardine satin sauce sauna save saw say scale scan scarf scatter scene scent school science scissors scope score scout scrap screen script scroll sea seal search season seat second secret section seed seek seem select self sell send senior sense sequel serene series serve set settle seven shade shadow shaft shallow shape share shark sharp shave shed sheep sheet shelf shell shelter shield shift shine ship shirt shock shoe shop shore short shot shoulder shout show shower shrimp shrine shrub shuffle shy sibling side siege sight sign silk silly silver simple sing sink siren sister site six size skate sketch ski skill skin skirt sky slate sleep sleeve slice slide slim slope slot slow small smart smile smoke smooth snack snail snake snap sneak snow soap soccer social sock soda sofa soft soil solar sold solid solve song soon sort soul sound soup source south space spade spare spark speak spear special speed spell sphere spice spider spike spin spine spiral spirit split spoke sponge spoon sport spot spray spread spring spruce spur square squash squad squirrel stable stack stadium staff stage stair stake stamp stand star start state station stay steady steam steel steep stem step stereo stick still stitch stock stone stool stop store stork storm story stove strap straw stream street stretch strike string strong studio study stuff style sugar suit summer summit sun sundial sunny sunset super supply sure surf surge surprise survey swift swim swing switch sword symbol syrup system table tackle tactic tag tail tailor take tale talent talk tall tan tandem tank tape target task taste tavern tea teach team teal teapot tear tech tell temple ten tender tennis tent term terrain test text thank that thaw theater theme thick thin thing think third thorn thought thread three thrive throne throw thumb thunder ticket tide tidy tie tiger tight tile till tilt timber time tin tiny tip tire title toast today toe together token toll tomato tone tongue tool tooth top topic torch total touch tour tower town toy trace track trade trail train trait tram trap travel tray treasure treat tree trend trial tribe trick trigger trim trio trip trophy tropic trouble truck true trumpet trunk trust truth tube tulip tumble tuna tunnel turbo turn turtle tusk tutor twig twin twist two type ultra umber uncle under uniform union unique unit unity up upper urban usage use useful usual utter valley value valve van vanilla vapor vary vase vast vault vector veil velvet vendor venue verb verge verse very vessel vet via vibe vice video view vigor villa vine vinyl viola violet violin viper virtue visible vision visit visual vital vivid vocal voice void volcano volume vote voyage waffle wagon waist wait wake walk wall walnut walrus wand wander want war warm warn wash wasp waste watch water wave wax way weak wealth wear weather weave web wedge week weight welcome weld well west wet whale wheat wheel when where while whisker whisper white whole wide widget width wild will willow win wind window wine wing wink winner winter wire wisdom wise wish wit wolf woman wonder wood wool word work world worm worry worth wrap wrench wrist write yacht yak yard yarn year yeast yellow yes yield yoga yogurt young youth zebra zen zero zest zigzag zinc zip zone zoo zoom").split(" ");

function utilRandomInt(max) {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % max;
}

function generatePassword(options) {
  const sets = [];
  if (options.upper) sets.push(options.excludeAmbiguous ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (options.lower) sets.push(options.excludeAmbiguous ? "abcdefghijkmnopqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz");
  if (options.digits) sets.push(options.excludeAmbiguous ? "23456789" : "0123456789");
  if (options.symbols) sets.push("!@#$%^&*()-_=+[]{};:,.?/");
  if (!sets.length) return "";

  let pool = sets.join("");
  if (options.exclude) pool = [...pool].filter((c) => !options.exclude.includes(c)).join("");
  if (!pool) return "";

  const length = Math.max(sets.length, options.length);
  const chars = sets
    .map((set) => [...set].filter((c) => !options.exclude || !options.exclude.includes(c)))
    .filter((set) => set.length)
    .map((set) => set[utilRandomInt(set.length)]);
  while (chars.length < length) chars.push(pool[utilRandomInt(pool.length)]);
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = utilRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function generatePassphrase(options) {
  const words = [];
  for (let i = 0; i < options.words; i += 1) {
    let word = PASSPHRASE_WORDS[utilRandomInt(PASSPHRASE_WORDS.length)];
    if (options.capitalize) word = word[0].toUpperCase() + word.slice(1);
    words.push(word);
  }
  if (options.number) words.push(String(utilRandomInt(90) + 10));
  return words.join(options.separator || "-");
}

function renderPassword() {
  const saved = readStored(UTIL_KEYS.password, null) || {};
  const state = {
    mode: saved.mode === "passphrase" ? "passphrase" : "random",
    length: saved.length || 16,
    words: saved.words || 5,
    separator: saved.separator || "-",
    capitalize: saved.capitalize !== false,
    number: saved.number !== false,
    upper: saved.upper !== false,
    lower: saved.lower !== false,
    digits: saved.digits !== false,
    symbols: saved.symbols !== false,
    excludeAmbiguous: Boolean(saved.excludeAmbiguous),
    exclude: saved.exclude || "",
  };

  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="pw-mode">Mode</label>
      <select id="pw-mode" data-pw-mode>
        <option value="random">Random characters</option>
        <option value="passphrase">Memorable passphrase</option>
      </select>
    </div>
    <div data-pw-random>
      <div class="util-field">
        <label for="pw-length">Length: <output data-pw-len>16</output></label>
        <input id="pw-length" type="range" min="8" max="64" value="16" data-pw-range />
      </div>
      <div class="util-toggles">
        <label><input type="checkbox" data-pw="upper" checked /> A–Z</label>
        <label><input type="checkbox" data-pw="lower" checked /> a–z</label>
        <label><input type="checkbox" data-pw="digits" checked /> 0–9</label>
        <label><input type="checkbox" data-pw="symbols" checked /> !@#$</label>
        <label><input type="checkbox" data-pw="excludeAmbiguous" /> Exclude look-alikes</label>
      </div>
      <div class="util-field">
        <label for="pw-exclude">Never include these characters</label>
        <input id="pw-exclude" type="text" maxlength="30" placeholder="e.g. {}[]&lt;&gt;" data-pw-exclude />
      </div>
    </div>
    <div data-pw-phrase hidden>
      <div class="util-field">
        <label for="pw-words">Words: <output data-pw-words>5</output></label>
        <input id="pw-words" type="range" min="3" max="8" value="5" data-pw-words-range />
      </div>
      <div class="util-field">
        <label for="pw-sep">Separator</label>
        <select id="pw-sep" data-pw-separator>
          <option value="-">- (dash)</option>
          <option value=".">. (dot)</option>
          <option value="_">_ (underscore)</option>
          <option value=" ">space</option>
        </select>
      </div>
      <div class="util-toggles">
        <label><input type="checkbox" data-pw="capitalize" checked /> Capitalise</label>
        <label><input type="checkbox" data-pw="number" checked /> Add a number</label>
      </div>
    </div>
    <div class="pw-output">
      <input type="text" readonly data-pw-out aria-label="Generated password" />
      <button type="button" data-pw-copy>Copy</button>
    </div>
    <div class="meter" aria-hidden="true"><span data-pw-meter></span></div>
    <p class="util-note" data-pw-strength></p>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-pw-generate>Generate new</button>
      <button class="util-btn" type="button" data-pw-batch>3 options</button>
    </div>
  `;

  const modeEl = utilityBody.querySelector("[data-pw-mode]");
  const randomWrap = utilityBody.querySelector("[data-pw-random]");
  const phraseWrap = utilityBody.querySelector("[data-pw-phrase]");
  const rangeEl = utilityBody.querySelector("[data-pw-range]");
  const lenEl = utilityBody.querySelector("[data-pw-len]");
  const wordsRange = utilityBody.querySelector("[data-pw-words-range]");
  const wordsOut = utilityBody.querySelector("[data-pw-words]");
  const sepEl = utilityBody.querySelector("[data-pw-separator]");
  const excludeEl = utilityBody.querySelector("[data-pw-exclude]");
  const outEl = utilityBody.querySelector("[data-pw-out]");
  const strengthEl = utilityBody.querySelector("[data-pw-strength]");
  const meterEl = utilityBody.querySelector("[data-pw-meter]");
  const generateBtn = utilityBody.querySelector("[data-pw-generate]");

  const sync = () => {
    state.mode = modeEl.value;
    state.length = Number(rangeEl.value);
    state.words = Number(wordsRange.value);
    state.separator = sepEl.value;
    state.exclude = excludeEl.value;
    utilityBody.querySelectorAll("[data-pw]").forEach((input) => {
      state[input.dataset.pw] = input.checked;
    });
    lenEl.textContent = String(state.length);
    wordsOut.textContent = String(state.words);
    randomWrap.hidden = state.mode !== "random";
    phraseWrap.hidden = state.mode !== "passphrase";
    writeStored(UTIL_KEYS.password, state);
  };

  const refresh = () => {
    sync();
    const value = state.mode === "passphrase" ? generatePassphrase(state) : generatePassword(state);
    outEl.value = value || "Select at least one character set";
    generateBtn.disabled = !value;

    if (!value) {
      strengthEl.textContent = "Pick at least one character set.";
      meterEl.style.width = "0%";
      return;
    }
    const poolSize = state.mode === "passphrase"
      ? PASSPHRASE_WORDS.length
      : (state.upper ? 26 : 0) + (state.lower ? 26 : 0) + (state.digits ? 10 : 0) + (state.symbols ? 24 : 0);
    const units = state.mode === "passphrase" ? state.words + (state.number ? 1 : 0) : state.length;
    const bits = Math.round(units * Math.log2(Math.max(2, poolSize)));
    const label = bits >= 110 ? "Excellent" : bits >= 80 ? "Strong" : bits >= 60 ? "Good" : bits >= 40 ? "Fair" : "Weak";
    strengthEl.textContent = `${label} — about ${bits} bits of entropy`;
    meterEl.style.width = `${Math.min(100, Math.round((bits / 128) * 100))}%`;
  };

  modeEl.value = state.mode;
  rangeEl.value = String(state.length);
  wordsRange.value = String(state.words);
  sepEl.value = state.separator;
  excludeEl.value = state.exclude;
  utilityBody.querySelectorAll("[data-pw]").forEach((input) => {
    input.checked = Boolean(state[input.dataset.pw]);
  });

  [modeEl, rangeEl, wordsRange, sepEl, excludeEl].forEach((el) => el.addEventListener("input", refresh));
  utilityBody.querySelectorAll("[data-pw]").forEach((input) => input.addEventListener("change", refresh));
  generateBtn.addEventListener("click", refresh);
  utilityBody.querySelector("[data-pw-copy]").addEventListener("click", () => utilCopy(outEl.value, "Password copied."));
  utilityBody.querySelector("[data-pw-batch]").addEventListener("click", () => {
    sync();
    const options = [];
    for (let i = 0; i < 3; i += 1) {
      options.push(state.mode === "passphrase" ? generatePassphrase(state) : generatePassword(state));
    }
    outEl.value = options.join("  ·  ");
    strengthEl.textContent = "Three options — copy the one you like.";
    meterEl.style.width = "60%";
  });

  refresh();
}

/* ------------------------------------------------------- word counter */
function renderWordCounter() {
  const saved = readStored(UTIL_KEYS.wordcount, null) || {};
  utilityBody.innerHTML = `
    <textarea class="util-textarea" data-wc-input placeholder="Start typing or paste your text…" aria-label="Text to count"></textarea>
    <div class="util-field">
      <label for="wc-limit">Character target: <output data-wc-limit-out>280</output></label>
      <input id="wc-limit" type="range" min="50" max="3000" step="10" value="280" data-wc-limit />
    </div>
    <div class="meter" aria-hidden="true"><span data-wc-meter></span></div>
    <div class="stat-grid">
      <div class="stat"><span data-wc="words">0</span><small>Words</small></div>
      <div class="stat"><span data-wc="chars">0</span><small>Characters</small></div>
      <div class="stat"><span data-wc="charsNoSpace">0</span><small>No spaces</small></div>
      <div class="stat"><span data-wc="sentences">0</span><small>Sentences</small></div>
      <div class="stat"><span data-wc="paragraphs">0</span><small>Paragraphs</small></div>
      <div class="stat"><span data-wc="reading">0 min</span><small>Reading</small></div>
      <div class="stat"><span data-wc="speaking">0 min</span><small>Speaking</small></div>
      <div class="stat"><span data-wc="avg">0</span><small>Avg word</small></div>
      <div class="stat"><span data-wc="longest">—</span><small>Longest word</small></div>
    </div>
    <div class="util-actions">
      <button class="util-btn" data-wc-case="upper">UPPER</button>
      <button class="util-btn" data-wc-case="lower">lower</button>
      <button class="util-btn" data-wc-case="title">Title Case</button>
      <button class="util-btn" data-wc-case="sentence">Sentence case</button>
      <button class="util-btn" data-wc-case="trim">Trim spaces</button>
      <button class="util-btn" data-wc-copy>Copy text</button>
      <button class="util-btn" data-wc-clear>Clear</button>
    </div>
    <p class="util-note" data-wc-keywords></p>
  `;

  const input = utilityBody.querySelector("[data-wc-input]");
  const limitEl = utilityBody.querySelector("[data-wc-limit]");
  const limitOut = utilityBody.querySelector("[data-wc-limit-out]");
  const meter = utilityBody.querySelector("[data-wc-meter]");
  const kwEl = utilityBody.querySelector("[data-wc-keywords]");
  const out = (key) => utilityBody.querySelector(`[data-wc="${key}"]`);

  input.value = saved.text || "";
  if (saved.limit) limitEl.value = String(saved.limit);

  const update = () => {
    const text = input.value;
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const sentences = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g) || []).length || 1 : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    const limit = Number(limitEl.value);
    const longest = words.reduce((best, word) => (word.replace(/[^\p{L}\p{N}]/gu, "").length > best.length ? word : best), "");
    const totalLetters = words.reduce((sum, word) => sum + word.replace(/[^\p{L}\p{N}]/gu, "").length, 0);

    out("words").textContent = String(words.length);
    out("chars").textContent = String(text.length);
    out("charsNoSpace").textContent = String(text.replace(/\s/g, "").length);
    out("sentences").textContent = String(sentences);
    out("paragraphs").textContent = String(paragraphs);
    out("reading").textContent = `${Math.max(words.length ? 1 : 0, Math.round(words.length / 200))} min`;
    out("speaking").textContent = `${Math.max(words.length ? 1 : 0, Math.round(words.length / 130))} min`;
    out("avg").textContent = words.length ? (totalLetters / words.length).toFixed(1) : "0";
    out("longest").textContent = longest || "—";

    limitOut.textContent = String(limit);
    const ratio = limit ? Math.min(1, text.length / limit) : 0;
    meter.style.width = `${Math.round(ratio * 100)}%`;
    meter.parentElement.classList.toggle("is-over", text.length > limit);

    const counts = new Map();
    words.forEach((word) => {
      const key = word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
      if (key.length < 3) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    kwEl.textContent = top.length ? `Top words: ${top.map(([w, n]) => `${w} (${n})`).join(", ")}` : "";

    writeStored(UTIL_KEYS.wordcount, { text, limit });
  };

  const applyCase = (kind) => {
    let text = input.value;
    if (kind === "upper") text = text.toUpperCase();
    else if (kind === "lower") text = text.toLowerCase();
    else if (kind === "title") text = text.replace(/\p{L}[\p{L}'’]*/gu, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
    else if (kind === "sentence") text = text.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (m) => m.toUpperCase());
    else if (kind === "trim") text = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    input.value = text;
    update();
  };

  input.addEventListener("input", update);
  limitEl.addEventListener("input", update);
  utilityBody.querySelectorAll("[data-wc-case]").forEach((button) => {
    button.addEventListener("click", () => applyCase(button.dataset.wcCase));
  });
  utilityBody.querySelector("[data-wc-copy]").addEventListener("click", () => utilCopy(input.value, "Text copied."));
  utilityBody.querySelector("[data-wc-clear]").addEventListener("click", () => {
    input.value = "";
    update();
    input.focus();
  });

  update();
}

/* ----------------------------------------------------------- to-do list */
function readTodos() {
  const stored = readStored(UTIL_KEYS.todo, []);
  return Array.isArray(stored) ? stored.filter((item) => item && typeof item.text === "string") : [];
}

function renderTodo() {
  utilityBody.innerHTML = `
    <form class="todo-add" data-todo-form>
      <input type="text" maxlength="140" placeholder="Add a task…" aria-label="New task" data-todo-input />
      <input type="date" aria-label="Due date (optional)" data-todo-due />
      <button type="submit">Add</button>
    </form>
    <div class="todo-filters" role="group" aria-label="Filter tasks">
      <button type="button" class="is-active" data-todo-filter="all">All</button>
      <button type="button" data-todo-filter="active">Active</button>
      <button type="button" data-todo-filter="done">Done</button>
      <button type="button" data-todo-filter="clear">Clear done</button>
      <button type="button" data-todo-filter="clear-all">Clear all</button>
    </div>
    <p class="util-note" data-todo-count></p>
    <ul class="todo-list" data-todo-list></ul>
    <p class="util-note" data-todo-empty>No tasks yet — add one above.</p>
  `;

  let todos = readTodos();
  let filter = "all";
  const listEl = utilityBody.querySelector("[data-todo-list]");
  const emptyEl = utilityBody.querySelector("[data-todo-empty]");
  const countEl = utilityBody.querySelector("[data-todo-count]");

  const save = () => writeStored(UTIL_KEYS.todo, todos);

  const move = (id, delta) => {
    const index = todos.findIndex((t) => t.id === id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= todos.length) return;
    [todos[index], todos[target]] = [todos[target], todos[index]];
    save();
    paint();
  };

  const paint = () => {
    listEl.replaceChildren();
    const visible = todos.filter((t) => (filter === "active" ? !t.done : filter === "done" ? t.done : true));
    const today = new Date().toISOString().slice(0, 10);

    visible.forEach((todo) => {
      const item = document.createElement("li");
      item.className = `todo-item${todo.done ? " is-done" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(todo.done);
      checkbox.setAttribute("aria-label", `Mark "${todo.text}" as ${todo.done ? "not done" : "done"}`);
      checkbox.addEventListener("change", () => {
        todo.done = checkbox.checked;
        save();
        paint();
      });

      const label = document.createElement("span");
      label.textContent = todo.text;

      const meta = document.createElement("small");
      meta.className = "todo-meta";
      if (todo.due) {
        meta.textContent = todo.due;
        if (!todo.done && todo.due < today) meta.classList.add("is-overdue");
      }

      const actions = document.createElement("span");
      actions.className = "todo-actions";

      const up = document.createElement("button");
      up.type = "button";
      up.textContent = "↑";
      up.setAttribute("aria-label", `Move "${todo.text}" up`);
      up.addEventListener("click", () => move(todo.id, -1));

      const down = document.createElement("button");
      down.type = "button";
      down.textContent = "↓";
      down.setAttribute("aria-label", `Move "${todo.text}" down`);
      down.addEventListener("click", () => move(todo.id, 1));

      const edit = document.createElement("button");
      edit.type = "button";
      edit.textContent = "✎";
      edit.setAttribute("aria-label", `Edit "${todo.text}"`);
      edit.addEventListener("click", () => {
        const field = document.createElement("input");
        field.type = "text";
        field.value = todo.text;
        field.maxLength = 140;
        field.className = "todo-edit";
        const commit = () => {
          const value = field.value.trim();
          if (value) todo.text = value;
          save();
          paint();
        };
        field.addEventListener("keydown", (event) => {
          if (event.key === "Enter") { event.preventDefault(); commit(); }
          if (event.key === "Escape") paint();
        });
        field.addEventListener("blur", commit);
        label.replaceWith(field);
        field.focus();
        field.select();
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Delete "${todo.text}"`);
      remove.addEventListener("click", () => {
        todos = todos.filter((t) => t.id !== todo.id);
        save();
        paint();
      });

      actions.append(up, down, edit, remove);
      item.append(checkbox, label, meta, actions);
      listEl.append(item);
    });

    const active = todos.filter((t) => !t.done).length;
    countEl.textContent = todos.length ? `${active} active · ${todos.length - active} done` : "";
    emptyEl.textContent = visible.length ? "" : todos.length ? "Nothing in this filter." : "No tasks yet — add one above.";
  };

  utilityBody.querySelector("[data-todo-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = utilityBody.querySelector("[data-todo-input]");
    const dueEl = utilityBody.querySelector("[data-todo-due]");
    const text = input.value.trim();
    if (!text) return;
    todos.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text, done: false, due: dueEl.value || "" });
    input.value = "";
    dueEl.value = "";
    save();
    paint();
    input.focus();
  });

  utilityBody.querySelector("[data-todo-input]").addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.target.value = "";
    }
  });

  utilityBody.querySelectorAll("[data-todo-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.todoFilter;
      if (value === "clear") {
        todos = todos.filter((t) => !t.done);
        save();
        paint();
        return;
      }
      if (value === "clear-all") {
        if (todos.length && window.confirm("Delete all tasks?")) {
          todos = [];
          save();
          paint();
        }
        return;
      }
      filter = value;
      utilityBody.querySelectorAll("[data-todo-filter]").forEach((b) => {
        b.classList.toggle("is-active", b === button);
      });
      paint();
    });
  });

  paint();
}

/* ------------------------------------------------------ date calculator */
function dateFieldHTML(key, labelText) {
  return `
    <div class="util-field">
      <label>${labelText}</label>
      <div class="date-input" data-date-field="${key}">
        <input type="number" inputmode="numeric" placeholder="DD" min="1" max="31" data-date-part="day" aria-label="${labelText} — day" />
        <span class="date-sep" aria-hidden="true">/</span>
        <input type="number" inputmode="numeric" placeholder="MM" min="1" max="12" data-date-part="month" aria-label="${labelText} — month" />
        <span class="date-sep" aria-hidden="true">/</span>
        <input type="number" inputmode="numeric" placeholder="YYYY" min="1900" max="2100" data-date-part="year" aria-label="${labelText} — year" />
      </div>
    </div>`;
}

function readDateField(container) {
  if (!container) return null;
  const day = Number(container.querySelector('[data-date-part="day"]').value);
  const month = Number(container.querySelector('[data-date-part="month"]').value);
  const year = Number(container.querySelector('[data-date-part="year"]').value);
  if (!day || !month || !year || year < 1900 || year > 2100) return null;
  const date = new Date(year, month - 1, day);
  const valid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? date : null;
}

function dateFieldFilled(container) {
  if (!container) return false;
  return ["day", "month", "year"].every(
    (part) => container.querySelector(`[data-date-part="${part}"]`).value !== ""
  );
}

function writeDateField(container, date) {
  if (!container) return;
  const dayEl = container.querySelector('[data-date-part="day"]');
  const monthEl = container.querySelector('[data-date-part="month"]');
  const yearEl = container.querySelector('[data-date-part="year"]');
  if (!date) {
    dayEl.value = "";
    monthEl.value = "";
    yearEl.value = "";
    return;
  }
  dayEl.value = String(date.getDate());
  monthEl.value = String(date.getMonth() + 1);
  yearEl.value = String(date.getFullYear());
}

function wireDateField(container, onChange) {
  if (!container) return;
  const dayEl = container.querySelector('[data-date-part="day"]');
  const monthEl = container.querySelector('[data-date-part="month"]');
  const yearEl = container.querySelector('[data-date-part="year"]');

  const clean = (input) => {
    input.value = input.value.replace(/\D/g, "").slice(0, 4);
  };

  // These are tiny numeric boxes: clearing on focus makes typing predictable
  // (no half-replaced values like "0102") and keeps the year easy to retype.
  [dayEl, monthEl, yearEl].forEach((input) => {
    input.addEventListener("focus", () => {
      input.value = "";
    });
    // Clicking a field that already has focus does not fire "focus", so clear on
    // click too — otherwise typing appends to the old value.
    input.addEventListener("click", () => {
      input.value = "";
    });
    input.addEventListener("blur", () => {
      if (input.value === "") return;
      const part = input.dataset.datePart;
      const value = Number(input.value);
      const min = part === "year" ? 1900 : 1;
      const max = part === "day" ? 31 : part === "month" ? 12 : 2100;
      if (value < min || value > max) input.value = "";
    });
  });

  dayEl.addEventListener("input", () => {
    clean(dayEl);
    if (dayEl.value.length === 2) monthEl.focus();
    onChange();
  });
  monthEl.addEventListener("input", () => {
    clean(monthEl);
    if (monthEl.value.length === 2) yearEl.focus();
    onChange();
  });
  yearEl.addEventListener("input", () => {
    clean(yearEl);
    onChange();
  });
}

function renderDateCalculator() {
  const saved = readStored(UTIL_KEYS.dates, null) || {};
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const iso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const weekday = (date) => date.toLocaleDateString("en-IN", { weekday: "long" });

  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="date-mode">Mode</label>
      <select id="date-mode" data-date-mode>
        <option value="age">Age from a birth date</option>
        <option value="diff">Between two dates</option>
        <option value="add">Add or subtract days</option>
      </select>
    </div>
    <div class="date-row">
      <div data-date-a-wrap>${dateFieldHTML("a", "Birth date")}</div>
      <div data-date-b-wrap>${dateFieldHTML("b", "To date")}</div>
    </div>
    <div class="util-field" data-date-offset-wrap hidden>
      <label for="date-offset">Days to add (use a negative number to subtract)</label>
      <input id="date-offset" type="number" step="1" value="90" data-date-offset />
    </div>
    <div class="util-actions">
      <button class="util-btn" type="button" data-date-today>Set first date to today</button>
      <button class="util-btn" type="button" data-date-clear>Clear</button>
    </div>
    <div class="stat-grid" data-date-stats></div>
    <p class="util-note" data-date-note></p>
  `;

  const modeEl = utilityBody.querySelector("[data-date-mode]");
  const aField = utilityBody.querySelector('[data-date-field="a"]');
  const bField = utilityBody.querySelector('[data-date-field="b"]');
  const bWrap = utilityBody.querySelector("[data-date-b-wrap]");
  const aWrapLabel = utilityBody.querySelector("[data-date-a-wrap] label");
  const offsetWrap = utilityBody.querySelector("[data-date-offset-wrap]");
  const offsetEl = utilityBody.querySelector("[data-date-offset]");
  const statsEl = utilityBody.querySelector("[data-date-stats]");
  const noteEl = utilityBody.querySelector("[data-date-note]");

  const stat = (value, label) => `<div class="stat"><span>${value}</span><small>${label}</small></div>`;

  const businessDays = (from, to) => {
    let count = 0;
    const cursor = new Date(from);
    while (cursor < to) {
      cursor.setDate(cursor.getDate() + 1);
      const day = cursor.getDay();
      if (day !== 0 && day !== 6) count += 1;
    }
    return count;
  };

  const update = () => {
    const mode = modeEl.value;
    writeStored(UTIL_KEYS.dates, { mode });

    bWrap.hidden = mode === "add";
    offsetWrap.hidden = mode !== "add";
    aWrapLabel.textContent = mode === "age" ? "Birth date" : mode === "add" ? "Start date" : "From date";

    const start = readDateField(aField);

    if (mode === "add") {
      if (!start) {
        statsEl.innerHTML = stat("—", "Enter a start date");
        noteEl.textContent = "Type the day, month and year.";
        return;
      }
      const days = Math.trunc(Number(offsetEl.value) || 0);
      const result = new Date(start);
      result.setDate(result.getDate() + days);
      statsEl.innerHTML = [
        stat(iso(result), "Resulting date"),
        stat(weekday(result), "Weekday"),
        stat(String(days), "Days shifted"),
      ].join("");
      noteEl.textContent = `${iso(start)} (${weekday(start)}) ${days >= 0 ? "+" : "−"} ${Math.abs(days)} days`;
      return;
    }

    if (!start) {
      statsEl.innerHTML = stat("—", mode === "age" ? "Enter a birth date" : "Enter both dates");
      noteEl.textContent = dateFieldFilled(aField)
        ? "That date doesn't exist — check the day and month."
        : "Type the day, month and year in each box.";
      return;
    }

    const end = mode === "age" ? todayDate : readDateField(bField);
    if (!end) {
      statsEl.innerHTML = stat("—", "Enter the second date");
      noteEl.textContent = dateFieldFilled(bField)
        ? "That date doesn't exist — check the day and month."
        : "Fill in the second date.";
      return;
    }

    if (mode === "age" && start > todayDate) {
      statsEl.innerHTML = stat("—", "Birth date is in the future");
      noteEl.textContent = "Check the year — it should be in the past.";
      return;
    }

    const [from, to] = start <= end ? [start, end] : [end, start];
    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();
    if (days < 0) {
      months -= 1;
      days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalDays = Math.round((to - from) / 86400000);

    if (mode === "age") {
      const next = new Date(todayDate.getFullYear(), start.getMonth(), start.getDate());
      if (next < todayDate) next.setFullYear(next.getFullYear() + 1);
      const untilBirthday = Math.round((next - todayDate) / 86400000);
      statsEl.innerHTML = [
        stat(`${years}y ${months}m ${days}d`, "Age"),
        stat(String(totalDays), "Days lived"),
        stat(untilBirthday === 0 ? "Today!" : String(untilBirthday), "Days to birthday"),
        stat(weekday(start), "Born on"),
      ].join("");
      noteEl.textContent = `Next birthday: ${iso(next)} (${weekday(next)})`;
      return;
    }

    statsEl.innerHTML = [
      stat(`${years}y ${months}m ${days}d`, "Difference"),
      stat(String(totalDays), "Total days"),
      stat(String(Math.floor(totalDays / 7)), "Weeks"),
      stat(String(businessDays(from, to)), "Business days"),
    ].join("");
    noteEl.textContent = `${iso(from)} (${weekday(from)}) → ${iso(to)} (${weekday(to)})`;
  };

  modeEl.value = saved.mode || "age";
  modeEl.addEventListener("change", update);
  wireDateField(aField, update);
  wireDateField(bField, update);
  offsetEl.addEventListener("input", update);

  utilityBody.querySelector("[data-date-today]").addEventListener("click", () => {
    writeDateField(aField, todayDate);
    update();
  });
  utilityBody.querySelector("[data-date-clear]").addEventListener("click", () => {
    writeDateField(aField, null);
    writeDateField(bField, null);
    update();
  });

  writeDateField(bField, todayDate);
  update();
}

/* ------------------------------------------------------- GST calculator */
const GST_KEY = "flip-watch-gst";

function renderGst() {
  const saved = readStored(GST_KEY, null) || {};
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="gst-amount">Amount (₹)</label>
      <input id="gst-amount" type="number" inputmode="decimal" step="any" data-gst-amount />
    </div>
    <div class="util-actions" data-gst-presets>
      <button class="util-btn" data-gst-preset="500">₹500</button>
      <button class="util-btn" data-gst-preset="1000">₹1,000</button>
      <button class="util-btn" data-gst-preset="5000">₹5,000</button>
      <button class="util-btn" data-gst-preset="10000">₹10,000</button>
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="gst-rate">GST rate</label>
        <select id="gst-rate" data-gst-rate>
          <option value="0.25">0.25%</option>
          <option value="3">3%</option>
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18">18%</option>
          <option value="28">28%</option>
          <option value="custom">Custom…</option>
        </select>
      </div>
      <div class="util-field" data-gst-custom-wrap hidden>
        <label for="gst-custom">Custom rate (%)</label>
        <input id="gst-custom" type="number" inputmode="decimal" step="any" min="0" max="100" value="18" data-gst-custom />
      </div>
    </div>
    <div class="util-toggles">
      <label><input type="radio" name="gst-mode" value="exclusive" data-gst-mode /> Amount is before GST</label>
      <label><input type="radio" name="gst-mode" value="inclusive" data-gst-mode /> Amount includes GST</label>
    </div>
    <div class="stat-grid" data-gst-stats></div>
    <div class="util-actions">
      <button class="util-btn" type="button" data-gst-copy>Copy breakdown</button>
    </div>
    <p class="util-note" data-gst-note></p>
  `;

  const amountEl = utilityBody.querySelector("[data-gst-amount]");
  const rateEl = utilityBody.querySelector("[data-gst-rate]");
  const customWrap = utilityBody.querySelector("[data-gst-custom-wrap]");
  const customEl = utilityBody.querySelector("[data-gst-custom]");
  const statsEl = utilityBody.querySelector("[data-gst-stats]");
  const noteEl = utilityBody.querySelector("[data-gst-note]");
  const money = (value) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const stat = (value, label) => `<div class="stat"><span>${value}</span><small>${label}</small></div>`;
  let last = null;

  const rateValue = () => (rateEl.value === "custom" ? Number(customEl.value) : Number(rateEl.value));

  const update = () => {
    customWrap.hidden = rateEl.value !== "custom";
    const amount = Number(amountEl.value);
    const percent = rateValue();
    const inclusive = utilityBody.querySelector("[data-gst-mode]:checked")?.value === "inclusive";

    if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(percent) || percent < 0) {
      statsEl.innerHTML = stat("—", "Enter an amount and rate");
      noteEl.textContent = "";
      last = null;
      return;
    }

    const rate = percent / 100;
    const base = inclusive ? amount / (1 + rate) : amount;
    const gst = inclusive ? amount - base : amount * rate;
    const total = base + gst;

    statsEl.innerHTML = [
      stat(money(base), "Base amount"),
      stat(money(gst), "GST"),
      stat(money(gst / 2), "CGST"),
      stat(money(gst / 2), "SGST"),
      stat(money(total), "Total"),
    ].join("");
    noteEl.textContent = `${money(base)} + ${percent}% GST = ${money(total)} · split as ${percent / 2}% CGST + ${percent / 2}% SGST`;

    last = { base, gst, total, percent };
    writeStored(GST_KEY, { amount: amountEl.value, rate: rateEl.value, custom: customEl.value, mode: inclusive ? "inclusive" : "exclusive" });
  };

  rateEl.value = saved.rate || "18";
  amountEl.value = saved.amount ?? "1000";
  customEl.value = saved.custom || "18";
  const savedMode = utilityBody.querySelector(`[data-gst-mode][value="${saved.mode === "inclusive" ? "inclusive" : "exclusive"}"]`);
  if (savedMode) savedMode.checked = true;

  [amountEl, rateEl, customEl].forEach((el) => el.addEventListener("input", update));
  utilityBody.querySelectorAll("[data-gst-mode]").forEach((el) => el.addEventListener("change", update));
  utilityBody.querySelectorAll("[data-gst-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      amountEl.value = button.dataset.gstPreset;
      update();
    });
  });
  utilityBody.querySelector("[data-gst-copy]").addEventListener("click", () => {
    if (!last) return;
    utilCopy(
      `Base: ${money(last.base)}\nGST (${last.percent}%): ${money(last.gst)}\nCGST: ${money(last.gst / 2)}\nSGST: ${money(last.gst / 2)}\nTotal: ${money(last.total)}`,
      "Breakdown copied."
    );
  });

  update();
}

/* ------------------------------------------------------- EMI calculator */
const EMI_KEY = "flip-watch-emi";

function renderEmi() {
  const saved = readStored(EMI_KEY, null) || {};
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="emi-amount">Loan amount (₹)</label>
      <input id="emi-amount" type="number" inputmode="decimal" step="any" data-emi-amount />
    </div>
    <div class="util-actions">
      <button class="util-btn" data-emi-preset="500000">₹5L</button>
      <button class="util-btn" data-emi-preset="1000000">₹10L</button>
      <button class="util-btn" data-emi-preset="2500000">₹25L</button>
      <button class="util-btn" data-emi-preset="5000000">₹50L</button>
    </div>
    <div class="util-field">
      <label for="emi-rate">Annual interest rate (%)</label>
      <input id="emi-rate" type="number" inputmode="decimal" step="any" data-emi-rate />
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="emi-tenure">Tenure</label>
        <input id="emi-tenure" type="number" inputmode="numeric" step="1" data-emi-tenure />
      </div>
      <div class="util-field">
        <label for="emi-unit">Unit</label>
        <select id="emi-unit" data-emi-unit>
          <option value="years">Years</option>
          <option value="months">Months</option>
        </select>
      </div>
    </div>
    <div class="stat-grid" data-emi-stats></div>
    <div class="meter" aria-hidden="true"><span data-emi-meter></span></div>
    <p class="util-note" data-emi-note></p>
    <div class="util-actions">
      <button class="util-btn" type="button" data-emi-copy>Copy summary</button>
      <button class="util-btn" type="button" data-emi-toggle>Show yearly breakdown</button>
    </div>
    <div class="util-table-wrap" data-emi-table-wrap hidden>
      <table class="util-table">
        <caption>Yearly breakdown</caption>
        <thead><tr><th>Year</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
        <tbody data-emi-table></tbody>
      </table>
    </div>
  `;

  const amountEl = utilityBody.querySelector("[data-emi-amount]");
  const rateEl = utilityBody.querySelector("[data-emi-rate]");
  const tenureEl = utilityBody.querySelector("[data-emi-tenure]");
  const unitEl = utilityBody.querySelector("[data-emi-unit]");
  const statsEl = utilityBody.querySelector("[data-emi-stats]");
  const noteEl = utilityBody.querySelector("[data-emi-note]");
  const meterEl = utilityBody.querySelector("[data-emi-meter]");
  const tableWrap = utilityBody.querySelector("[data-emi-table-wrap]");
  const tableBody = utilityBody.querySelector("[data-emi-table]");
  const money = (value) => `₹${Math.round(value).toLocaleString("en-IN")}`;
  const stat = (value, label) => `<div class="stat"><span>${value}</span><small>${label}</small></div>`;
  let last = null;

  const update = () => {
    const principal = Number(amountEl.value);
    const annual = Number(rateEl.value);
    const tenure = Number(tenureEl.value);
    const months = unitEl.value === "years" ? Math.round(tenure * 12) : Math.round(tenure);

    if (!(principal > 0) || !(months > 0) || !(annual >= 0)) {
      statsEl.innerHTML = stat("—", "Enter loan details");
      noteEl.textContent = "";
      meterEl.style.width = "0%";
      tableBody.innerHTML = "";
      last = null;
      return;
    }

    const monthlyRate = annual / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, months);
    const emi = monthlyRate === 0 ? principal / months : (principal * monthlyRate * factor) / (factor - 1);
    const total = emi * months;
    const interest = total - principal;

    statsEl.innerHTML = [
      stat(money(emi), "Monthly EMI"),
      stat(money(interest), "Total interest"),
      stat(money(total), "Total payment"),
      stat(`${months}`, "Months"),
    ].join("");
    meterEl.style.width = `${Math.min(100, Math.round((interest / total) * 100))}%`;
    noteEl.textContent = `${Math.round((interest / total) * 100)}% of everything you pay is interest`;

    // yearly amortisation
    let balance = principal;
    let year = 1;
    let yearPrincipal = 0;
    let yearInterest = 0;
    const rows = [];
    for (let month = 1; month <= months; month += 1) {
      const interestPart = balance * monthlyRate;
      const principalPart = Math.min(balance, emi - interestPart);
      balance = Math.max(0, balance - principalPart);
      yearPrincipal += principalPart;
      yearInterest += interestPart;
      if (month % 12 === 0 || month === months) {
        rows.push(`<tr><td>${year}</td><td>${money(yearPrincipal)}</td><td>${money(yearInterest)}</td><td>${money(balance)}</td></tr>`);
        year += 1;
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }
    tableBody.innerHTML = rows.join("");

    last = { emi, interest, total, months, principal };
    writeStored(EMI_KEY, { amount: amountEl.value, rate: rateEl.value, tenure: tenureEl.value, unit: unitEl.value });
  };

  amountEl.value = saved.amount ?? "500000";
  rateEl.value = saved.rate ?? "9.5";
  tenureEl.value = saved.tenure ?? "5";
  unitEl.value = saved.unit || "years";

  [amountEl, rateEl, tenureEl, unitEl].forEach((el) => el.addEventListener("input", update));
  utilityBody.querySelectorAll("[data-emi-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      amountEl.value = button.dataset.emiPreset;
      update();
    });
  });
  utilityBody.querySelector("[data-emi-copy]").addEventListener("click", () => {
    if (!last) return;
    utilCopy(
      `Loan: ${money(last.principal)}\nEMI: ${money(last.emi)} x ${last.months} months\nTotal interest: ${money(last.interest)}\nTotal payment: ${money(last.total)}`,
      "Summary copied."
    );
  });
  utilityBody.querySelector("[data-emi-toggle]").addEventListener("click", (event) => {
    tableWrap.hidden = !tableWrap.hidden;
    event.currentTarget.textContent = tableWrap.hidden ? "Show yearly breakdown" : "Hide yearly breakdown";
  });

  update();
}

/* ------------------------------------------------------ fuel calculator */
const FUEL_KEY = "flip-watch-fuel";

function renderFuel() {
  const saved = readStored(FUEL_KEY, null) || {};
  utilityBody.innerHTML = `
    <div class="util-toggles">
      <label><input type="radio" name="fuel-trip" value="oneway" data-fuel-trip /> One way</label>
      <label><input type="radio" name="fuel-trip" value="round" data-fuel-trip /> Round trip</label>
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="fuel-distance">Distance (km)</label>
        <input id="fuel-distance" type="number" inputmode="decimal" step="any" data-fuel-distance />
      </div>
      <div class="util-field">
        <label for="fuel-mileage">Mileage</label>
        <input id="fuel-mileage" type="number" inputmode="decimal" step="any" data-fuel-mileage />
      </div>
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="fuel-unit">Mileage unit</label>
        <select id="fuel-unit" data-fuel-unit>
          <option value="kmpl">km per litre</option>
          <option value="l100">litres per 100 km</option>
        </select>
      </div>
      <div class="util-field">
        <label for="fuel-price">Fuel price (₹ per litre)</label>
        <input id="fuel-price" type="number" inputmode="decimal" step="any" data-fuel-price />
      </div>
    </div>
    <div class="util-field">
      <label for="fuel-people">Split between (people)</label>
      <input id="fuel-people" type="number" inputmode="numeric" step="1" min="1" data-fuel-people />
    </div>
    <div class="stat-grid" data-fuel-stats></div>
    <div class="util-actions">
      <button class="util-btn" type="button" data-fuel-copy>Copy summary</button>
    </div>
    <p class="util-note" data-fuel-note></p>
  `;

  const distanceEl = utilityBody.querySelector("[data-fuel-distance]");
  const mileageEl = utilityBody.querySelector("[data-fuel-mileage]");
  const unitEl = utilityBody.querySelector("[data-fuel-unit]");
  const priceEl = utilityBody.querySelector("[data-fuel-price]");
  const peopleEl = utilityBody.querySelector("[data-fuel-people]");
  const statsEl = utilityBody.querySelector("[data-fuel-stats]");
  const noteEl = utilityBody.querySelector("[data-fuel-note]");
  const money = (value) => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const stat = (value, label) => `<div class="stat"><span>${value}</span><small>${label}</small></div>`;
  let last = null;

  const update = () => {
    const oneWay = Number(distanceEl.value);
    const roundTrip = utilityBody.querySelector("[data-fuel-trip]:checked")?.value === "round";
    const distance = roundTrip ? oneWay * 2 : oneWay;
    const mileage = Number(mileageEl.value);
    const price = Number(priceEl.value);
    const people = Math.max(1, Math.round(Number(peopleEl.value) || 1));

    if (!(distance > 0) || !(mileage > 0) || !(price > 0)) {
      statsEl.innerHTML = stat("—", "Enter distance, mileage and price");
      noteEl.textContent = "";
      last = null;
      return;
    }

    const litres = unitEl.value === "l100" ? (distance / 100) * mileage : distance / mileage;
    const total = litres * price;
    statsEl.innerHTML = [
      stat(`${litres.toFixed(2)} L`, "Fuel needed"),
      stat(money(total), "Total cost"),
      stat(money(total / people), "Per person"),
      stat(money(total / distance), "Per km"),
    ].join("");
    noteEl.textContent = `${distance} km ${roundTrip ? "(round trip)" : "(one way)"} · ${people} ${people === 1 ? "person" : "people"}`;
    last = { litres, total, people, distance };
    writeStored(FUEL_KEY, { distance: distanceEl.value, mileage: mileageEl.value, unit: unitEl.value, price: priceEl.value, people: peopleEl.value, trip: roundTrip ? "round" : "oneway" });
  };

  distanceEl.value = saved.distance ?? "300";
  mileageEl.value = saved.mileage ?? "18";
  unitEl.value = saved.unit || "kmpl";
  priceEl.value = saved.price ?? "105";
  peopleEl.value = saved.people ?? "1";
  const savedTrip = utilityBody.querySelector(`[data-fuel-trip][value="${saved.trip === "round" ? "round" : "oneway"}"]`);
  if (savedTrip) savedTrip.checked = true;

  [distanceEl, mileageEl, priceEl, peopleEl, unitEl].forEach((el) => el.addEventListener("input", update));
  utilityBody.querySelectorAll("[data-fuel-trip]").forEach((el) => el.addEventListener("change", update));
  utilityBody.querySelector("[data-fuel-copy]").addEventListener("click", () => {
    if (!last) return;
    utilCopy(
      `${last.distance} km · ${last.litres.toFixed(2)} L · ${money(last.total)}\nPer person: ${money(last.total / last.people)}`,
      "Summary copied."
    );
  });

  update();
}

/* ------------------------------------------------------ JSON formatter */
const JSON_SAMPLE = '{"name":"Flip Watch","tools":18,"tags":["offline","pwa"],"nested":{"ok":true}}';

function renderJson() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="json-input">JSON</label>
      <textarea id="json-input" class="util-textarea util-textarea--code" data-json-input spellcheck="false" placeholder='{"hello":"world"}'></textarea>
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="json-indent">Indent</label>
        <select id="json-indent" data-json-indent>
          <option value="2" selected>2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="tab">Tab</option>
        </select>
      </div>
      <div class="util-field">
        <label for="json-sort">Sort keys</label>
        <select id="json-sort" data-json-sort>
          <option value="no" selected>Keep order</option>
          <option value="yes">Sort A–Z</option>
        </select>
      </div>
    </div>
    <div class="util-actions">
      <button class="util-btn" data-json-action="format">Format</button>
      <button class="util-btn" data-json-action="minify">Minify</button>
      <button class="util-btn" data-json-action="validate">Validate</button>
      <button class="util-btn" data-json-action="copy">Copy output</button>
      <button class="util-btn" data-json-action="download">Download</button>
      <button class="util-btn" data-json-action="sample">Sample</button>
      <button class="util-btn" data-json-action="clear">Clear</button>
    </div>
    <p class="util-note" data-json-status></p>
    <div class="util-field">
      <label for="json-output">Output</label>
      <textarea id="json-output" class="util-textarea util-textarea--code" data-json-output readonly spellcheck="false"></textarea>
    </div>
  `;

  const input = utilityBody.querySelector("[data-json-input]");
  const output = utilityBody.querySelector("[data-json-output]");
  const status = utilityBody.querySelector("[data-json-status]");
  const indentEl = utilityBody.querySelector("[data-json-indent]");
  const sortEl = utilityBody.querySelector("[data-json-sort]");

  const sortKeys = (value) => {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value && typeof value === "object") {
      return Object.keys(value).sort().reduce((acc, key) => {
        acc[key] = sortKeys(value[key]);
        return acc;
      }, {});
    }
    return value;
  };

  const locate = (text, error) => {
    const match = /position (\d+)/.exec(error.message);
    if (!match) return "";
    const position = Number(match[1]);
    const before = text.slice(0, position);
    return ` (line ${before.split("\n").length}, column ${position - before.lastIndexOf("\n")})`;
  };

  const run = (kind) => {
    const text = input.value.trim();
    if (!text) {
      output.value = "";
      status.textContent = "Paste some JSON first.";
      return;
    }
    try {
      let parsed = JSON.parse(text);
      if (sortEl.value === "yes") parsed = sortKeys(parsed);
      if (kind === "minify") output.value = JSON.stringify(parsed);
      else if (kind === "validate") output.value = "";
      else {
        const indent = indentEl.value === "tab" ? "\t" : Number(indentEl.value);
        output.value = JSON.stringify(parsed, null, indent);
      }
      const before = new Blob([text]).size;
      const after = new Blob([output.value]).size;
      const shape = Array.isArray(parsed) ? `array with ${parsed.length} items` : `object with ${Object.keys(parsed || {}).length} keys`;
      status.textContent = kind === "validate"
        ? `Valid JSON · ${shape}`
        : `Valid JSON · ${kind === "minify" ? "minified" : "formatted"} · ${before} B → ${after} B`;
    } catch (error) {
      output.value = "";
      status.textContent = `Invalid JSON${locate(text, error)} — ${error.message}`;
    }
  };

  utilityBody.querySelectorAll("[data-json-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.dataset.jsonAction;
      if (kind === "copy") utilCopy(output.value, "Output copied.");
      else if (kind === "sample") {
        input.value = JSON_SAMPLE;
        run("format");
      } else if (kind === "download") {
        if (!output.value) {
          status.textContent = "Format or minify first, then download.";
          return;
        }
        const blob = new Blob([output.value], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "data.json";
        link.click();
        URL.revokeObjectURL(link.href);
      } else if (kind === "clear") {
        input.value = "";
        output.value = "";
        status.textContent = "";
        input.focus();
      } else run(kind);
    });
  });
}

/* ------------------------------------------------- base64 / url / hash */
function renderBase64() {
  utilityBody.innerHTML = `
    <div class="date-row">
      <div class="util-field">
        <label for="b64-mode">Action</label>
        <select id="b64-mode" data-b64-mode>
          <option value="b64-encode">Base64 encode</option>
          <option value="b64-decode">Base64 decode</option>
          <option value="url-encode">URL encode</option>
          <option value="url-decode">URL decode</option>
          <option value="hash">Hash</option>
        </select>
      </div>
      <div class="util-field" data-b64-algo-wrap hidden>
        <label for="b64-algo">Algorithm</label>
        <select id="b64-algo" data-b64-algo>
          <option value="SHA-256" selected>SHA-256</option>
          <option value="SHA-384">SHA-384</option>
          <option value="SHA-512">SHA-512</option>
        </select>
      </div>
    </div>
    <div class="util-field">
      <label for="b64-input">Input</label>
      <textarea id="b64-input" class="util-textarea util-textarea--code" data-b64-input spellcheck="false" placeholder="Type or paste text…"></textarea>
    </div>
    <div class="util-actions">
      <button class="util-btn" data-b64-run>Convert</button>
      <button class="util-btn" data-b64-copy>Copy output</button>
      <button class="util-btn" data-b64-swap>Use output as input</button>
      <button class="util-btn" data-b64-clear>Clear</button>
    </div>
    <p class="util-note" data-b64-status></p>
    <div class="util-field">
      <label for="b64-output">Output</label>
      <textarea id="b64-output" class="util-textarea util-textarea--code" data-b64-output readonly spellcheck="false"></textarea>
    </div>
  `;

  const modeEl = utilityBody.querySelector("[data-b64-mode]");
  const algoWrap = utilityBody.querySelector("[data-b64-algo-wrap]");
  const algoEl = utilityBody.querySelector("[data-b64-algo]");
  const input = utilityBody.querySelector("[data-b64-input]");
  const output = utilityBody.querySelector("[data-b64-output]");
  const status = utilityBody.querySelector("[data-b64-status]");

  const toBase64 = (text) => {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  };

  const fromBase64 = (text) => {
    const binary = atob(text.replace(/\s+/g, ""));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  const run = async () => {
    algoWrap.hidden = modeEl.value !== "hash";
    const text = input.value;
    if (!text) {
      output.value = "";
      status.textContent = "Type something first.";
      return;
    }
    try {
      if (modeEl.value === "b64-encode") output.value = toBase64(text);
      else if (modeEl.value === "b64-decode") output.value = fromBase64(text);
      else if (modeEl.value === "url-encode") output.value = encodeURIComponent(text);
      else if (modeEl.value === "url-decode") output.value = decodeURIComponent(text);
      else {
        const digest = await crypto.subtle.digest(algoEl.value, new TextEncoder().encode(text));
        output.value = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
      status.textContent = `Done · ${output.value.length} characters`;
    } catch (error) {
      output.value = "";
      status.textContent = `Could not convert — ${error.message}`;
    }
  };

  let timer = 0;
  input.addEventListener("input", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(run, 350);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      run();
    }
  });
  modeEl.addEventListener("change", run);
  algoEl.addEventListener("change", run);
  utilityBody.querySelector("[data-b64-run]").addEventListener("click", run);
  utilityBody.querySelector("[data-b64-copy]").addEventListener("click", () => utilCopy(output.value, "Output copied."));
  utilityBody.querySelector("[data-b64-swap]").addEventListener("click", () => {
    if (!output.value) return;
    input.value = output.value;
    output.value = "";
    status.textContent = "Output moved to input.";
  });
  utilityBody.querySelector("[data-b64-clear]").addEventListener("click", () => {
    input.value = "";
    output.value = "";
    status.textContent = "";
    input.focus();
  });
}

/* ------------------------------------------------------- colour toolkit */
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const value = parseInt(full, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  let hue = 0;
  let saturation = 0;
  if (max !== min) {
    const delta = max - min;
    saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) * 60;
    else if (max === green) hue = ((blue - red) / delta + 2) * 60;
    else hue = ((red - green) / delta + 4) * 60;
  }
  return { h: Math.round(hue), s: Math.round(saturation * 100), l: Math.round(lightness * 100) };
}

function relativeLuminance({ r, g, b }) {
  const channels = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first, second) {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function mixColour(rgb, target, amount) {
  return {
    r: rgb.r + (target - rgb.r) * amount,
    g: rgb.g + (target - rgb.g) * amount,
    b: rgb.b + (target - rgb.b) * amount,
  };
}

function renderColor() {
  utilityBody.innerHTML = `
    <div class="date-row">
      <div class="util-field">
        <label for="colour-picker">Pick a colour</label>
        <input id="colour-picker" type="color" value="#6c5ce7" data-colour-picker />
      </div>
      <div class="util-field">
        <label for="colour-hex">HEX</label>
        <input id="colour-hex" type="text" maxlength="7" value="#6c5ce7" data-colour-hex spellcheck="false" />
      </div>
    </div>
    <div class="util-actions">
      <button class="util-btn" type="button" data-colour-random>Random colour</button>
      <button class="util-btn" type="button" data-colour-copy-palette>Copy palette</button>
    </div>
    <div class="swatch-row" data-colour-swatches aria-label="Tints and shades"></div>
    <div class="stat-grid" data-colour-values></div>
    <div class="date-row">
      <div class="util-field">
        <label for="colour-text">Text colour</label>
        <input id="colour-text" type="color" value="#ffffff" data-colour-text />
      </div>
      <div class="util-field">
        <label for="colour-bg">Preview</label>
        <div class="colour-preview" data-colour-preview>Sample text</div>
      </div>
    </div>
    <p class="util-note" data-colour-contrast></p>
  `;

  const picker = utilityBody.querySelector("[data-colour-picker]");
  const hexEl = utilityBody.querySelector("[data-colour-hex]");
  const swatches = utilityBody.querySelector("[data-colour-swatches]");
  const valuesEl = utilityBody.querySelector("[data-colour-values]");
  const textEl = utilityBody.querySelector("[data-colour-text]");
  const previewEl = utilityBody.querySelector("[data-colour-preview]");
  const contrastEl = utilityBody.querySelector("[data-colour-contrast]");
  let palette = [];

  const update = (hex) => {
    let value = hex.trim();
    if (!value.startsWith("#")) value = `#${value}`;
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
      contrastEl.textContent = "Enter a hex colour like #6c5ce7.";
      return;
    }
    const rgb = hexToRgb(value);
    const hsl = rgbToHsl(rgb);
    const normalised = rgbToHex(rgb);

    picker.value = normalised;
    hexEl.value = normalised;

    const steps = [0.8, 0.6, 0.4, 0.2];
    palette = [
      ...steps.map((amount) => rgbToHex(mixColour(rgb, 0, amount))),
      normalised,
      ...steps.slice().reverse().map((amount) => rgbToHex(mixColour(rgb, 255, amount))),
    ];

    swatches.innerHTML = palette
      .map((swatch, index) => `<button type="button" class="swatch${index === 4 ? " is-current" : ""}" style="background:${swatch}" data-swatch="${swatch}" aria-label="Use ${swatch}"></button>`)
      .join("");

    swatches.querySelectorAll("[data-swatch]").forEach((button) => {
      button.addEventListener("click", () => update(button.dataset.swatch));
    });

    const complementary = rgbToHex({ r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b });
    const stat = (value2, label, copyValue) => `<button type="button" class="stat stat--copy" data-copy-value="${copyValue}" aria-label="Copy ${label}"><span>${value2}</span><small>${label}</small></button>`;
    valuesEl.innerHTML = [
      stat(normalised.toUpperCase(), "HEX", normalised),
      stat(`${rgb.r}, ${rgb.g}, ${rgb.b}`, "RGB", `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`),
      stat(`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`, "HSL", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`),
      stat(complementary.toUpperCase(), "Complement", complementary),
    ].join("");

    valuesEl.querySelectorAll("[data-copy-value]").forEach((button) => {
      button.addEventListener("click", () => utilCopy(button.dataset.copyValue, "Value copied."));
    });

    previewEl.style.background = normalised;
    previewEl.style.color = textEl.value;

    const ratio = contrastRatio(rgb, hexToRgb(textEl.value));
    const aa = ratio >= 4.5;
    const aaa = ratio >= 7;
    contrastEl.textContent = `Contrast ${ratio.toFixed(2)}:1 — ${aaa ? "AAA" : aa ? "AA" : "fails AA"}`;
  };

  picker.addEventListener("input", () => update(picker.value));
  hexEl.addEventListener("input", () => update(hexEl.value));
  textEl.addEventListener("input", () => update(hexEl.value));
  utilityBody.querySelector("[data-colour-random]").addEventListener("click", () => {
    update(rgbToHex({ r: utilRandomInt(256), g: utilRandomInt(256), b: utilRandomInt(256) }));
  });
  utilityBody.querySelector("[data-colour-copy-palette]").addEventListener("click", () => {
    utilCopy(palette.join("\n"), "Palette copied.");
  });

  update(hexEl.value);
}

/* ------------------------------------------------------- random picker */
function renderRandom() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="random-mode">Pick a</label>
      <select id="random-mode" data-random-mode>
        <option value="number">Random number</option>
        <option value="dice">Dice roll</option>
        <option value="coin">Coin flip</option>
        <option value="name">Name from a list</option>
      </select>
    </div>
    <div class="date-row" data-random-range>
      <div class="util-field">
        <label for="random-min">Minimum</label>
        <input id="random-min" type="number" inputmode="numeric" step="1" value="1" data-random-min />
      </div>
      <div class="util-field">
        <label for="random-max">Maximum</label>
        <input id="random-max" type="number" inputmode="numeric" step="1" value="100" data-random-max />
      </div>
    </div>
    <div class="date-row" data-random-count-wrap>
      <div class="util-field">
        <label for="random-count">How many (unique)</label>
        <input id="random-count" type="number" inputmode="numeric" step="1" min="1" max="20" value="1" data-random-count />
      </div>
      <div class="util-field" data-random-dice-wrap hidden>
        <label for="random-dice">Dice</label>
        <select id="random-dice" data-random-dice>
          <option value="1">1 die</option>
          <option value="2">2 dice</option>
          <option value="3">3 dice</option>
        </select>
      </div>
    </div>
    <div class="util-field" data-random-names hidden>
      <label for="random-names">Names, one per line</label>
      <textarea id="random-names" class="util-textarea" data-random-names-input placeholder="Asha&#10;Ravi&#10;Meera"></textarea>
    </div>
    <div class="util-toggles" data-random-options>
      <label><input type="checkbox" data-random-no-repeat /> Remove picked names from the list</label>
    </div>
    <div class="random-result" data-random-result>—</div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-random-pick>Pick</button>
      <button class="util-btn" type="button" data-random-copy>Copy result</button>
      <button class="util-btn" type="button" data-random-shuffle>Shuffle list</button>
    </div>
    <p class="util-note" data-random-note></p>
    <p class="util-note" data-random-history></p>
  `;

  const modeEl = utilityBody.querySelector("[data-random-mode]");
  const rangeWrap = utilityBody.querySelector("[data-random-range]");
  const countWrap = utilityBody.querySelector("[data-random-count-wrap]");
  const diceWrap = utilityBody.querySelector("[data-random-dice-wrap]");
  const diceEl = utilityBody.querySelector("[data-random-dice]");
  const minEl = utilityBody.querySelector("[data-random-min]");
  const maxEl = utilityBody.querySelector("[data-random-max]");
  const countEl = utilityBody.querySelector("[data-random-count]");
  const namesWrap = utilityBody.querySelector("[data-random-names]");
  const namesEl = utilityBody.querySelector("[data-random-names-input]");
  const optionsWrap = utilityBody.querySelector("[data-random-options]");
  const noRepeatEl = utilityBody.querySelector("[data-random-no-repeat]");
  const resultEl = utilityBody.querySelector("[data-random-result]");
  const noteEl = utilityBody.querySelector("[data-random-note]");
  const historyEl = utilityBody.querySelector("[data-random-history]");
  const history = [];

  const sync = () => {
    const mode = modeEl.value;
    rangeWrap.hidden = mode === "coin" || mode === "name";
    countWrap.hidden = mode !== "number";
    diceWrap.hidden = mode !== "dice";
    namesWrap.hidden = mode !== "name";
    optionsWrap.hidden = mode !== "name";
    resultEl.textContent = "—";
    noteEl.textContent = "";
  };

  const record = (value) => {
    history.unshift(value);
    history.splice(5);
    historyEl.textContent = history.length ? `Recent: ${history.join(" · ")}` : "";
  };

  const pick = () => {
    const mode = modeEl.value;
    if (mode === "number") {
      const min = Math.ceil(Number(minEl.value) || 0);
      const max = Math.floor(Number(maxEl.value) || 0);
      const count = Math.max(1, Math.min(20, Math.round(Number(countEl.value) || 1)));
      if (max < min) {
        noteEl.textContent = "Maximum must be greater than minimum.";
        return;
      }
      const span = max - min + 1;
      if (count > span) {
        noteEl.textContent = `Only ${span} numbers available in that range.`;
        return;
      }
      const picks = new Set();
      while (picks.size < count) picks.add(min + utilRandomInt(span));
      const value = [...picks].join(", ");
      resultEl.textContent = value;
      noteEl.textContent = count === 1 ? `Between ${min} and ${max}` : `${count} unique numbers between ${min} and ${max}`;
      record(value);
      return;
    }
    if (mode === "dice") {
      const count = Number(diceEl.value);
      const rolls = Array.from({ length: count }, () => 1 + utilRandomInt(6));
      resultEl.textContent = rolls.join(" · ");
      noteEl.textContent = `${count} ${count === 1 ? "die" : "dice"} · total ${rolls.reduce((a, b) => a + b, 0)}`;
      record(rolls.join(" · "));
      return;
    }
    if (mode === "coin") {
      const value = utilRandomInt(2) === 0 ? "Heads" : "Tails";
      resultEl.textContent = value;
      noteEl.textContent = "Fair coin flip";
      record(value);
      return;
    }
    let names = namesEl.value.split("\n").map((name) => name.trim()).filter(Boolean);
    if (!names.length) {
      noteEl.textContent = "Add at least one name.";
      return;
    }
    const value = names[utilRandomInt(names.length)];
    resultEl.textContent = value;
    noteEl.textContent = `${names.length} names in the list`;
    record(value);
    if (noRepeatEl.checked) {
      names = names.filter((name) => name !== value);
      namesEl.value = names.join("\n");
      if (!names.length) noteEl.textContent = "All names have been picked.";
    }
  };

  const shuffle = () => {
    const names = namesEl.value.split("\n").map((name) => name.trim()).filter(Boolean);
    if (names.length < 2) {
      noteEl.textContent = "Add at least two names to shuffle.";
      return;
    }
    for (let i = names.length - 1; i > 0; i -= 1) {
      const j = utilRandomInt(i + 1);
      [names[i], names[j]] = [names[j], names[i]];
    }
    namesEl.value = names.join("\n");
    resultEl.textContent = names[0];
    noteEl.textContent = "List shuffled — first name shown.";
    record(names[0]);
  };

  modeEl.addEventListener("change", sync);
  utilityBody.querySelector("[data-random-pick]").addEventListener("click", pick);
  utilityBody.querySelector("[data-random-copy]").addEventListener("click", () => utilCopy(resultEl.textContent, "Result copied."));
  utilityBody.querySelector("[data-random-shuffle]").addEventListener("click", shuffle);
  sync();
}

if (utilityPanel) {
  const backButton = utilityPanel.querySelector("[data-utility-back]");
  if (backButton) backButton.addEventListener("click", showDashboard);
}

/* =====================================================================
   App-level polish: version, install prompt, offline state, about dialog.
   ===================================================================== */
const APP_VERSION = "2.0.0";

document.querySelectorAll("[data-app-version]").forEach((element) => {
  element.textContent = APP_VERSION;
});

window.addEventListener("error", (event) => {
  console.error("[FlipWatch] Runtime error:", event.error || event.message);
});
window.addEventListener("unhandledrejection", (event) => {
  console.error("[FlipWatch] Unhandled rejection:", event.reason);
});

/* offline banner */
const offlineBanner = document.querySelector("[data-offline-banner]");
function updateOnlineState() {
  if (offlineBanner) offlineBanner.hidden = navigator.onLine;
}
window.addEventListener("online", updateOnlineState);
window.addEventListener("offline", updateOnlineState);
updateOnlineState();

/* install prompt */
const installButton = document.querySelector("[data-install-app]");
let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (installButton) installButton.hidden = false;
});

if (installButton) {
  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    try {
      const choice = await deferredInstallPrompt.userChoice;
      if (choice && choice.outcome === "accepted") installButton.hidden = true;
    } catch (error) {
      // The prompt can only be used once; ignore repeat attempts.
    }
    deferredInstallPrompt = null;
  });
}

window.addEventListener("appinstalled", () => {
  if (installButton) installButton.hidden = true;
  showAppToast("Flip Watch installed.");
});

/* about + shortcuts dialog */
const aboutDialog = document.querySelector("[data-about-dialog]");
const aboutOpenButton = document.querySelector("[data-about-open]");

function openAboutDialog() {
  if (aboutDialog && !aboutDialog.open) aboutDialog.showModal();
}

if (aboutOpenButton) aboutOpenButton.addEventListener("click", openAboutDialog);

if (aboutDialog) {
  aboutDialog.addEventListener("click", (event) => {
    if (event.target === aboutDialog) aboutDialog.close();
  });
}

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (target && target.closest && target.closest("input, textarea, select, [contenteditable='true']")) return;
  if (event.key === "?") {
    event.preventDefault();
    openAboutDialog();
  }
});
