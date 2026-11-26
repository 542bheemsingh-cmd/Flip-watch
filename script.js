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
  // Golden-angle spread so neighbouring cards never share a hue.
  card.style.setProperty("--tool-hue", String(Math.round((index * 137.508) % 360)));
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
  recordRecentTool(mode);
  if (mode && mode !== "pdf") {
    try {
      history.replaceState(null, "", `#${mode}`);
    } catch (error) {
      // Deep links are a nicety; never block opening the tool.
    }
  }
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
  if (typeof window.__flipTypingCleanup === "function") {
    window.__flipTypingCleanup();
  }
  dashboard.hidden = false;
  try {
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  } catch (error) {
    // Ignore.
  }
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
const UTILITY_TOOLS = ["converter", "password", "wordcount", "todo", "dates", "gst", "emi", "fuel", "json", "base64", "color", "random", "findreplace", "textpad", "pwstrength", "imgcompress", "imgresize", "imgconvert", "imgcrop", "imgcolour", "qrcode", "stats", "prime", "calendar", "pdf2img", "img2pdf", "protectpdf", "html2pdf", "watermark", "typing"];
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
  findreplace: { kicker: "Text", title: "Find & Replace Text", sub: "Replace text or a pattern, with case and regex options." },
  textpad: { kicker: "Text", title: "Repeat & Pad Text", sub: "Repeat text N times, or pad it to a fixed length." },
  pwstrength: { kicker: "Security", title: "Password Strength Checker", sub: "Entropy, rating and an offline crack-time estimate." },
  imgcompress: { kicker: "Images", title: "Compress Image", sub: "Shrink a photo's file size with a quality slider." },
  imgresize: { kicker: "Images", title: "Resize Image", sub: "Change pixel dimensions, with aspect ratio locked." },
  imgconvert: { kicker: "Images", title: "Convert Image Format", sub: "Save a picture as PNG, JPEG or WebP." },
  imgcrop: { kicker: "Images", title: "Crop Image", sub: "Drag a box on the picture and download just that part." },
  imgcolour: { kicker: "Images", title: "Pick Colour from Image", sub: "Click any pixel to read its HEX, RGB and HSL." },
  qrcode: { kicker: "Share", title: "Generate QR Code", sub: "Turn a link or text into a downloadable QR image." },
  stats: { kicker: "Numbers", title: "Statistics Calculator", sub: "Mean, median, mode, spread and quartiles." },
  prime: { kicker: "Numbers", title: "Prime Checker & Factoriser", sub: "Is it prime? See its prime factorisation." },
  calendar: { kicker: "Dates", title: "Generate Calendar", sub: "A month grid you can read or print." },
  pdf2img: { kicker: "Files", title: "PDF to Images", sub: "Turn PDF pages into PNG or JPEG files, zipped if you like." },
  img2pdf: { kicker: "Files", title: "Images to PDF", sub: "Combine photos into one PDF, in the order you choose." },
  protectpdf: { kicker: "Files", title: "Protect & Unlock PDF", sub: "Encrypt a PDF with a password, or unlock one you own." },
  html2pdf: { kicker: "Files", title: "HTML to PDF", sub: "Turn pasted HTML into a print-ready PDF." },
  watermark: { kicker: "Files", title: "PDF Watermark", sub: "Stamp a watermark on a PDF, or erase one you own." },
  typing: { kicker: "Practice", title: "Typing Test", sub: "Live WPM, accuracy, consistency and a speed graph." },
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
  else if (kind === "findreplace") renderFindReplace();
  else if (kind === "textpad") renderTextPad();
  else if (kind === "pwstrength") renderPasswordStrength();
  else if (kind === "imgcompress") renderImageCompress();
  else if (kind === "imgresize") renderImageResize();
  else if (kind === "imgconvert") renderImageConvert();
  else if (kind === "imgcrop") renderImageCrop();
  else if (kind === "imgcolour") renderImageColour();
  else if (kind === "qrcode") renderQrCode();
  else if (kind === "stats") renderStatistics();
  else if (kind === "prime") renderPrime();
  else if (kind === "calendar") renderCalendar();
  else if (kind === "pdf2img") renderPdfToImages();
  else if (kind === "img2pdf") renderImagesToPdf();
  else if (kind === "protectpdf") renderProtectPdf();
  else if (kind === "html2pdf") renderHtmlToPdf();
  else if (kind === "watermark") renderPdfWatermark();
  else if (kind === "typing") renderTypingTest();
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

/* --------------------------------------------------- find & replace text */
function renderFindReplace() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="fr-text">Text</label>
      <textarea id="fr-text" class="util-textarea" data-fr-text placeholder="Paste the text you want to edit…"></textarea>
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="fr-find">Find</label>
        <input id="fr-find" type="text" data-fr-find placeholder="text or pattern" />
      </div>
      <div class="util-field">
        <label for="fr-replace">Replace with</label>
        <input id="fr-replace" type="text" data-fr-replace placeholder="replacement" />
      </div>
    </div>
    <div class="util-toggles">
      <label><input type="checkbox" data-fr-regex /> Regular expression</label>
      <label><input type="checkbox" data-fr-case /> Match case</label>
    </div>
    <div class="util-actions" data-fr-presets>
      <button class="util-btn" data-fr-preset="email">Email</button>
      <button class="util-btn" data-fr-preset="url">URL</button>
      <button class="util-btn" data-fr-preset="phone">Phone</button>
      <button class="util-btn" data-fr-preset="spaces">Extra spaces</button>
      <button class="util-btn" data-fr-preset="blanklines">Blank lines</button>
    </div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-fr-run>Replace all</button>
      <button class="util-btn" type="button" data-fr-one>Replace one</button>
      <button class="util-btn" type="button" data-fr-undo disabled>Undo</button>
      <button class="util-btn" type="button" data-fr-copy>Copy result</button>
      <button class="util-btn" type="button" data-fr-clear>Clear</button>
    </div>
    <p class="util-note" data-fr-status>Type text and something to find.</p>
  `;

  const textEl = utilityBody.querySelector("[data-fr-text]");
  const findEl = utilityBody.querySelector("[data-fr-find]");
  const replaceEl = utilityBody.querySelector("[data-fr-replace]");
  const regexEl = utilityBody.querySelector("[data-fr-regex]");
  const caseEl = utilityBody.querySelector("[data-fr-case]");
  const statusEl = utilityBody.querySelector("[data-fr-status]");
  const undoBtn = utilityBody.querySelector("[data-fr-undo]");
  let previous = null;

  const PRESETS = {
    email: { pattern: "[\\w.+-]+@[\\w-]+\\.[\\w.]+", flags: "g" },
    url: { pattern: "https?://[^\\s]+", flags: "g" },
    phone: { pattern: "\\+?\\d[\\d\\s-]{7,}\\d", flags: "g" },
    spaces: { pattern: "[ \\t]{2,}", flags: "g" },
    blanklines: { pattern: "\\n{2,}", flags: "g" },
  };

  const buildPattern = (global = true) => {
    const source = regexEl.checked ? findEl.value : findEl.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!source) return null;
    const flags = `${global ? "g" : ""}${caseEl.checked ? "" : "i"}`;
    try {
      return new RegExp(source, flags);
    } catch (error) {
      statusEl.textContent = `Invalid pattern — ${error.message}`;
      return null;
    }
  };

  const countMatches = () => {
    const pattern = buildPattern();
    if (!pattern || !findEl.value) {
      statusEl.textContent = "Type text and something to find.";
      return 0;
    }
    const matches = textEl.value.match(pattern)?.length || 0;
    statusEl.textContent = matches ? `${matches} ${matches === 1 ? "match" : "matches"} found.` : "No matches found.";
    return matches;
  };

  const apply = (all) => {
    const pattern = buildPattern(all);
    if (!pattern) return;
    const before = textEl.value;
    const matches = before.match(pattern)?.length || 0;
    if (!matches) {
      statusEl.textContent = "No matches found.";
      return;
    }
    previous = before;
    undoBtn.disabled = false;
    textEl.value = before.replace(pattern, replaceEl.value);
    const replaced = all ? matches : 1;
    statusEl.textContent = `${replaced} ${replaced === 1 ? "match" : "matches"} replaced.`;
  };

  [textEl, findEl, replaceEl].forEach((el) => el.addEventListener("input", countMatches));
  [regexEl, caseEl].forEach((el) => el.addEventListener("change", countMatches));

  utilityBody.querySelectorAll("[data-fr-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const preset = PRESETS[button.dataset.frPreset];
      regexEl.checked = true;
      findEl.value = preset.pattern;
      replaceEl.value = "";
      countMatches();
    });
  });

  utilityBody.querySelector("[data-fr-run]").addEventListener("click", () => apply(true));
  utilityBody.querySelector("[data-fr-one]").addEventListener("click", () => apply(false));
  undoBtn.addEventListener("click", () => {
    if (previous === null) return;
    textEl.value = previous;
    previous = null;
    undoBtn.disabled = true;
    statusEl.textContent = "Reverted to the previous text.";
  });
  utilityBody.querySelector("[data-fr-copy]").addEventListener("click", () => utilCopy(textEl.value, "Text copied."));
  utilityBody.querySelector("[data-fr-clear]").addEventListener("click", () => {
    textEl.value = "";
    findEl.value = "";
    statusEl.textContent = "Cleared.";
    textEl.focus();
  });
}

/* ------------------------------------------------------- repeat & pad text */
function renderTextPad() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="pad-mode">What should it do?</label>
      <select id="pad-mode" data-pad-mode>
        <option value="repeat">Repeat the text N times</option>
        <option value="pad">Pad the text to a fixed length</option>
      </select>
    </div>
    <div class="util-field">
      <label for="pad-text">Text</label>
      <textarea id="pad-text" class="util-textarea" data-pad-text placeholder="Type or paste text…"></textarea>
    </div>
    <div class="date-row" data-pad-repeat-row>
      <div class="util-field">
        <label for="pad-count">Times</label>
        <input id="pad-count" type="number" inputmode="numeric" min="1" max="500" value="3" data-pad-count />
      </div>
      <div class="util-field">
        <label for="pad-separator">Separator</label>
        <select id="pad-separator" data-pad-separator>
          <option value="\n" selected>New line</option>
          <option value=", ">Comma + space</option>
          <option value=" ">Space</option>
          <option value="">Nothing</option>
        </select>
      </div>
    </div>
    <div class="util-toggles" data-pad-repeat-options>
      <label><input type="checkbox" data-pad-numbered /> Number each line</label>
      <label><input type="checkbox" data-pad-trim /> Trim each copy</label>
    </div>
    <div class="date-row" data-pad-pad-row hidden>
      <div class="util-field">
        <label for="pad-length">Target length</label>
        <input id="pad-length" type="number" inputmode="numeric" min="1" max="10000" value="20" data-pad-length />
      </div>
      <div class="util-field">
        <label for="pad-char">Pad with</label>
        <input id="pad-char" type="text" maxlength="1" value="0" data-pad-char />
      </div>
    </div>
    <div class="util-field" data-pad-side-wrap hidden>
      <label for="pad-side">Pad on</label>
      <select id="pad-side" data-pad-side>
        <option value="start">Left (start)</option>
        <option value="end">Right (end)</option>
      </select>
    </div>
    <div class="util-field">
      <label for="pad-wrap">Wrap each copy</label>
      <select id="pad-wrap" data-pad-wrap>
        <option value="none">Nothing</option>
        <option value="quotes">"double quotes"</option>
        <option value="single">'single quotes'</option>
        <option value="brackets">[square brackets]</option>
        <option value="braces">{curly braces}</option>
      </select>
    </div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-pad-run>Build text</button>
      <button class="util-btn" type="button" data-pad-copy>Copy result</button>
      <button class="util-btn" type="button" data-pad-clear>Clear</button>
    </div>
    <p class="util-note" data-pad-status></p>
    <div class="util-field">
      <label for="pad-output">Result</label>
      <textarea id="pad-output" class="util-textarea util-textarea--code" data-pad-output readonly></textarea>
    </div>
  `;

  const modeEl = utilityBody.querySelector("[data-pad-mode]");
  const textEl = utilityBody.querySelector("[data-pad-text]");
  const countEl = utilityBody.querySelector("[data-pad-count]");
  const sepEl = utilityBody.querySelector("[data-pad-separator]");
  const numberedEl = utilityBody.querySelector("[data-pad-numbered]");
  const trimEl = utilityBody.querySelector("[data-pad-trim]");
  const lengthEl = utilityBody.querySelector("[data-pad-length]");
  const charEl = utilityBody.querySelector("[data-pad-char]");
  const sideEl = utilityBody.querySelector("[data-pad-side]");
  const wrapEl = utilityBody.querySelector("[data-pad-wrap]");
  const output = utilityBody.querySelector("[data-pad-output]");
  const status = utilityBody.querySelector("[data-pad-status]");

  const WRAPS = { none: ["", ""], quotes: ['"', '"'], single: ["'", "'"], brackets: ["[", "]"], braces: ["{", "}"] };

  const sync = () => {
    const pad = modeEl.value === "pad";
    utilityBody.querySelector("[data-pad-repeat-row]").hidden = pad;
    utilityBody.querySelector("[data-pad-repeat-options]").hidden = pad;
    utilityBody.querySelector("[data-pad-pad-row]").hidden = !pad;
    utilityBody.querySelector("[data-pad-side-wrap]").hidden = !pad;
  };

  const run = () => {
    const raw = textEl.value;
    if (!raw) {
      output.value = "";
      status.textContent = "Type some text first.";
      return;
    }
    const [open, close] = WRAPS[wrapEl.value] || WRAPS.none;
    const wrap = (value) => `${open}${value}${close}`;

    if (modeEl.value === "repeat") {
      const count = Math.max(1, Math.min(500, Math.round(Number(countEl.value) || 1)));
      const separator = sepEl.value;
      const copies = Array.from({ length: count }, (_, index) => {
        const body = trimEl.checked ? raw.trim() : raw;
        return wrap(numberedEl.checked ? `${index + 1}. ${body}` : body);
      });
      output.value = copies.join(separator);
      status.textContent = `Repeated ${count} times · ${output.value.length} characters · ${output.value.split("\n").length} lines`;
      return;
    }

    const target = Math.max(1, Math.min(10000, Math.round(Number(lengthEl.value) || 1)));
    const padChar = (charEl.value || " ").slice(0, 1);
    const body = wrap(raw);
    if (body.length >= target) {
      output.value = body;
      status.textContent = `Text is already ${body.length} characters — nothing to pad.`;
      return;
    }
    const fill = padChar.repeat(target - body.length);
    output.value = sideEl.value === "start" ? fill + body : body + fill;
    status.textContent = `Padded to ${target} characters with "${padChar}".`;
  };

  modeEl.addEventListener("change", sync);
  utilityBody.querySelector("[data-pad-run]").addEventListener("click", run);
  utilityBody.querySelector("[data-pad-copy]").addEventListener("click", () => utilCopy(output.value, "Result copied."));
  utilityBody.querySelector("[data-pad-clear]").addEventListener("click", () => {
    textEl.value = "";
    output.value = "";
    status.textContent = "";
    textEl.focus();
  });
  sync();
}

/* --------------------------------------------------- password strength */
function renderPasswordStrength() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="pws-input">Password to check</label>
      <div class="pw-output">
        <input id="pws-input" type="password" data-pws-input autocomplete="off" spellcheck="false" placeholder="Type a password…" />
        <button type="button" data-pws-reveal aria-pressed="false">Show</button>
      </div>
    </div>
    <div class="util-actions">
      <button class="util-btn" type="button" data-pws-generate>Suggest a strong one</button>
      <button class="util-btn" type="button" data-pws-copy>Copy password</button>
    </div>
    <div class="meter" aria-hidden="true"><span data-pws-meter></span></div>
    <div class="stat-grid" data-pws-stats></div>
    <div class="chip-row" data-pws-classes></div>
    <p class="util-note" data-pws-verdict></p>
    <p class="util-note" data-pws-tips></p>
  `;

  const input = utilityBody.querySelector("[data-pws-input]");
  const revealBtn = utilityBody.querySelector("[data-pws-reveal]");
  const meter = utilityBody.querySelector("[data-pws-meter]");
  const statsEl = utilityBody.querySelector("[data-pws-stats]");
  const classesEl = utilityBody.querySelector("[data-pws-classes]");
  const verdictEl = utilityBody.querySelector("[data-pws-verdict]");
  const tipsEl = utilityBody.querySelector("[data-pws-tips]");

  const common = ["password", "123456", "qwerty", "admin", "letmein", "welcome", "iloveyou", "monkey", "dragon", "abc123", "111111", "12345678", "india123", "iloveu"];

  const humanTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "practically forever";
    if (seconds < 1) return "instantly";
    if (seconds < 60) return `${Math.round(seconds)} sec`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    const years = seconds / 31536000;
    if (years < 1000) return `${Math.round(years)} years`;
    if (years < 1e6) return `${Math.round(years / 1000)}k years`;
    if (years < 1e9) return `${Math.round(years / 1e6)}M years`;
    return "practically forever";
  };

  const update = () => {
    const password = input.value;
    const stat = (value, label) => `<div class="stat"><span>${value}</span><small>${label}</small></div>`;

    if (!password) {
      statsEl.innerHTML = "";
      classesEl.innerHTML = "";
      meter.style.width = "0%";
      verdictEl.textContent = "";
      tipsEl.textContent = "";
      return;
    }

    const has = {
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      digit: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };
    let pool = (has.lower ? 26 : 0) + (has.upper ? 26 : 0) + (has.digit ? 10 : 0) + (has.symbol ? 33 : 0);
    const bits = Math.round(password.length * Math.log2(Math.max(2, pool)));
    const guesses = Math.pow(2, bits);

    const lower = password.toLowerCase();
    const isCommon = common.some((word) => lower.includes(word));
    const repeated = /(.)\1{2,}/.test(password);
    const sequential = /(abc|bcd|cde|123|234|345|456|567|678|789|qwe|asd|zxc)/i.test(password);
    const yearLike = /(19|20)\d{2}/.test(password);

    let penalty = 0;
    if (isCommon) penalty += 35;
    if (repeated) penalty += 10;
    if (sequential) penalty += 10;
    if (yearLike) penalty += 5;
    if (password.length < 8) penalty += 20;
    const score = Math.max(0, Math.min(100, bits - penalty));
    const label = score >= 85 ? "Excellent" : score >= 65 ? "Strong" : score >= 45 ? "Fair" : score >= 25 ? "Weak" : "Very weak";

    statsEl.innerHTML = [
      stat(String(password.length), "Characters"),
      stat(String(bits), "Entropy bits"),
      stat(label, "Rating"),
      stat(humanTime(guesses / 1e3), "Online attack"),
      stat(humanTime(guesses / 1e10), "Offline attack"),
      stat(humanTime(guesses / 1e13), "GPU farm"),
    ].join("");
    meter.style.width = `${score}%`;

    const chip = (on, text) => `<span class="chip${on ? " is-on" : ""}">${text}</span>`;
    classesEl.innerHTML = [
      chip(has.lower, "a–z"),
      chip(has.upper, "A–Z"),
      chip(has.digit, "0–9"),
      chip(has.symbol, "symbols"),
      chip(password.length >= 12, "12+ chars"),
    ].join("");

    const tips = [];
    if (password.length < 12) tips.push("use 12+ characters");
    if (!has.upper) tips.push("add an uppercase letter");
    if (!has.digit) tips.push("add a number");
    if (!has.symbol) tips.push("add a symbol");
    if (isCommon) tips.push("avoid common words");
    if (repeated) tips.push("avoid repeats like “aaa”");
    if (sequential) tips.push("avoid sequences like “123”");

    verdictEl.textContent = `Rating: ${label} (${score}/100) — ${bits} bits of entropy.`;
    tipsEl.textContent = tips.length ? `To improve: ${tips.join(", ")}.` : "This password looks good — store it in a password manager.";
  };

  revealBtn.addEventListener("click", () => {
    const shown = input.type === "text";
    input.type = shown ? "password" : "text";
    revealBtn.textContent = shown ? "Show" : "Hide";
    revealBtn.setAttribute("aria-pressed", String(!shown));
  });
  utilityBody.querySelector("[data-pws-generate]").addEventListener("click", () => {
    input.value = generatePassword({ length: 20, upper: true, lower: true, digits: true, symbols: true, excludeAmbiguous: false, exclude: "" });
    input.type = "text";
    revealBtn.textContent = "Hide";
    revealBtn.setAttribute("aria-pressed", "true");
    update();
  });
  utilityBody.querySelector("[data-pws-copy]").addEventListener("click", () => utilCopy(input.value, "Password copied."));
  input.addEventListener("input", update);
  update();
}

/* ------------------------------------------------------- image helpers */
function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Choose an image first."));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as an image."));
    };
    image.src = url;
  });
}

function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }, "image/png");
}

function bytesLabel(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function imageStageHTML(extra = "") {
  return `
    <div class="util-field">
      <label for="img-file">Image file</label>
      <input id="img-file" class="util-file" type="file" accept="image/*" data-img-file />
    </div>
    <div class="img-stage" data-img-stage hidden>
      <canvas class="img-canvas" data-img-canvas></canvas>
    </div>
    ${extra}
    <p class="util-note" data-img-note></p>
  `;
}

/* ------------------------------------------------------ compress image */
function renderImageCompress() {
  utilityBody.innerHTML = imageStageHTML(`
    <div class="util-field">
      <label for="ic-quality">Quality: <output data-ic-quality-out>70</output>%</label>
      <input id="ic-quality" type="range" min="20" max="95" value="70" data-ic-quality />
    </div>
    <div class="util-field">
      <label for="ic-format">Output format</label>
      <select id="ic-format" data-ic-format>
        <option value="image/webp" selected>WebP (usually smallest)</option>
        <option value="image/jpeg">JPEG (widest support)</option>
      </select>
    </div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-ic-run>Compress</button>
      <button class="util-btn" type="button" data-ic-download disabled>Download</button>
    </div>
    <div class="stat-grid" data-ic-stats></div>
  `);

  const fileEl = utilityBody.querySelector("[data-img-file]");
  const stage = utilityBody.querySelector("[data-img-stage]");
  const canvas = utilityBody.querySelector("[data-img-canvas]");
  const qualityEl = utilityBody.querySelector("[data-ic-quality]");
  const qualityOut = utilityBody.querySelector("[data-ic-quality-out]");
  const formatEl = utilityBody.querySelector("[data-ic-format]");
  const noteEl = utilityBody.querySelector("[data-img-note]");
  const statsEl = utilityBody.querySelector("[data-ic-stats]");
  const downloadBtn = utilityBody.querySelector("[data-ic-download]");
  let image = null;
  let originalSize = 0;
  let resultBlob = null;

  qualityEl.addEventListener("input", () => {
    qualityOut.textContent = qualityEl.value;
  });

  fileEl.addEventListener("change", async () => {
    try {
      const file = fileEl.files[0];
      image = await loadImageFile(file);
      originalSize = file.size;
      stage.hidden = false;
      canvas.width = Math.min(image.naturalWidth, 900);
      canvas.height = Math.round((canvas.width / image.naturalWidth) * image.naturalHeight);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      noteEl.textContent = `${image.naturalWidth} × ${image.naturalHeight} · ${bytesLabel(originalSize)}`;
      statsEl.innerHTML = "";
      resultBlob = null;
      downloadBtn.disabled = true;
    } catch (error) {
      noteEl.textContent = error.message;
    }
  });

  const compress = () => {
    if (!image) {
      noteEl.textContent = "Choose an image first.";
      return;
    }
    const out = document.createElement("canvas");
    out.width = image.naturalWidth;
    out.height = image.naturalHeight;
    const context = out.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, out.width, out.height);
    context.drawImage(image, 0, 0);
    out.toBlob((blob) => {
      if (!blob) return;
      resultBlob = blob;
      const delta = Math.round((1 - blob.size / originalSize) * 100);
      const stat = (value, label) => `<div class="stat"><span>${value}</span><small>${label}</small></div>`;
      statsEl.innerHTML = [
        stat(bytesLabel(originalSize), "Original"),
        stat(bytesLabel(blob.size), "Compressed"),
        stat(delta >= 0 ? `${delta}%` : `+${Math.abs(delta)}%`, delta >= 0 ? "Saved" : "Larger"),
        stat(`${out.width}×${out.height}`, "Dimensions"),
      ].join("");
      noteEl.textContent = delta > 0
        ? `Smaller by ${delta}%.`
        : `This file is already optimised — ${Math.abs(delta)}% larger at this setting. Try a lower quality or JPEG.`;
      downloadBtn.disabled = false;
    }, formatEl.value, Number(qualityEl.value) / 100);
  };

  utilityBody.querySelector("[data-ic-run]").addEventListener("click", compress);
  downloadBtn.addEventListener("click", () => {
    if (!resultBlob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(resultBlob);
    link.download = `compressed.${formatEl.value === "image/webp" ? "webp" : "jpg"}`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

/* -------------------------------------------------------- resize image */
function renderImageResize() {
  utilityBody.innerHTML = imageStageHTML(`
    <div class="date-row">
      <div class="util-field">
        <label for="ir-width">Width (px)</label>
        <input id="ir-width" type="number" inputmode="numeric" min="1" data-ir-width />
      </div>
      <div class="util-field">
        <label for="ir-height">Height (px)</label>
        <input id="ir-height" type="number" inputmode="numeric" min="1" data-ir-height />
      </div>
    </div>
    <div class="util-toggles">
      <label><input type="checkbox" data-ir-lock checked /> Keep aspect ratio</label>
    </div>
    <div class="util-actions" data-ir-presets>
      <button class="util-btn" data-ir-preset="1080x1080">Instagram 1:1</button>
      <button class="util-btn" data-ir-preset="1080x1920">Story 9:16</button>
      <button class="util-btn" data-ir-preset="1200x675">Twitter 16:9</button>
      <button class="util-btn" data-ir-preset="1920x1080">HD 16:9</button>
    </div>
    <div class="util-actions">
      <button class="util-btn" data-ir-scale="50">50%</button>
      <button class="util-btn" data-ir-scale="75">75%</button>
      <button class="util-btn" data-ir-scale="100">Original</button>
      <button class="util-btn" data-ir-scale="200">200%</button>
    </div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-ir-run>Resize</button>
      <button class="util-btn" type="button" data-ir-download disabled>Download</button>
    </div>
  `);

  const fileEl = utilityBody.querySelector("[data-img-file]");
  const stage = utilityBody.querySelector("[data-img-stage]");
  const canvas = utilityBody.querySelector("[data-img-canvas]");
  const widthEl = utilityBody.querySelector("[data-ir-width]");
  const heightEl = utilityBody.querySelector("[data-ir-height]");
  const lockEl = utilityBody.querySelector("[data-ir-lock]");
  const noteEl = utilityBody.querySelector("[data-img-note]");
  const downloadBtn = utilityBody.querySelector("[data-ir-download]");
  let image = null;
  let resized = null;
  const ratio = () => (image ? image.naturalWidth / image.naturalHeight : 1);

  const syncHeight = () => {
    if (!image || !lockEl.checked) return;
    const width = Number(widthEl.value) || image.naturalWidth;
    heightEl.value = String(Math.max(1, Math.round(width / ratio())));
  };

  fileEl.addEventListener("change", async () => {
    try {
      image = await loadImageFile(fileEl.files[0]);
      stage.hidden = false;
      widthEl.value = String(image.naturalWidth);
      heightEl.value = String(image.naturalHeight);
      canvas.width = Math.min(image.naturalWidth, 900);
      canvas.height = Math.round((canvas.width / image.naturalWidth) * image.naturalHeight);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      noteEl.textContent = `${image.naturalWidth} × ${image.naturalHeight} pixels`;
      resized = null;
      downloadBtn.disabled = true;
    } catch (error) {
      noteEl.textContent = error.message;
    }
  });

  widthEl.addEventListener("input", syncHeight);
  utilityBody.querySelectorAll("[data-ir-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const [width, height] = button.dataset.irPreset.split("x");
      widthEl.value = width;
      heightEl.value = height;
      lockEl.checked = false;
    });
  });
  utilityBody.querySelectorAll("[data-ir-scale]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!image) return;
      const scale = Number(button.dataset.irScale) / 100;
      widthEl.value = String(Math.max(1, Math.round(image.naturalWidth * scale)));
      heightEl.value = String(Math.max(1, Math.round(image.naturalHeight * scale)));
    });
  });

  utilityBody.querySelector("[data-ir-run]").addEventListener("click", () => {
    if (!image) {
      noteEl.textContent = "Choose an image first.";
      return;
    }
    const width = Math.max(1, Math.round(Number(widthEl.value) || image.naturalWidth));
    const height = Math.max(1, Math.round(Number(heightEl.value) || image.naturalHeight));
    resized = document.createElement("canvas");
    resized.width = width;
    resized.height = height;
    const context = resized.getContext("2d");
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);
    canvas.width = Math.min(width, 900);
    canvas.height = Math.round((canvas.width / width) * height);
    canvas.getContext("2d").drawImage(resized, 0, 0, canvas.width, canvas.height);
    noteEl.textContent = `Resized to ${width} × ${height} pixels.`;
    downloadBtn.disabled = false;
  });

  downloadBtn.addEventListener("click", () => {
    if (resized) downloadCanvas(resized, "resized.png");
  });
}

/* -------------------------------------------------- convert image format */
function renderImageConvert() {
  utilityBody.innerHTML = imageStageHTML(`
    <div class="date-row">
      <div class="util-field">
        <label for="if-format">Convert to</label>
        <select id="if-format" data-if-format>
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/webp">WebP</option>
        </select>
      </div>
      <div class="util-field">
        <label for="if-quality">Quality: <output data-if-quality-out>85</output>%</label>
        <input id="if-quality" type="range" min="40" max="100" value="85" data-if-quality />
      </div>
    </div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-if-run>Convert</button>
      <button class="util-btn" type="button" data-if-download disabled>Download</button>
    </div>
    <div class="stat-grid" data-if-stats></div>
  `);

  const fileEl = utilityBody.querySelector("[data-img-file]");
  const stage = utilityBody.querySelector("[data-img-stage]");
  const canvas = utilityBody.querySelector("[data-img-canvas]");
  const formatEl = utilityBody.querySelector("[data-if-format]");
  const qualityEl = utilityBody.querySelector("[data-if-quality]");
  const qualityOut = utilityBody.querySelector("[data-if-quality-out]");
  const noteEl = utilityBody.querySelector("[data-img-note]");
  const statsEl = utilityBody.querySelector("[data-if-stats]");
  const downloadBtn = utilityBody.querySelector("[data-if-download]");
  let image = null;
  let resultBlob = null;

  const ext = () => (formatEl.value === "image/png" ? "png" : formatEl.value === "image/webp" ? "webp" : "jpg");

  qualityEl.addEventListener("input", () => {
    qualityOut.textContent = qualityEl.value;
  });
  formatEl.addEventListener("change", () => {
    qualityEl.disabled = formatEl.value === "image/png";
  });

  fileEl.addEventListener("change", async () => {
    try {
      image = await loadImageFile(fileEl.files[0]);
      stage.hidden = false;
      canvas.width = Math.min(image.naturalWidth, 900);
      canvas.height = Math.round((canvas.width / image.naturalWidth) * image.naturalHeight);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      noteEl.textContent = `Loaded ${image.naturalWidth} × ${image.naturalHeight}`;
      statsEl.innerHTML = "";
      resultBlob = null;
      downloadBtn.disabled = true;
    } catch (error) {
      noteEl.textContent = error.message;
    }
  });

  utilityBody.querySelector("[data-if-run]").addEventListener("click", () => {
    if (!image) {
      noteEl.textContent = "Choose an image first.";
      return;
    }
    const out = document.createElement("canvas");
    out.width = image.naturalWidth;
    out.height = image.naturalHeight;
    const context = out.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, out.width, out.height);
    context.drawImage(image, 0, 0);
    out.toBlob((blob) => {
      if (!blob) {
        noteEl.textContent = "This browser could not convert to that format.";
        return;
      }
      resultBlob = blob;
      const stat = (value, label) => `<div class="stat"><span>${value}</span><small>${label}</small></div>`;
      statsEl.innerHTML = [
        stat(ext().toUpperCase(), "Format"),
        stat(bytesLabel(blob.size), "Size"),
        stat(`${out.width}×${out.height}`, "Dimensions"),
      ].join("");
      noteEl.textContent = "Ready to download.";
      downloadBtn.disabled = false;
    }, formatEl.value, Number(qualityEl.value) / 100);
  });

  downloadBtn.addEventListener("click", () => {
    if (!resultBlob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(resultBlob);
    link.download = `converted.${ext()}`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

/* ---------------------------------------------------------- crop image */
function renderImageCrop() {
  utilityBody.innerHTML = imageStageHTML(`
    <p class="util-note">Drag on the image to select the area you want to keep.</p>
    <div class="date-row">
      <div class="util-field">
        <label for="crop-aspect">Aspect ratio</label>
        <select id="crop-aspect" data-crop-aspect>
          <option value="free" selected>Free</option>
          <option value="1">Square 1:1</option>
          <option value="1.7778">Wide 16:9</option>
          <option value="1.3333">Classic 4:3</option>
          <option value="0.5625">Story 9:16</option>
        </select>
      </div>
      <div class="util-field">
        <label>Selection (px)</label>
        <div class="date-input">
          <input type="number" inputmode="numeric" min="0" placeholder="x" data-crop-num="x" aria-label="Crop x" />
          <input type="number" inputmode="numeric" min="0" placeholder="y" data-crop-num="y" aria-label="Crop y" />
          <input type="number" inputmode="numeric" min="1" placeholder="w" data-crop-num="w" aria-label="Crop width" />
          <input type="number" inputmode="numeric" min="1" placeholder="h" data-crop-num="h" aria-label="Crop height" />
        </div>
      </div>
    </div>
    <div class="stat-grid" data-crop-stats></div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-crop-run disabled>Crop &amp; download</button>
      <button class="util-btn" type="button" data-crop-reset>Reset selection</button>
    </div>
  `);

  const fileEl = utilityBody.querySelector("[data-img-file]");
  const stage = utilityBody.querySelector("[data-img-stage]");
  const canvas = utilityBody.querySelector("[data-img-canvas]");
  const noteEl = utilityBody.querySelector("[data-img-note]");
  const statsEl = utilityBody.querySelector("[data-crop-stats]");
  const cropBtn = utilityBody.querySelector("[data-crop-run]");
  let image = null;
  let crop = null;
  let dragStart = null;

  const toNatural = (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;
    return {
      x: Math.max(0, Math.min(image.naturalWidth, (event.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(image.naturalHeight, (event.clientY - rect.top) * scaleY)),
    };
  };

  const draw = () => {
    if (!image) return;
    const scale = Math.min(1, 900 / image.naturalWidth);
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    if (crop && crop.w > 2 && crop.h > 2) {
      const s = canvas.width / image.naturalWidth;
      context.fillStyle = "rgba(6, 8, 20, 0.55)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.clearRect(crop.x * s, crop.y * s, crop.w * s, crop.h * s);
      context.drawImage(image, crop.x, crop.y, crop.w, crop.h, crop.x * s, crop.y * s, crop.w * s, crop.h * s);
      context.strokeStyle = "#7c5cff";
      context.lineWidth = 2;
      context.strokeRect(crop.x * s, crop.y * s, crop.w * s, crop.h * s);
      const stat = (value, label) => `<div class="stat"><span>${value}</span><small>${label}</small></div>`;
      statsEl.innerHTML = [
        stat(`${Math.round(crop.w)}×${Math.round(crop.h)}`, "Crop size"),
        stat(`${Math.round(crop.x)}, ${Math.round(crop.y)}`, "Position"),
      ].join("");
      cropBtn.disabled = false;
    } else {
      statsEl.innerHTML = "";
      cropBtn.disabled = true;
    }
  };

  fileEl.addEventListener("change", async () => {
    try {
      image = await loadImageFile(fileEl.files[0]);
      stage.hidden = false;
      crop = null;
      draw();
      noteEl.textContent = `${image.naturalWidth} × ${image.naturalHeight} · drag to select`;
    } catch (error) {
      noteEl.textContent = error.message;
    }
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (!image) return;
    canvas.setPointerCapture(event.pointerId);
    dragStart = toNatural(event);
    crop = { x: dragStart.x, y: dragStart.y, w: 0, h: 0 };
  });

  const aspectEl = utilityBody.querySelector("[data-crop-aspect]");
  const numEls = utilityBody.querySelectorAll("[data-crop-num]");

  const syncNumbers = () => {
    numEls.forEach((input) => {
      const key = input.dataset.cropNum;
      input.value = crop ? String(Math.round(crop[key])) : "";
    });
  };

  canvas.addEventListener("pointermove", (event) => {
    if (!dragStart) return;
    const point = toNatural(event);
    let w = Math.abs(point.x - dragStart.x);
    let h = Math.abs(point.y - dragStart.y);
    const ratio = Number(aspectEl.value);
    if (Number.isFinite(ratio)) {
      if (w / (h || 1) > ratio) w = h * ratio;
      else h = w / ratio;
    }
    crop = {
      x: point.x < dragStart.x ? dragStart.x - w : dragStart.x,
      y: point.y < dragStart.y ? dragStart.y - h : dragStart.y,
      w,
      h,
    };
    crop.x = Math.max(0, Math.min(image.naturalWidth - w, crop.x));
    crop.y = Math.max(0, Math.min(image.naturalHeight - h, crop.y));
    syncNumbers();
    draw();
  });

  numEls.forEach((input) => {
    input.addEventListener("input", () => {
      if (!image) return;
      const next = {
        x: Number(utilityBody.querySelector('[data-crop-num="x"]').value) || 0,
        y: Number(utilityBody.querySelector('[data-crop-num="y"]').value) || 0,
        w: Number(utilityBody.querySelector('[data-crop-num="w"]').value) || 0,
        h: Number(utilityBody.querySelector('[data-crop-num="h"]').value) || 0,
      };
      crop = next;
      draw();
    });
  });

  canvas.addEventListener("pointerup", () => {
    dragStart = null;
  });

  utilityBody.querySelector("[data-crop-reset]").addEventListener("click", () => {
    crop = null;
    draw();
  });

  cropBtn.addEventListener("click", () => {
    if (!image || !crop) return;
    const out = document.createElement("canvas");
    out.width = Math.max(1, Math.round(crop.w));
    out.height = Math.max(1, Math.round(crop.h));
    out.getContext("2d").drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, out.width, out.height);
    downloadCanvas(out, "cropped.png");
    noteEl.textContent = `Cropped to ${out.width} × ${out.height} and downloaded.`;
  });
}

/* --------------------------------------------------- colour from image */
function renderImageColour() {
  utilityBody.innerHTML = imageStageHTML(`
    <p class="util-note">Click anywhere on the image to read that pixel's colour.</p>
    <div class="util-actions">
      <button class="util-btn" type="button" data-pix-average>Average colour</button>
      <button class="util-btn" type="button" data-pix-css>Copy as CSS</button>
    </div>
    <div class="stat-grid" data-pix-stats></div>
    <div class="swatch-row" data-pix-history aria-label="Recent colours"></div>
  `);

  const fileEl = utilityBody.querySelector("[data-img-file]");
  const stage = utilityBody.querySelector("[data-img-stage]");
  const canvas = utilityBody.querySelector("[data-img-canvas]");
  const noteEl = utilityBody.querySelector("[data-img-note]");
  const statsEl = utilityBody.querySelector("[data-pix-stats]");
  const historyEl = utilityBody.querySelector("[data-pix-history]");
  let image = null;
  const history = [];

  fileEl.addEventListener("change", async () => {
    try {
      image = await loadImageFile(fileEl.files[0]);
      stage.hidden = false;
      canvas.width = Math.min(image.naturalWidth, 900);
      canvas.height = Math.round((canvas.width / image.naturalWidth) * image.naturalHeight);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      noteEl.textContent = `${image.naturalWidth} × ${image.naturalHeight} · click to sample`;
    } catch (error) {
      noteEl.textContent = error.message;
    }
  });

  canvas.addEventListener("click", (event) => {
    if (!image) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * canvas.height);
    const [r, g, b] = canvas.getContext("2d").getImageData(x, y, 1, 1).data;
    const hex = rgbToHex({ r, g, b });
    const hsl = rgbToHsl({ r, g, b });
    const stat = (value, label, copyValue) => `<button type="button" class="stat stat--copy" data-copy-value="${copyValue}" aria-label="Copy ${label}"><span>${value}</span><small>${label}</small></button>`;
    statsEl.innerHTML = [
      stat(hex.toUpperCase(), "HEX", hex),
      stat(`${r}, ${g}, ${b}`, "RGB", `rgb(${r}, ${g}, ${b})`),
      stat(`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`, "HSL", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`),
      stat(`${x}, ${y}`, "Pixel", `${x}, ${y}`),
    ].join("");
    statsEl.querySelectorAll("[data-copy-value]").forEach((button) => {
      button.addEventListener("click", () => utilCopy(button.dataset.copyValue, "Copied."));
    });

    history.unshift(hex);
    history.splice(8);
    historyEl.innerHTML = history
      .map((colour) => `<button type="button" class="swatch" style="background:${colour}" data-swatch="${colour}" aria-label="Copy ${colour}"></button>`)
      .join("");
    historyEl.querySelectorAll("[data-swatch]").forEach((button) => {
      button.addEventListener("click", () => utilCopy(button.dataset.swatch, `${button.dataset.swatch} copied.`));
    });
    noteEl.textContent = `${hex.toUpperCase()} at ${x}, ${y}`;
    lastHex = hex;
  });

  let lastHex = "";
  utilityBody.querySelector("[data-pix-average]").addEventListener("click", () => {
    if (!image) return;
    const context = canvas.getContext("2d");
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 40) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count += 1;
    }
    const hex = rgbToHex({ r: r / count, g: g / count, b: b / count });
    lastHex = hex;
    const stat = (value, label, copyValue) => `<button type="button" class="stat stat--copy" data-copy-value="${copyValue}" aria-label="Copy ${label}"><span>${value}</span><small>${label}</small></button>`;
    statsEl.innerHTML = [stat(hex.toUpperCase(), "Average", hex)].join("");
    statsEl.querySelectorAll("[data-copy-value]").forEach((button) => {
      button.addEventListener("click", () => utilCopy(button.dataset.copyValue, "Copied."));
    });
    noteEl.textContent = `Average colour of the whole image: ${hex.toUpperCase()}`;
  });
  utilityBody.querySelector("[data-pix-css]").addEventListener("click", () => {
    if (!lastHex) {
      noteEl.textContent = "Click a pixel (or average) first.";
      return;
    }
    utilCopy(`background-color: ${lastHex};`, "CSS copied.");
  });
}

/* -------------------------------------------------------- generate QR */
function renderQrCode() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="qr-text">Text or link</label>
      <textarea id="qr-text" class="util-textarea" data-qr-text placeholder="https://example.com">https://542bheemsingh-cmd.github.io/Flip-watch/</textarea>
    </div>
    <div class="util-actions" data-qr-presets>
      <button class="util-btn" data-qr-preset="url">Link</button>
      <button class="util-btn" data-qr-preset="wifi">Wi-Fi</button>
      <button class="util-btn" data-qr-preset="email">Email</button>
      <button class="util-btn" data-qr-preset="phone">Phone</button>
      <button class="util-btn" data-qr-preset="text">Plain text</button>
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="qr-size">Size (px)</label>
        <input id="qr-size" type="number" inputmode="numeric" min="128" max="1024" step="32" value="320" data-qr-size />
      </div>
      <div class="util-field">
        <label for="qr-ec">Error correction</label>
        <select id="qr-ec" data-qr-ec>
          <option value="L">L (7%)</option>
          <option value="M" selected>M (15%)</option>
          <option value="Q">Q (25%)</option>
          <option value="H">H (30%)</option>
        </select>
      </div>
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="qr-fg">Code colour</label>
        <input id="qr-fg" type="color" value="#0a0b16" data-qr-fg />
      </div>
      <div class="util-field">
        <label for="qr-bg">Background</label>
        <input id="qr-bg" type="color" value="#ffffff" data-qr-bg />
      </div>
    </div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-qr-run>Generate</button>
      <button class="util-btn" type="button" data-qr-download disabled>Download PNG</button>
      <button class="util-btn" type="button" data-qr-svg disabled>Download SVG</button>
    </div>
    <p class="util-note" data-qr-status></p>
    <div class="qr-stage"><canvas data-qr-canvas width="320" height="320"></canvas></div>
    <div class="chip-row" data-qr-history></div>
  `;

  const textEl = utilityBody.querySelector("[data-qr-text]");
  const sizeEl = utilityBody.querySelector("[data-qr-size]");
  const ecEl = utilityBody.querySelector("[data-qr-ec]");
  const fgEl = utilityBody.querySelector("[data-qr-fg]");
  const bgEl = utilityBody.querySelector("[data-qr-bg]");
  const canvas = utilityBody.querySelector("[data-qr-canvas]");
  const statusEl = utilityBody.querySelector("[data-qr-status]");
  const downloadBtn = utilityBody.querySelector("[data-qr-download]");
  const svgBtn = utilityBody.querySelector("[data-qr-svg]");
  const historyEl = utilityBody.querySelector("[data-qr-history]");
  const history = [];
  let lastModules = null;
  let lastCount = 0;

  const PRESETS = {
    url: "https://example.com",
    wifi: "WIFI:T:WPA;S:MyNetwork;P:my-password;;",
    email: "mailto:hello@example.com?subject=Hello",
    phone: "tel:+911234567890",
    text: "Hello from Flip Watch",
  };

  const build = () => {
    const text = textEl.value.trim();
    if (!text) {
      statusEl.textContent = "Type something to encode.";
      return false;
    }
    if (typeof qrcode !== "function") {
      statusEl.textContent = "QR engine is not loaded — reload the page.";
      return false;
    }
    try {
      const qr = qrcode(0, ecEl.value);
      qr.addData(text);
      qr.make();
      lastCount = qr.getModuleCount();
      lastModules = [];
      for (let row = 0; row < lastCount; row += 1) {
        for (let column = 0; column < lastCount; column += 1) {
          if (qr.isDark(row, column)) lastModules.push([row, column]);
        }
      }
      return true;
    } catch (error) {
      statusEl.textContent = `Could not generate — ${error.message}`;
      return false;
    }
  };

  const paint = () => {
    const size = Math.max(128, Math.min(1024, Math.round(Number(sizeEl.value) || 320)));
    const quiet = 4;
    const cell = Math.max(1, Math.floor(size / (lastCount + quiet * 2)));
    const dimension = cell * (lastCount + quiet * 2);
    canvas.width = dimension;
    canvas.height = dimension;
    const context = canvas.getContext("2d");
    context.fillStyle = bgEl.value;
    context.fillRect(0, 0, dimension, dimension);
    context.fillStyle = fgEl.value;
    lastModules.forEach(([row, column]) => {
      context.fillRect((column + quiet) * cell, (row + quiet) * cell, cell, cell);
    });
    statusEl.textContent = `${lastCount} × ${lastCount} modules · ${dimension}px · level ${ecEl.value}`;
    downloadBtn.disabled = false;
    svgBtn.disabled = false;
  };

  const generate = () => {
    if (!build()) return;
    paint();
    const text = textEl.value.trim();
    history.unshift(text);
    const unique = [...new Set(history)].slice(0, 5);
    historyEl.innerHTML = unique
      .map((item) => `<button type="button" class="chip chip--button" data-qr-recent="${encodeURIComponent(item)}">${item.length > 24 ? `${item.slice(0, 24)}…` : item}</button>`)
      .join("");
    historyEl.querySelectorAll("[data-qr-recent]").forEach((button) => {
      button.addEventListener("click", () => {
        textEl.value = decodeURIComponent(button.dataset.qrRecent);
        generate();
      });
    });
  };

  utilityBody.querySelectorAll("[data-qr-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      textEl.value = PRESETS[button.dataset.qrPreset];
      generate();
    });
  });

  utilityBody.querySelector("[data-qr-run]").addEventListener("click", generate);
  [sizeEl, fgEl, bgEl, ecEl].forEach((el) => {
    el.addEventListener("input", () => {
      if (!lastModules) return;
      if (el === ecEl) generate();
      else paint();
    });
  });

  downloadBtn.addEventListener("click", () => downloadCanvas(canvas, "qr-code.png"));
  svgBtn.addEventListener("click", () => {
    if (!lastModules) return;
    const quiet = 4;
    const size = lastCount + quiet * 2;
    const rects = lastModules
      .map(([row, column]) => `<rect x="${column + quiet}" y="${row + quiet}" width="1" height="1"/>`)
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="${bgEl.value}"/><g fill="${fgEl.value}">${rects}</g></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "qr-code.svg";
    link.click();
    URL.revokeObjectURL(link.href);
  });

  generate();
}

/* -------------------------------------------------- statistics calculator */
function renderStatistics() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="st-input">Numbers (separate with commas, spaces or new lines)</label>
      <textarea id="st-input" class="util-textarea util-textarea--code" data-st-input placeholder="12, 7, 3, 19, 7, 25"></textarea>
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="st-spread">Standard deviation</label>
        <select id="st-spread" data-st-spread>
          <option value="population" selected>Population (÷n)</option>
          <option value="sample">Sample (÷n−1)</option>
        </select>
      </div>
      <div class="util-field">
        <label>Actions</label>
        <div class="util-actions">
          <button class="util-btn" type="button" data-st-copy>Copy</button>
          <button class="util-btn" type="button" data-st-clear>Clear</button>
        </div>
      </div>
    </div>
    <div class="stat-grid" data-st-stats></div>
    <canvas class="histogram" data-st-histogram width="600" height="160" aria-label="Histogram of the values"></canvas>
    <p class="util-note" data-st-note></p>
  `;

  const input = utilityBody.querySelector("[data-st-input]");
  const spreadEl = utilityBody.querySelector("[data-st-spread]");
  const statsEl = utilityBody.querySelector("[data-st-stats]");
  const noteEl = utilityBody.querySelector("[data-st-note]");
  const canvas = utilityBody.querySelector("[data-st-histogram]");
  let summary = "";

  const drawHistogram = (numbers) => {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!numbers.length) return;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const bins = Math.min(14, Math.max(3, Math.round(Math.sqrt(numbers.length))));
    const width = (max - min) / bins || 1;
    const counts = new Array(bins).fill(0);
    numbers.forEach((value) => {
      const index = Math.min(bins - 1, Math.floor((value - min) / width));
      counts[index] += 1;
    });
    const peak = Math.max(...counts) || 1;
    const barWidth = canvas.width / bins;
    counts.forEach((count, index) => {
      const height = Math.round((count / peak) * (canvas.height - 18));
      context.fillStyle = "rgba(124, 92, 255, 0.85)";
      context.fillRect(index * barWidth + 3, canvas.height - height - 14, barWidth - 6, height);
      context.fillStyle = "rgba(255,255,255,0.55)";
      context.font = "10px system-ui, sans-serif";
      context.textAlign = "center";
      context.fillText(String(count), index * barWidth + barWidth / 2, canvas.height - 3);
    });
  };

  const update = () => {
    const numbers = (input.value.match(/-?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || []).map(Number).filter((n) => Number.isFinite(n));
    if (!numbers.length) {
      statsEl.innerHTML = "";
      noteEl.textContent = "Paste some numbers to see the statistics.";
      summary = "";
      canvas.hidden = true;
      drawHistogram([]);
      return;
    }
    const sorted = numbers.slice().sort((a, b) => a - b);
    const count = numbers.length;
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const median = count % 2 ? sorted[(count - 1) / 2] : (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
    const counts = new Map();
    numbers.forEach((n) => counts.set(n, (counts.get(n) || 0) + 1));
    const maxCount = Math.max(...counts.values());
    const modes = [...counts.entries()].filter(([, c]) => c === maxCount).map(([n]) => n);
    const divisor = spreadEl.value === "sample" && count > 1 ? count - 1 : count;
    const variance = numbers.reduce((acc, n) => acc + (n - mean) ** 2, 0) / divisor;
    const stdev = Math.sqrt(variance);
    const percentile = (p) => {
      const index = (count - 1) * p;
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
    };
    const round = (n) => (Math.round(n * 1000) / 1000).toString();
    const stat = (value, label) => `<div class="stat"><span>${value}</span><small>${label}</small></div>`;

    const q1 = percentile(0.25);
    const q3 = percentile(0.75);
    statsEl.innerHTML = [
      stat(String(count), "Count"),
      stat(round(sum), "Sum"),
      stat(round(mean), "Mean"),
      stat(round(median), "Median"),
      stat(maxCount > 1 ? modes.slice(0, 3).map(round).join(", ") : "none", "Mode"),
      stat(round(stdev), "Std deviation"),
      stat(round(variance), "Variance"),
      stat(round(q1), "Q1"),
      stat(round(q3), "Q3"),
      stat(round(q3 - q1), "IQR"),
      stat(round(sorted[0]), "Min"),
      stat(round(sorted[count - 1]), "Max"),
    ].join("");
    noteEl.textContent = `${count} values · ${spreadEl.value === "sample" ? "sample" : "population"} standard deviation · range ${round(sorted[count - 1] - sorted[0])}`;
    summary = `Count: ${count}\nSum: ${round(sum)}\nMean: ${round(mean)}\nMedian: ${round(median)}\nStd dev: ${round(stdev)}\nMin: ${round(sorted[0])}\nMax: ${round(sorted[count - 1])}`;
    canvas.hidden = false;
    drawHistogram(numbers);
  };

  input.addEventListener("input", update);
  spreadEl.addEventListener("change", update);
  utilityBody.querySelector("[data-st-copy]").addEventListener("click", () => utilCopy(summary, "Statistics copied."));
  utilityBody.querySelector("[data-st-clear]").addEventListener("click", () => {
    input.value = "";
    update();
    input.focus();
  });
  update();
}

/* -------------------------------------------------- prime checker */
function renderPrime() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="pr-input">Number</label>
      <input id="pr-input" type="number" inputmode="numeric" min="2" step="1" value="97" data-pr-input />
    </div>
    <div class="util-actions">
      <button class="util-btn" type="button" data-pr-prev>Previous prime</button>
      <button class="util-btn" type="button" data-pr-next>Next prime</button>
      <button class="util-btn" type="button" data-pr-copy>Copy result</button>
    </div>
    <div class="stat-grid" data-pr-stats></div>
    <div class="date-row">
      <div class="util-field">
        <label for="pr-from">List primes from</label>
        <input id="pr-from" type="number" inputmode="numeric" min="2" value="2" data-pr-from />
      </div>
      <div class="util-field">
        <label for="pr-to">to</label>
        <input id="pr-to" type="number" inputmode="numeric" min="2" value="100" data-pr-to />
      </div>
    </div>
    <div class="util-actions">
      <button class="util-btn" type="button" data-pr-range>List primes in range</button>
    </div>
    <p class="util-note" data-pr-note></p>
  `;

  const input = utilityBody.querySelector("[data-pr-input]");
  const statsEl = utilityBody.querySelector("[data-pr-stats]");
  const noteEl = utilityBody.querySelector("[data-pr-note]");
  const fromEl = utilityBody.querySelector("[data-pr-from]");
  const toEl = utilityBody.querySelector("[data-pr-to]");
  const stat = (value, label) => `<div class="stat"><span>${value}</span><small>${label}</small></div>`;
  let summary = "";

  const isPrime = (n) => {
    if (n < 2) return false;
    if (n % 2 === 0) return n === 2;
    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  };

  const factorise = (n) => {
    const factors = [];
    let value = n;
    for (let i = 2; i * i <= value; i += 1) {
      while (value % i === 0) {
        factors.push(i);
        value /= i;
      }
    }
    if (value > 1) factors.push(value);
    return factors;
  };

  const update = () => {
    const n = Math.floor(Number(input.value));
    if (!Number.isFinite(n) || n < 2) {
      statsEl.innerHTML = stat("—", "Enter a whole number of 2 or more");
      noteEl.textContent = "";
      summary = "";
      return;
    }
    if (n > 1e12) {
      statsEl.innerHTML = stat("—", "Too large");
      noteEl.textContent = "Please use a number below 1,000,000,000,000.";
      summary = "";
      return;
    }
    const prime = isPrime(n);
    const factors = prime ? [n] : factorise(n);
    const grouped = factors.reduce((acc, factor) => {
      acc[factor] = (acc[factor] || 0) + 1;
      return acc;
    }, {});
    const expression = Object.entries(grouped)
      .map(([factor, power]) => (power > 1 ? `${factor}^${power}` : factor))
      .join(" × ");

    statsEl.innerHTML = [
      stat(prime ? "Prime" : "Composite", "Type"),
      stat(String(factors.length), "Prime factors"),
      stat(expression || "—", "Factorisation"),
    ].join("");
    noteEl.textContent = prime ? `${n} has no divisors other than 1 and itself.` : `${n} = ${expression}`;
    summary = `${n} is ${prime ? "prime" : `composite = ${expression}`}`;
  };

  utilityBody.querySelector("[data-pr-prev]").addEventListener("click", () => {
    let n = Math.floor(Number(input.value)) - 1;
    while (n > 1 && !isPrime(n)) n -= 1;
    if (n > 1) {
      input.value = String(n);
      update();
    }
  });
  utilityBody.querySelector("[data-pr-next]").addEventListener("click", () => {
    let n = Math.floor(Number(input.value)) + 1;
    while (!isPrime(n)) n += 1;
    input.value = String(n);
    update();
  });
  utilityBody.querySelector("[data-pr-copy]").addEventListener("click", () => utilCopy(summary, "Result copied."));
  utilityBody.querySelector("[data-pr-range]").addEventListener("click", () => {
    const from = Math.max(2, Math.floor(Number(fromEl.value) || 2));
    const to = Math.min(from + 200000, Math.floor(Number(toEl.value) || 100));
    if (to < from) {
      noteEl.textContent = "The end of the range must be larger than the start.";
      return;
    }
    const primes = [];
    for (let i = from; i <= to; i += 1) {
      if (isPrime(i)) primes.push(i);
    }
    noteEl.textContent = `${primes.length} primes between ${from} and ${to}: ${primes.slice(0, 15).join(", ")}${primes.length > 15 ? " …" : ""}`;
  });

  input.addEventListener("input", update);
  update();
}

/* ---------------------------------------------------- generate calendar */
function renderCalendar() {
  const today = new Date();
  utilityBody.innerHTML = `
    <div class="date-row">
      <div class="util-field">
        <label for="cal-month">Month</label>
        <select id="cal-month" data-cal-month>
          ${Array.from({ length: 12 }, (_, i) => `<option value="${i}">${new Date(2000, i, 1).toLocaleDateString("en-IN", { month: "long" })}</option>`).join("")}
        </select>
      </div>
      <div class="util-field">
        <label for="cal-year">Year</label>
        <input id="cal-year" type="number" inputmode="numeric" min="1900" max="2100" value="${today.getFullYear()}" data-cal-year />
      </div>
    </div>
    <div class="util-toggles">
      <label><input type="checkbox" data-cal-monday /> Week starts on Monday</label>
      <label><input type="checkbox" data-cal-yearview /> Show the whole year</label>
    </div>
    <div class="util-actions">
      <button class="util-btn" type="button" data-cal-prev>&larr; Previous</button>
      <button class="util-btn" type="button" data-cal-today>This month</button>
      <button class="util-btn" type="button" data-cal-next>Next &rarr;</button>
      <button class="util-btn" type="button" data-cal-print>Print</button>
    </div>
    <div class="calendar-wrap" data-cal-grid></div>
    <p class="util-note" data-cal-note></p>
  `;

  const monthEl = utilityBody.querySelector("[data-cal-month]");
  const yearEl = utilityBody.querySelector("[data-cal-year]");
  const mondayEl = utilityBody.querySelector("[data-cal-monday]");
  const yearViewEl = utilityBody.querySelector("[data-cal-yearview]");
  const gridEl = utilityBody.querySelector("[data-cal-grid]");
  const noteEl = utilityBody.querySelector("[data-cal-note]");

  const monthTable = (month, year) => {
    const first = new Date(year, month, 1);
    const days = new Date(year, month + 1, 0).getDate();
    const offset = mondayEl.checked ? (first.getDay() + 6) % 7 : first.getDay();
    const labels = mondayEl.checked
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const cells = [];
    for (let i = 0; i < offset; i += 1) cells.push('<td class="is-empty"></td>');
    for (let day = 1; day <= days; day += 1) {
      const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
      cells.push(`<td class="${isToday ? "is-today" : ""}">${day}</td>`);
    }
    while (cells.length % 7 !== 0) cells.push('<td class="is-empty"></td>');
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(`<tr>${cells.slice(i, i + 7).join("")}</tr>`);
    return `
      <h3 class="calendar-title">${first.toLocaleDateString("en-IN", { month: "long" })} ${year}</h3>
      <table class="calendar-table">
        <thead><tr>${labels.map((d) => `<th>${d}</th>`).join("")}</tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>`;
  };

  const render = () => {
    const month = Number(monthEl.value);
    const year = Math.max(1900, Math.min(2100, Math.floor(Number(yearEl.value) || today.getFullYear())));

    if (yearViewEl.checked) {
      gridEl.innerHTML = `<div class="calendar-year">${Array.from({ length: 12 }, (_, m) => `<div class="calendar-month">${monthTable(m, year)}</div>`).join("")}</div>`;
      noteEl.textContent = `Full year ${year}`;
      return;
    }
    gridEl.innerHTML = monthTable(month, year);
    const days = new Date(year, month + 1, 0).getDate();
    noteEl.textContent = `${days} days · starts on ${new Date(year, month, 1).toLocaleDateString("en-IN", { weekday: "long" })}`;
  };

  const step = (delta) => {
    let month = Number(monthEl.value) + delta;
    let year = Math.floor(Number(yearEl.value) || today.getFullYear());
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    if (month > 11) {
      month = 0;
      year += 1;
    }
    monthEl.value = String(month);
    yearEl.value = String(Math.max(1900, Math.min(2100, year)));
    render();
  };

  monthEl.value = String(today.getMonth());
  monthEl.addEventListener("change", render);
  yearEl.addEventListener("input", render);
  mondayEl.addEventListener("change", render);
  yearViewEl.addEventListener("change", render);
  utilityBody.querySelector("[data-cal-prev]").addEventListener("click", () => step(-1));
  utilityBody.querySelector("[data-cal-next]").addEventListener("click", () => step(1));
  utilityBody.querySelector("[data-cal-today]").addEventListener("click", () => {
    monthEl.value = String(today.getMonth());
    yearEl.value = String(today.getFullYear());
    yearViewEl.checked = false;
    render();
  });
  utilityBody.querySelector("[data-cal-print]").addEventListener("click", () => window.print());
  render();
}

/* drag and drop for every image tool */
if (utilityBody) {
  const showDrop = () => utilityBody.classList.add("is-dragover");
  const hideDrop = () => utilityBody.classList.remove("is-dragover");
  ["dragenter", "dragover"].forEach((type) => utilityBody.addEventListener(type, (event) => {
    if (!utilityBody.querySelector("[data-img-file]")) return;
    event.preventDefault();
    showDrop();
  }));
  ["dragleave", "drop"].forEach((type) => utilityBody.addEventListener(type, (event) => {
    if (!utilityBody.querySelector("[data-img-file]")) return;
    event.preventDefault();
    hideDrop();
    if (type !== "drop") return;
    const fileEl = utilityBody.querySelector("[data-img-file]");
    const file = event.dataTransfer?.files?.[0];
    if (!fileEl || !file || !file.type.startsWith("image/")) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    fileEl.files = transfer.files;
    fileEl.dispatchEvent(new Event("change", { bubbles: true }));
  }));
}

/* ---------------------------------------------------- tool search */
const TOOL_CATEGORIES = {
  stopwatch: "Time",
  timer: "Time",
  clock: "Time",
  dates: "Dates",
  calendar: "Dates",
  calculator: "Maths",
  equation: "Maths",
  converter: "Maths",
  stats: "Maths",
  prime: "Maths",
  gst: "Money",
  emi: "Money",
  fuel: "Money",
  wordcount: "Text",
  findreplace: "Text",
  textpad: "Text",
  json: "Developer",
  base64: "Developer",
  qrcode: "Developer",
  imgcompress: "Images",
  imgresize: "Images",
  imgconvert: "Images",
  imgcrop: "Images",
  imgcolour: "Images",
  color: "Images",
  password: "Security",
  pwstrength: "Security",
  todo: "Productivity",
  random: "Fun",
  pdf: "Files",
  pdf2img: "Files",
  img2pdf: "Files",
  protectpdf: "Files",
  html2pdf: "Files",
  watermark: "Files",
  typing: "Practice",
};

const CATEGORY_ORDER = ["All", "Time", "Dates", "Maths", "Money", "Text", "Images", "Developer", "Security", "Productivity", "Fun", "Files"];

const toolSearchInput = document.querySelector("[data-tool-search]");
const toolSearchCount = document.querySelector("[data-tool-search-count]");
const toolSearchEmpty = document.querySelector("[data-tool-search-empty]");
const toolFiltersEl = document.querySelector("[data-tool-filters]");

if (toolSearchInput) {
  const cards = Array.from(document.querySelectorAll("[data-open-tool]"));
  cards.forEach((card) => {
    card.dataset.category = TOOL_CATEGORIES[card.dataset.openTool] || "Other";
    if (!card.querySelector(".tool-tag")) {
      const tag = document.createElement("span");
      tag.className = "tool-tag";
      tag.textContent = card.dataset.category;
      card.append(tag);
    }
  });

  const CATEGORY_KEY = "flip-watch-tool-category";
  let activeCategory = "All";
  try {
    const savedCategory = localStorage.getItem(CATEGORY_KEY);
    if (savedCategory && CATEGORY_ORDER.includes(savedCategory)) activeCategory = savedCategory;
  } catch (error) {
    // Ignore storage failures; the filter simply starts on All.
  }

  const applyFilter = () => {
    const query = toolSearchInput.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach((card) => {
      const haystack = `${card.textContent} ${card.dataset.openTool} ${card.dataset.category}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesCategory = activeCategory === "All" || card.dataset.category === activeCategory;
      const visible = matchesQuery && matchesCategory;
      card.classList.toggle("is-hidden", !visible);
      if (visible) shown += 1;
    });
    if (toolSearchCount) {
      toolSearchCount.textContent = query || activeCategory !== "All" ? `${shown} of ${cards.length}` : `${cards.length} tools`;
    }
    if (toolSearchEmpty) toolSearchEmpty.hidden = shown > 0;
    if (toolFiltersEl) {
      toolFiltersEl.querySelectorAll("[data-filter]").forEach((chip) => {
        chip.setAttribute("aria-pressed", String(chip.dataset.filter === activeCategory));
      });
    }
  };

  if (toolFiltersEl) {
    const counts = cards.reduce((acc, card) => {
      acc[card.dataset.category] = (acc[card.dataset.category] || 0) + 1;
      return acc;
    }, {});
    const order = counts.Other ? [...CATEGORY_ORDER, "Other"] : CATEGORY_ORDER;
    toolFiltersEl.innerHTML = order
      .filter((name) => name === "All" || counts[name])
      .map((name) => {
        const total = name === "All" ? cards.length : counts[name];
        return `<button type="button" class="filter-chip" data-filter="${name}" aria-pressed="${name === "All"}">${name}<span>${total}</span></button>`;
      })
      .join("");

    toolFiltersEl.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-filter]");
      if (!chip) return;
      activeCategory = chip.dataset.filter;
      try {
        localStorage.setItem(CATEGORY_KEY, activeCategory);
      } catch (error) {
        // Filter persistence is optional.
      }
      applyFilter();
    });
  }

  const resetFilters = document.querySelector("[data-tool-reset]");
  if (resetFilters) {
    resetFilters.addEventListener("click", () => {
      toolSearchInput.value = "";
      activeCategory = "All";
      try {
        localStorage.setItem(CATEGORY_KEY, "All");
      } catch (error) {
        // Ignore.
      }
      applyFilter();
      toolSearchInput.focus();
    });
  }

  const clearButton = document.querySelector("[data-tool-clear]");
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      toolSearchInput.value = "";
      clearButton.hidden = true;
      applyFilter();
      toolSearchInput.focus();
    });
  }

  const syncClear = () => {
    if (clearButton) clearButton.hidden = toolSearchInput.value === "";
  };
  toolSearchInput.addEventListener("input", syncClear);
  syncClear();

  toolSearchInput.addEventListener("input", applyFilter);
  toolSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toolSearchInput.value = "";
      activeCategory = "All";
      try {
        localStorage.setItem(CATEGORY_KEY, activeCategory);
      } catch (error) {
        // Ignore.
      }
      applyFilter();
      toolSearchInput.blur();
    }
    if (event.key === "Enter") {
      const first = cards.find((card) => !card.classList.contains("is-hidden"));
      if (first) first.click();
    }
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (target && target.closest && target.closest("input, textarea, select, [contenteditable='true']")) return;
    if (event.key === "/") {
      event.preventDefault();
      if (dashboard.hidden) return;
      toolSearchInput.focus();
      toolSearchInput.select();
    }
  });

  applyFilter();
}

/* ------------------------------------------------------ recent tools */
const RECENT_TOOLS_KEY = "flip-watch-recent-tools";

function recordRecentTool(kind) {
  if (!kind) return;
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_TOOLS_KEY) || "[]");
    const list = Array.isArray(stored) ? stored.filter((entry) => typeof entry === "string" && entry !== kind) : [];
    list.unshift(kind);
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(list.slice(0, 4)));
  } catch (error) {
    // Storage can be unavailable; recents are a nicety, not a requirement.
  }
}

function renderRecentTools() {
  const container = document.querySelector("[data-tool-recent]");
  if (!container) return;
  let stored = [];
  try {
    stored = JSON.parse(localStorage.getItem(RECENT_TOOLS_KEY) || "[]");
  } catch (error) {
    stored = [];
  }
  const items = (Array.isArray(stored) ? stored : [])
    .map((kind) => {
      const card = document.querySelector(`[data-open-tool="${kind}"]`);
      if (!card) return null;
      return {
        kind,
        name: card.querySelector(".tool-name")?.textContent?.trim() || kind,
        icon: card.querySelector(".tool-icon")?.textContent?.trim() || "",
      };
    })
    .filter(Boolean);

  if (!items.length) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  container.hidden = false;
  container.innerHTML = `<span class="tool-recent__label">Recent</span>${items
    .map((item) => `<button type="button" class="chip chip--button" data-recent="${item.kind}">${item.icon} ${item.name}</button>`)
    .join("")}`;
  container.querySelectorAll("[data-recent]").forEach((button) => {
    button.addEventListener("click", () => openTool(button.dataset.recent));
  });
}

renderRecentTools();

/* --------------------------------------------- keyboard grid navigation */
document.addEventListener("keydown", (event) => {
  const card = event.target.closest && event.target.closest("[data-open-tool]");
  if (!card || dashboard.hidden) return;
  if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

  const visible = Array.from(document.querySelectorAll("[data-open-tool]")).filter(
    (element) => !element.classList.contains("is-hidden")
  );
  const index = visible.indexOf(card);
  if (index < 0) return;

  const grid = document.querySelector(".tool-grid");
  const columns = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length : 3;
  let next = null;

  if (event.key === "ArrowRight") next = visible[index + 1];
  else if (event.key === "ArrowLeft") next = visible[index - 1];
  else if (event.key === "ArrowDown") next = visible[index + columns];
  else if (event.key === "ArrowUp") next = visible[index - columns];
  else if (event.key === "Home") next = visible[0];
  else if (event.key === "End") next = visible[visible.length - 1];

  if (next) {
    event.preventDefault();
    next.focus();
  }
});

/* scientific keypad toggle (phones only) */
const scienceToggle = document.querySelector("[data-calc-science-toggle]");
if (scienceToggle) {
  const keypad = document.querySelector(".calculator-keypad");
  scienceToggle.addEventListener("click", () => {
    const open = keypad.classList.toggle("is-science-open");
    scienceToggle.setAttribute("aria-expanded", String(open));
    scienceToggle.setAttribute("aria-label", open ? "Hide scientific functions" : "Show scientific functions");
  });
}

/* Escape returns to the dashboard from any open tool */
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (document.querySelector("[data-about-dialog]")?.open) return;
  if (event.target && event.target.closest && event.target.closest("input[type='search']")) return;
  const panels = [toolPanel, calculatorPanel, equationPanel, utilityPanel].filter(Boolean);
  if (panels.some((panel) => !panel.hidden)) {
    event.preventDefault();
    showDashboard();
  }
});

/* copy the calculator result */
const calculatorCopyButton = document.querySelector("[data-calc-copy]");
if (calculatorCopyButton) {
  calculatorCopyButton.addEventListener("click", () => {
    const value = calculatorInput?.value?.trim();
    if (!value || value === "0") {
      showAppToast("Nothing to copy yet.");
      return;
    }
    utilCopy(value, "Result copied.");
  });
}

/* clear everything this app stored in the browser */
const clearDataButton = document.querySelector("[data-clear-data]");
if (clearDataButton) {
  clearDataButton.addEventListener("click", async () => {
    const sure = window.confirm(
      "Delete saved timers, tasks, recents, settings and cached files from this browser?"
    );
    if (!sure) return;
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("flip-watch"))
        .forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      // Storage may be unavailable; nothing else to clean up.
    }
    try {
      if (indexedDB.databases) {
        const databases = await indexedDB.databases();
        databases.forEach((database) => {
          if (database.name) indexedDB.deleteDatabase(database.name);
        });
      }
    } catch (error) {
      // Ignore — some browsers block enumeration.
    }
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    } catch (error) {
      // Cache API may be unavailable.
    }
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    } catch (error) {
      // No service worker support.
    }
    window.location.reload();
  });
}

/* copy the equation calculator result */
const equationCopyButton = document.querySelector("[data-equation-copy]");
if (equationCopyButton) {
  equationCopyButton.addEventListener("click", () => {
    const value = document.querySelector("[data-equation-result-value]")?.textContent?.trim();
    const label = document.querySelector("[data-equation-result-label]")?.textContent?.trim() || "Result";
    if (!value) {
      showAppToast("Nothing to copy yet.");
      return;
    }
    utilCopy(`${label}: ${value}`, "Result copied.");
  });
}

/* quick "+1 / +5 min" for the timer */
document.querySelectorAll("[data-timer-add]").forEach((button) => {
  button.addEventListener("click", () => {
    const delta = Math.max(1, Number(button.dataset.timerAdd) || 1);
    const extra = delta * 60 * 1000;
    if (isRunning) {
      // Extend the countdown that is already in flight.
      timerRemainingBeforeStart += extra;
      selectedTimerDuration = Math.max(selectedTimerDuration, timerRemainingBeforeStart);
    } else {
      const currentMinutes = Math.max(1, Math.round(selectedTimerDuration / 60000));
      setTimerDuration(currentMinutes + delta);
      return;
    }
    lastRenderedCentiseconds = -1;
    renderTimer(true);
    showAppToast(`Added ${delta} minute${delta === 1 ? "" : "s"}.`);
  });
});

/* deep links: /#gst opens the GST calculator */
const deepLinkTools = new Set(
  Array.from(document.querySelectorAll("[data-open-tool]")).map((card) => card.dataset.openTool)
);

function openToolFromHash() {
  const kind = decodeURIComponent(location.hash.replace(/^#/, "")).trim();
  if (!kind || !deepLinkTools.has(kind)) return;
  if (kind === "pdf") return;
  openTool(kind);
}

window.addEventListener("hashchange", openToolFromHash);
// Defer: at this point the tool renderers further down the file are still in
// their temporal dead zone, so opening a tool here produced an empty panel (and
// the throw stopped the back button from being wired at all).
window.setTimeout(() => {
  try {
    openToolFromHash();
  } catch (error) {
    console.error("[FlipWatch] deep link failed", error);
  }
}, 0);

/* copy a shareable link to the open tool */
const utilityLinkButton = document.querySelector("[data-utility-link]");
if (utilityLinkButton) {
  utilityLinkButton.addEventListener("click", () => {
    utilCopy(location.href, "Link copied.");
  });
}

/* back to top for the long tool list */
const toTopButton = document.querySelector("[data-to-top]");

function scrollPageToTop() {
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    window.scrollTo(0, 0);
  }
  // Some engines ignore the options object; make sure we still land at the top.
  window.setTimeout(() => {
    if (window.scrollY > 4) window.scrollTo(0, 0);
  }, 600);
}

if (toTopButton) {
  window.addEventListener(
    "scroll",
    () => {
      toTopButton.hidden = window.scrollY < 600;
    },
    { passive: true }
  );
  toTopButton.hidden = window.scrollY < 600;
}

document.addEventListener("click", (event) => {
  if (event.target.closest && event.target.closest("[data-to-top]")) {
    scrollPageToTop();
  }
});

/* --------------------------------------------------- PDF → images */
function renderPdfToImages() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="p2i-file">PDF file</label>
      <input id="p2i-file" class="util-file" type="file" accept="application/pdf" data-p2i-file />
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="p2i-from">From page</label>
        <input id="p2i-from" type="number" inputmode="numeric" min="1" value="1" data-p2i-from />
      </div>
      <div class="util-field">
        <label for="p2i-to">To page</label>
        <input id="p2i-to" type="number" inputmode="numeric" min="1" data-p2i-to />
      </div>
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="p2i-format">Format</label>
        <select id="p2i-format" data-p2i-format>
          <option value="image/png" selected>PNG (sharp)</option>
          <option value="image/jpeg">JPEG (smaller)</option>
        </select>
      </div>
      <div class="util-field">
        <label for="p2i-scale">Quality</label>
        <select id="p2i-scale" data-p2i-scale>
          <option value="1">1× (screen)</option>
          <option value="2" selected>2× (print)</option>
          <option value="3">3× (high)</option>
        </select>
      </div>
    </div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-p2i-run>Convert pages</button>
      <button class="util-btn" type="button" data-p2i-zip disabled>Download all (ZIP)</button>
      <button class="util-btn" type="button" data-p2i-all>All pages</button>
    </div>
    <p class="util-note" data-p2i-status>Choose a PDF to begin.</p>
    <div class="thumb-grid" data-p2i-thumbs></div>
  `;

  const fileEl = utilityBody.querySelector("[data-p2i-file]");
  const fromEl = utilityBody.querySelector("[data-p2i-from]");
  const toEl = utilityBody.querySelector("[data-p2i-to]");
  const formatEl = utilityBody.querySelector("[data-p2i-format]");
  const scaleEl = utilityBody.querySelector("[data-p2i-scale]");
  const statusEl = utilityBody.querySelector("[data-p2i-status]");
  const thumbsEl = utilityBody.querySelector("[data-p2i-thumbs]");
  const zipBtn = utilityBody.querySelector("[data-p2i-zip]");
  let pdfDoc = null;

  const P2I_KEY = "flip-watch-pdf2img";
  const savedP2I = readStored(P2I_KEY, null) || {};
  if (savedP2I.format) formatEl.value = savedP2I.format;
  if (savedP2I.scale) scaleEl.value = savedP2I.scale;
  [formatEl, scaleEl].forEach((el) =>
    el.addEventListener("change", () =>
      writeStored(P2I_KEY, { format: formatEl.value, scale: scaleEl.value })
    )
  );
  let results = [];

  fileEl.addEventListener("change", async () => {
    const file = fileEl.files[0];
    if (!file) return;
    statusEl.textContent = "Reading the PDF…";
    thumbsEl.innerHTML = "";
    results = [];
    zipBtn.disabled = true;
    try {
      const pdfjs = await import("./pdf-reader/vendor/pdf.js");
      pdfjs.GlobalWorkerOptions.workerSrc = "./pdf-reader/vendor/pdf.worker.js?v=2";
      const data = new Uint8Array(await file.arrayBuffer());
      pdfDoc = await pdfjs.getDocument({ data }).promise;
      fromEl.max = String(pdfDoc.numPages);
      toEl.max = String(pdfDoc.numPages);
      fromEl.value = "1";
      toEl.value = String(pdfDoc.numPages);
      statusEl.textContent = `${pdfDoc.numPages} ${pdfDoc.numPages === 1 ? "page" : "pages"} ready — press Convert.`;
    } catch (error) {
      pdfDoc = null;
      statusEl.textContent = `Could not open that PDF — ${error.message}`;
    }
  });

  const convert = async () => {
    if (!pdfDoc) {
      statusEl.textContent = "Choose a PDF first.";
      return;
    }
    const total = pdfDoc.numPages;
    const from = Math.max(1, Math.min(total, Math.floor(Number(fromEl.value) || 1)));
    const to = Math.max(from, Math.min(total, Math.floor(Number(toEl.value) || total)));
    const format = formatEl.value;
    const scale = Number(scaleEl.value);
    const extension = format === "image/png" ? "png" : "jpg";

    results.forEach((item) => URL.revokeObjectURL(item.url));
    results = [];
    thumbsEl.innerHTML = "";
    statusEl.textContent = `Converting ${to - from + 1} page(s)…`;

    for (let number = from; number <= to; number += 1) {
      statusEl.textContent = `Converting page ${number} of ${to}…`;
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      const page = await pdfDoc.getPage(number);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: context, viewport }).promise;

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, format, 0.92));
      const item = {
        name: `page-${String(number).padStart(3, "0")}.${extension}`,
        blob,
        url: URL.createObjectURL(blob),
        width: canvas.width,
        height: canvas.height,
      };
      results.push(item);

      const card = document.createElement("figure");
      card.className = "thumb-card";
      card.innerHTML = `<img alt="Page ${number}" src="${item.url}" /><figcaption>Page ${number}<span>${canvas.width}×${canvas.height}</span></figcaption>`;
      const link = document.createElement("a");
      link.href = item.url;
      link.download = item.name;
      link.className = "util-btn";
      link.textContent = "Save";
      card.append(link);
      thumbsEl.append(card);
    }

    zipBtn.disabled = results.length === 0;
    statusEl.textContent = `${results.length} page(s) converted · ${extension.toUpperCase()} · ${scale}×`;
  };

  utilityBody.querySelector("[data-p2i-run]").addEventListener("click", convert);
  utilityBody.querySelector("[data-p2i-all]").addEventListener("click", () => {
    if (!pdfDoc) {
      statusEl.textContent = "Choose a PDF first.";
      return;
    }
    fromEl.value = "1";
    toEl.value = String(pdfDoc.numPages);
    statusEl.textContent = `Whole document selected — ${pdfDoc.numPages} page(s).`;
  });

  zipBtn.addEventListener("click", async () => {
    if (!results.length) return;
    statusEl.textContent = "Building the ZIP…";
    const files = [];
    for (const item of results) {
      files.push({ name: item.name, data: new Uint8Array(await item.blob.arrayBuffer()) });
    }
    const zip = buildZip(files);
    const url = URL.createObjectURL(zip);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pdf-pages.zip";
    link.click();
    URL.revokeObjectURL(url);
    statusEl.textContent = `${results.length} images packed into pdf-pages.zip`;
  });
}

/* minimal store-only ZIP writer */
function buildZip(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;

  const push = (data) => {
    const bytes = typeof data === "string" ? encoder.encode(data) : data;
    chunks.push(bytes);
    offset += bytes.length;
  };

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let c = i;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c >>> 0;
    }
    return table;
  })();

  const crc32 = (bytes) => {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  };

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);
    const localOffset = offset;
    const header = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, file.data.length, true);
    view.setUint32(22, file.data.length, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);
    header.set(nameBytes, 30);
    push(header);
    push(file.data);
    central.push({ nameBytes, crc, size: file.data.length, localOffset });
  });

  const centralStart = offset;
  central.forEach((entry) => {
    const record = new Uint8Array(46 + entry.nameBytes.length);
    const view = new DataView(record.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint32(16, entry.crc, true);
    view.setUint32(20, entry.size, true);
    view.setUint32(24, entry.size, true);
    view.setUint16(28, entry.nameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, entry.localOffset, true);
    record.set(entry.nameBytes, 46);
    push(record);
  });

  const centralSize = offset - centralStart;
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, central.length, true);
  endView.setUint16(10, central.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralStart, true);
  push(end);

  return new Blob(chunks, { type: "application/zip" });
}

/* --------------------------------------------------- images → PDF */
function createPdfFromImages(pages) {
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let length = 0;

  const push = (data) => {
    const bytes = typeof data === "string" ? encoder.encode(data) : data;
    chunks.push(bytes);
    length += bytes.length;
    return length;
  };

  const binary = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]);
  push(binary);

  const object = (id, body, stream) => {
    offsets[id] = length;
    push(`${id} 0 obj\n${body}\n`);
    if (stream) {
      push("stream\n");
      push(stream);
      push("\nendstream\n");
    }
    push("endobj\n");
  };

  const pageCount = pages.length;
  const kids = pages.map((_, index) => `${3 + index * 3} 0 R`).join(" ");

  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, `<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`);

  pages.forEach((page, index) => {
    const pageId = 3 + index * 3;
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    const content = `q\n${page.drawWidth.toFixed(2)} 0 0 ${page.drawHeight.toFixed(2)} ${page.x.toFixed(2)} ${page.y.toFixed(2)} cm\n/Im0 Do\nQ\n`;

    object(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.pageWidth.toFixed(2)} ${page.pageHeight.toFixed(2)}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    object(contentId, `<< /Length ${encoder.encode(content).length} >>`, content);
    object(
      imageId,
      `<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.bytes.length} >>`,
      page.bytes
    );
  });

  const totalObjects = 2 + pageCount * 3;
  const xrefStart = length;
  let xref = `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= totalObjects; id += 1) {
    xref += `${String(offsets[id] || 0).padStart(10, "0")} 00000 n \n`;
  }
  push(xref);
  push(`trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`);

  return new Blob(chunks, { type: "application/pdf" });
}

function renderImagesToPdf() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="i2p-files">Images (JPG, PNG, WebP)</label>
      <input id="i2p-files" class="util-file" type="file" accept="image/*" multiple data-i2p-files />
    </div>
    <p class="util-note">Add images in the order you want them in the PDF. Drag and drop works too.</p>
    <div class="image-list" data-i2p-list></div>
    <div class="date-row">
      <div class="util-field">
        <label for="i2p-size">Page size</label>
        <select id="i2p-size" data-i2p-size>
          <option value="fit" selected>Fit to each image</option>
          <option value="a4p">A4 portrait</option>
          <option value="a4l">A4 landscape</option>
          <option value="letter">US Letter</option>
        </select>
      </div>
      <div class="util-field">
        <label for="i2p-margin">Margin (mm)</label>
        <input id="i2p-margin" type="number" inputmode="numeric" min="0" max="40" value="0" data-i2p-margin />
      </div>
    </div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-i2p-run disabled>Create PDF</button>
      <button class="util-btn" type="button" data-i2p-clear>Clear list</button>
    </div>
    <p class="util-note" data-i2p-status>Add at least one image.</p>
  `;

  const fileEl = utilityBody.querySelector("[data-i2p-files]");
  const listEl = utilityBody.querySelector("[data-i2p-list]");
  const sizeEl = utilityBody.querySelector("[data-i2p-size]");
  const marginEl = utilityBody.querySelector("[data-i2p-margin]");
  const statusEl = utilityBody.querySelector("[data-i2p-status]");
  const runBtn = utilityBody.querySelector("[data-i2p-run]");
  let items = [];

  const I2P_KEY = "flip-watch-img2pdf";
  const savedI2P = readStored(I2P_KEY, null) || {};
  if (savedI2P.size) sizeEl.value = savedI2P.size;
  if (savedI2P.margin !== undefined) marginEl.value = String(savedI2P.margin);
  [sizeEl, marginEl].forEach((el) =>
    el.addEventListener("input", () =>
      writeStored(I2P_KEY, { size: sizeEl.value, margin: marginEl.value })
    )
  );

  const paint = () => {
    listEl.innerHTML = "";
    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "image-row";
      row.innerHTML = `<img alt="${item.name}" src="${item.url}" /><span class="image-row__name">${item.name}</span>`;
      const actions = document.createElement("span");
      actions.className = "image-row__actions";
      const up = document.createElement("button");
      up.type = "button";
      up.textContent = "↑";
      up.setAttribute("aria-label", `Move ${item.name} up`);
      up.disabled = index === 0;
      up.addEventListener("click", () => {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        paint();
      });
      const down = document.createElement("button");
      down.type = "button";
      down.textContent = "↓";
      down.setAttribute("aria-label", `Move ${item.name} down`);
      down.disabled = index === items.length - 1;
      down.addEventListener("click", () => {
        [items[index + 1], items[index]] = [items[index], items[index + 1]];
        paint();
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove ${item.name}`);
      remove.addEventListener("click", () => {
        URL.revokeObjectURL(item.url);
        items = items.filter((entry) => entry !== item);
        paint();
      });
      actions.append(up, down, remove);
      row.append(actions);
      listEl.append(row);
    });
    runBtn.disabled = items.length === 0;
    if (!items.length) {
      statusEl.textContent = "Add at least one image.";
      return;
    }
    const totalBytes = items.reduce((sum, item) => sum + item.file.size, 0);
    statusEl.textContent = `${items.length} image(s) ready · about ${(totalBytes / 1024).toFixed(0)} KB → one ${items.length}-page PDF.`;
  };

  const addFiles = async (fileList) => {
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const image = await loadImageFile(file);
        items.push({ file, image, url: URL.createObjectURL(file), name: file.name });
      } catch (error) {
        statusEl.textContent = `Skipped ${file.name} — ${error.message}`;
      }
    }
    paint();
  };

  fileEl.addEventListener("change", async () => {
    await addFiles(fileEl.files);
    // Reset so the same file can be added twice in a row.
    fileEl.value = "";
  });

  const PAGE_SIZES = {
    a4p: [595.28, 841.89],
    a4l: [841.89, 595.28],
    letter: [612, 792],
  };

  runBtn.addEventListener("click", async () => {
    if (!items.length) return;
    statusEl.textContent = "Building the PDF…";
    const marginMm = Math.max(0, Math.min(40, Number(marginEl.value) || 0));
    const margin = (marginMm / 25.4) * 72;
    const pages = [];

    for (const item of items) {
      const canvas = document.createElement("canvas");
      canvas.width = item.image.naturalWidth;
      canvas.height = item.image.naturalHeight;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(item.image, 0, 0);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      const bytes = new Uint8Array(await blob.arrayBuffer());

      let pageWidth;
      let pageHeight;
      if (sizeEl.value === "fit") {
        pageWidth = canvas.width * 0.75 + margin * 2;
        pageHeight = canvas.height * 0.75 + margin * 2;
      } else {
        [pageWidth, pageHeight] = PAGE_SIZES[sizeEl.value];
      }

      const availableWidth = Math.max(1, pageWidth - margin * 2);
      const availableHeight = Math.max(1, pageHeight - margin * 2);
      const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
      const drawWidth = canvas.width * scale;
      const drawHeight = canvas.height * scale;

      pages.push({
        bytes,
        width: canvas.width,
        height: canvas.height,
        pageWidth,
        pageHeight,
        drawWidth,
        drawHeight,
        x: (pageWidth - drawWidth) / 2,
        y: (pageHeight - drawHeight) / 2,
      });
    }

    const pdf = createPdfFromImages(pages);
    const url = URL.createObjectURL(pdf);
    const link = document.createElement("a");
    link.href = url;
    link.download = "images.pdf";
    link.click();
    URL.revokeObjectURL(url);
    statusEl.textContent = `${pages.length} page PDF created (${(pdf.size / 1024).toFixed(0)} KB).`;
  });

  utilityBody.querySelector("[data-i2p-clear]").addEventListener("click", () => {
    items.forEach((item) => URL.revokeObjectURL(item.url));
    items = [];
    paint();
  });

  paint();
}

/* ---------------------------------------------- protect & unlock PDF */
const PDF_PAD = new Uint8Array([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
  0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
]);

function md5Bytes(input) {
  const r = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  const k = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ]);
  const bytes = Array.from(input);
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 0; i < 8; i += 1) bytes.push((bitLen >>> (8 * i)) & 0xff);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  for (let off = 0; off < bytes.length; off += 64) {
    const m = new Uint32Array(16);
    for (let i = 0; i < 16; i += 1) {
      m[i] = bytes[off + i * 4] | (bytes[off + i * 4 + 1] << 8) | (bytes[off + i * 4 + 2] << 16) | (bytes[off + i * 4 + 3] << 24);
    }
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i += 1) {
      let F, g;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }
      F = (F + A + k[i] + m[g]) >>> 0;
      A = D; D = C; C = B;
      B = (B + ((F << r[i]) | (F >>> (32 - r[i])))) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }
  const out = new Uint8Array(16);
  [a0, b0, c0, d0].forEach((word, i) => {
    out[i * 4] = word & 0xff;
    out[i * 4 + 1] = (word >>> 8) & 0xff;
    out[i * 4 + 2] = (word >>> 16) & 0xff;
    out[i * 4 + 3] = (word >>> 24) & 0xff;
  });
  return out;
}

function rc4(key, data) {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i += 1) s[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i += 1) {
    j = (j + s[i] + key[i % key.length]) & 0xff;
    const t = s[i]; s[i] = s[j]; s[j] = t;
  }
  const out = new Uint8Array(data.length);
  let i = 0;
  j = 0;
  for (let n = 0; n < data.length; n += 1) {
    i = (i + 1) & 0xff;
    j = (j + s[i]) & 0xff;
    const t = s[i]; s[i] = s[j]; s[j] = t;
    out[n] = data[n] ^ s[(s[i] + s[j]) & 0xff];
  }
  return out;
}

function padPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const out = new Uint8Array(32);
  const n = Math.min(32, bytes.length);
  out.set(bytes.subarray(0, n), 0);
  out.set(PDF_PAD.subarray(0, 32 - n), n);
  return out;
}

function concatBytes(...parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => { out.set(part, offset); offset += part.length; });
  return out;
}

function bytesToLatin1(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) out += String.fromCharCode(bytes[i]);
  return out;
}

function latin1ToBytes(text) {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) out[i] = text.charCodeAt(i) & 0xff;
  return out;
}

/* RC4-128 standard security handler (V2 / R3) */
function buildEncryption(pdfText, userPassword, ownerPassword) {
  const keyLength = 16;
  const permissions = -1;
  const idMatch = /\/ID\s*\[\s*<([0-9A-Fa-f]+)>/.exec(pdfText);
  const fileId = idMatch ? latin1ToBytes(idMatch[1].match(/.{1,2}/g).map((h) => String.fromCharCode(parseInt(h, 16))).join("")) : md5Bytes(new TextEncoder().encode(String(Date.now())));

  // Algorithm 3: owner entry
  let ownerKey = md5Bytes(padPassword(ownerPassword || userPassword));
  for (let i = 0; i < 50; i += 1) ownerKey = md5Bytes(ownerKey.slice(0, keyLength));
  let ownerEntry = rc4(ownerKey.slice(0, keyLength), padPassword(userPassword));
  for (let i = 1; i <= 19; i += 1) {
    const stepKey = new Uint8Array(keyLength);
    for (let b = 0; b < keyLength; b += 1) stepKey[b] = ownerKey[b] ^ i;
    ownerEntry = rc4(stepKey, ownerEntry);
  }

  // Algorithm 2: file key
  const pBytes = new Uint8Array(4);
  new DataView(pBytes.buffer).setInt32(0, permissions, true);
  let key = md5Bytes(concatBytes(padPassword(userPassword), ownerEntry, pBytes, fileId));
  for (let i = 0; i < 50; i += 1) key = md5Bytes(key.slice(0, keyLength));
  const fileKey = key.slice(0, keyLength);

  // Algorithms 4 + 5: user entry
  const uBase = md5Bytes(concatBytes(PDF_PAD, fileId));
  let userEntry = rc4(fileKey, uBase);
  for (let i = 1; i <= 19; i += 1) {
    const stepKey = new Uint8Array(keyLength);
    for (let b = 0; b < keyLength; b += 1) stepKey[b] = fileKey[b] ^ i;
    userEntry = rc4(stepKey, userEntry);
  }
  const userFull = new Uint8Array(32);
  userFull.set(userEntry, 0);
  userFull.set(PDF_PAD.subarray(0, 16), 16);

  return { fileKey, ownerEntry, userEntry: userFull, permissions, fileId, keyLength };
}

function objectKey(fileKey, num, gen) {
  const extra = new Uint8Array([num & 0xff, (num >> 8) & 0xff, (num >> 16) & 0xff, gen & 0xff, (gen >> 8) & 0xff]);
  return md5Bytes(concatBytes(fileKey, extra)).slice(0, Math.min(fileKey.length + 5, 16));
}

function encryptPdf(rawBytes, userPassword, ownerPassword) {
  const text = bytesToLatin1(rawBytes);
  if (!/^%PDF-/.test(text)) throw new Error("That file does not look like a PDF.");
  if (/\/Encrypt\s/.test(text)) throw new Error("This PDF is already encrypted.");

  const enc = buildEncryption(text, userPassword, ownerPassword);

  // Collect every "N G obj ... endobj" block and re-emit it encrypted.
  const objectRe = /(\d+)\s+(\d+)\s+obj([\s\S]*?)endobj/g;
  const objects = [];
  let match;
  while ((match = objectRe.exec(text)) !== null) {
    objects.push({ num: Number(match[1]), gen: Number(match[2]), body: match[3] });
  }
  if (!objects.length) throw new Error("Could not read the PDF structure.");

  const encryptedBodies = objects.map((obj) => {
    const key = objectKey(enc.fileKey, obj.num, obj.gen);
    let body = obj.body;
    // encrypt streams
    body = body.replace(/stream(\r\n|\r|\n)([\s\S]*?)endstream/g, (whole, nl, data) => {
      const bytes = rc4(key, latin1ToBytes(data));
      return `stream${nl}${bytesToLatin1(bytes)}endstream`;
    });
    // encrypt literal strings outside streams (best effort, skips already-encrypted streams)
    body = body.replace(/(\((?:\\.|[^\\()])*\))/g, (whole) => {
      const inner = whole.slice(1, -1);
      const bytes = rc4(key, latin1ToBytes(inner));
      const escaped = bytesToLatin1(bytes).replace(/[\\()]/g, (c) => `\\${c}`);
      return `(${escaped})`;
    });
    return { ...obj, body };
  });

  const encNum = objects.length + 1;
  const hex = (bytes) => Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const encDict = `<< /Filter /Standard /V 2 /R 3 /Length 128 /P ${enc.permissions} /O <${hex(enc.ownerEntry)}> /U <${hex(enc.userEntry)}> >>`;

  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let size = 0;
  const push = (value) => {
    const bytes = typeof value === "string" ? encoder.encode(value) : value;
    chunks.push(bytes);
    size += bytes.length;
  };

  push("%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n");
  encryptedBodies.forEach((obj) => {
    offsets[obj.num] = size;
    push(`${obj.num} ${obj.gen} obj${obj.body}endobj\n`);
  });
  offsets[encNum] = size;
  push(`${encNum} 0 obj\n${encDict}\nendobj\n`);

  const maxObj = encNum;
  const xrefStart = size;
  let xref = `xref\n0 ${maxObj + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= maxObj; id += 1) {
    xref += `${String(offsets[id] || 0).padStart(10, "0")} 00000 n \n`;
  }
  push(xref);
  push(`trailer\n<< /Size ${maxObj + 1} /Root ${/\/Root\s+(\d+)\s+\d+\s+R/.exec(text)?.[1] || 1} 0 R /Encrypt ${encNum} 0 R /ID [<${hex(enc.fileId)}> <${hex(enc.fileId)}>] >>\nstartxref\n${xrefStart}\n%%EOF\n`);

  return new Blob(chunks, { type: "application/pdf" });
}

function renderProtectPdf() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="prot-file">PDF file</label>
      <input id="prot-file" class="util-file" type="file" accept="application/pdf" data-prot-file />
    </div>
    <div class="util-field">
      <label for="prot-mode">What do you want to do?</label>
      <select id="prot-mode" data-prot-mode>
        <option value="lock" selected>Protect with a password</option>
        <option value="unlock">Unlock a protected PDF</option>
      </select>
    </div>
    <div data-prot-lock>
      <div class="date-row">
        <div class="util-field">
          <label for="prot-user">Open password</label>
          <input id="prot-user" type="password" autocomplete="new-password" placeholder="required to open" data-prot-user />
        </div>
        <div class="util-field">
          <label for="prot-owner">Owner password (optional)</label>
          <input id="prot-owner" type="password" autocomplete="new-password" placeholder="defaults to the open password" data-prot-owner />
        </div>
      </div>
    </div>
    <div class="util-field" data-prot-unlock hidden>
      <label for="prot-pass">Password of the PDF</label>
      <div class="pw-output">
        <input id="prot-pass" type="password" autocomplete="off" placeholder="the password it was locked with" data-prot-pass />
        <button type="button" data-prot-reveal aria-pressed="false">Show</button>
      </div>
    </div>
    <div class="date-row" data-prot-range hidden>
      <div class="util-field">
        <label for="prot-from">From page</label>
        <input id="prot-from" type="number" inputmode="numeric" min="1" value="1" data-prot-from />
      </div>
      <div class="util-field">
        <label for="prot-to">To page</label>
        <input id="prot-to" type="number" inputmode="numeric" min="1" data-prot-to />
      </div>
    </div>
    <div class="util-field" data-prot-quality-wrap hidden>
      <label for="prot-quality">Image quality</label>
      <select id="prot-quality" data-prot-quality>
        <option value="0.8">Smaller file</option>
        <option value="0.92" selected>Balanced</option>
        <option value="1">Sharpest</option>
      </select>
    </div>
    <div class="meter" data-prot-meter-wrap hidden aria-hidden="true"><span data-prot-meter></span></div>
    <p class="util-note" data-prot-warning hidden>There is no way to recover a lost password — store it safely.</p>
    <div class="util-field" data-prot-filename-wrap>
      <label for="prot-name">Save as</label>
      <input id="prot-name" type="text" data-prot-name placeholder="unlocked.pdf" />
    </div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-prot-run disabled>Protect PDF</button>
    </div>
    <p class="util-note" data-prot-status>Choose a PDF to begin.</p>
    <p class="util-note" data-prot-info></p>
  `;

  const fileEl = utilityBody.querySelector("[data-prot-file]");
  const modeEl = utilityBody.querySelector("[data-prot-mode]");
  const lockWrap = utilityBody.querySelector("[data-prot-lock]");
  const unlockWrap = utilityBody.querySelector("[data-prot-unlock]");
  const userEl = utilityBody.querySelector("[data-prot-user]");
  const ownerEl = utilityBody.querySelector("[data-prot-owner]");
  const passEl = utilityBody.querySelector("[data-prot-pass]");
  const runBtn = utilityBody.querySelector("[data-prot-run]");
  const statusEl = utilityBody.querySelector("[data-prot-status]");
  const infoEl = utilityBody.querySelector("[data-prot-info]");
  const revealBtn = utilityBody.querySelector("[data-prot-reveal]");
  const nameEl = utilityBody.querySelector("[data-prot-name]");
  let fileBytes = null;
  let baseName = "document";

  revealBtn.addEventListener("click", () => {
    const shown = passEl.type === "text";
    passEl.type = shown ? "password" : "text";
    revealBtn.textContent = shown ? "Show" : "Hide";
    revealBtn.setAttribute("aria-pressed", String(!shown));
  });

  const PROT_KEY = "flip-watch-protect-mode";
  const savedProt = readStored(PROT_KEY, null) || {};
  if (savedProt.mode === "unlock") {
    modeEl.value = "unlock";
    modeEl.dispatchEvent(new Event("change"));
  }

  modeEl.addEventListener("change", () => {
    writeStored(PROT_KEY, { mode: modeEl.value });
    if (fileBytes) nameEl.value = modeEl.value === "unlock" ? `${baseName}-unlocked.pdf` : `${baseName}-protected.pdf`;
    const lock = modeEl.value === "lock";
    lockWrap.hidden = !lock;
    unlockWrap.hidden = lock;
    utilityBody.querySelector("[data-prot-range]").hidden = lock;
    utilityBody.querySelector("[data-prot-quality-wrap]").hidden = lock;
    utilityBody.querySelector("[data-prot-warning]").hidden = !lock;
    utilityBody.querySelector("[data-prot-meter-wrap]").hidden = lock;
    runBtn.textContent = lock ? "Protect PDF" : "Unlock PDF";
    statusEl.textContent = lock ? "Set a password, then protect." : "Enter the PDF's password to unlock it.";
  });

  // apply the initial mode so the right controls and warning show on open
  modeEl.dispatchEvent(new Event("change"));

  fileEl.addEventListener("change", async () => {
    const file = fileEl.files[0];
    if (!file) return;
    fileBytes = new Uint8Array(await file.arrayBuffer());
    baseName = file.name.replace(/\.pdf$/i, "") || "document";
    nameEl.value = modeEl.value === "unlock" ? `${baseName}-unlocked.pdf` : `${baseName}-protected.pdf`;
    runBtn.disabled = false;
    const latin1 = bytesToLatin1(fileBytes.slice(0, Math.min(fileBytes.length, 400000)));
    const encrypted = /\/Encrypt\s*\d/.test(latin1);
    statusEl.textContent = `${file.name} · ${(file.size / 1024).toFixed(0)} KB${encrypted ? " · password-protected" : ""}`;
    infoEl.textContent = encrypted
      ? "This PDF is already locked — use Unlock with its password."
      : "This PDF has no password — you can unlock it only if it is locked.";
  });

  const download = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  runBtn.addEventListener("click", async () => {
    if (!fileBytes) {
      statusEl.textContent = "Choose a PDF first.";
      return;
    }
    try {
      if (modeEl.value === "lock") {
        // Encryption needs a verified PDF security handler; we refuse to emit a
        // file we cannot prove opens, so this path stays disabled for now.
        statusEl.textContent =
          "Password protection is not available yet — it needs a verified PDF encryption library. Unlocking works today.";
        return;
      }
      {
        const password = passEl.value;
        statusEl.textContent = "Checking the password…";
        const pdfjs = await import("./pdf-reader/vendor/pdf.js");
        pdfjs.GlobalWorkerOptions.workerSrc = "./pdf-reader/vendor/pdf.worker.js?v=2";
        const doc = await pdfjs.getDocument({ data: fileBytes.slice(0), password }).promise;
        const fromEl = utilityBody.querySelector("[data-prot-from]");
        const toEl = utilityBody.querySelector("[data-prot-to]");
        fromEl.max = String(doc.numPages);
        toEl.max = String(doc.numPages);
        if (!toEl.value || Number(toEl.value) > doc.numPages) toEl.value = String(doc.numPages);
        const first = Math.max(1, Math.min(doc.numPages, Math.floor(Number(fromEl.value) || 1)));
        const last = Math.max(first, Math.min(doc.numPages, Math.floor(Number(toEl.value) || doc.numPages)));
        const quality = Number(utilityBody.querySelector("[data-prot-quality]").value) || 0.92;
        const meter = utilityBody.querySelector("[data-prot-meter]");
        const pages = [];
        for (let n = first; n <= last; n += 1) {
          statusEl.textContent = `Unlocking page ${n} of ${last}…`;
          meter.style.width = `${Math.round(((n - first) / (last - first + 1)) * 100)}%`;
          const page = await doc.getPage(n);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
          pages.push({
            bytes: new Uint8Array(await blob.arrayBuffer()),
            width: canvas.width,
            height: canvas.height,
            pageWidth: canvas.width * 0.75,
            pageHeight: canvas.height * 0.75,
            drawWidth: canvas.width * 0.75,
            drawHeight: canvas.height * 0.75,
            x: 0,
            y: 0,
          });
        }
        const pdf = createPdfFromImages(pages);
        download(pdf, nameEl.value.trim() || `${baseName}-unlocked.pdf`);
        meter.style.width = "100%";
        statusEl.textContent = `Unlocked ${pages.length} page(s)${first > 1 || last < doc.numPages ? ` (pages ${first}–${last})` : ""}. Text is now part of the page images.`;
      }
    } catch (error) {
      const message = String(error && error.message ? error.message : error);
      statusEl.textContent = /password/i.test(message)
        ? "That password is not correct for this PDF."
        : `Could not finish — ${message}`;
    }
  });
}

/* ------------------------------------------------------- HTML → PDF */
function renderHtmlToPdf() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="h2p-html">HTML source</label>
      <textarea id="h2p-html" class="util-textarea util-textarea--code" data-h2p-html spellcheck="false" placeholder="&lt;h1&gt;Invoice&lt;/h1&gt;&lt;p&gt;Paste any HTML here…&lt;/p&gt;"></textarea>
    </div>
    <div class="util-field">
      <label for="h2p-file">…or load an .html file</label>
      <input id="h2p-file" class="util-file" type="file" accept=".html,.htm,text/html" data-h2p-file />
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="h2p-size">Page size</label>
        <select id="h2p-size" data-h2p-size>
          <option value="A4" selected>A4</option>
          <option value="Letter">US Letter</option>
          <option value="A5">A5</option>
        </select>
      </div>
      <div class="util-field">
        <label for="h2p-orient">Orientation</label>
        <select id="h2p-orient" data-h2p-orient>
          <option value="portrait" selected>Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="h2p-margin">Margin (mm)</label>
        <input id="h2p-margin" type="number" inputmode="numeric" min="0" max="40" value="12" data-h2p-margin />
      </div>
      <div class="util-field">
        <label for="h2p-width">Render width (px)</label>
        <input id="h2p-width" type="number" inputmode="numeric" min="320" max="1600" step="20" value="900" data-h2p-width />
      </div>
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="h2p-quality">Image quality</label>
        <select id="h2p-quality" data-h2p-quality>
          <option value="0.8">Smaller file</option>
          <option value="0.92" selected>Balanced</option>
          <option value="1">Sharpest</option>
        </select>
      </div>
      <div class="util-field">
        <label>Estimated pages</label>
        <input type="text" readonly data-h2p-pages value="—" />
      </div>
    </div>
    <div class="util-toggles">
      <label><input type="checkbox" data-h2p-long /> One long page (image PDF)</label>
    </div>
    <div class="util-field">
      <label for="h2p-name">Save as</label>
      <input id="h2p-name" type="text" value="html-to-pdf.pdf" data-h2p-name />
    </div>
    <div class="util-actions">
      <button class="util-btn" type="button" data-h2p-sample>Sample HTML</button>
      <button class="util-btn" type="button" data-h2p-paste>Paste from clipboard</button>
      <button class="util-btn" type="button" data-h2p-reset>Reset settings</button>
      <button class="util-btn" type="button" data-h2p-clear>Clear</button>
    </div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-h2p-print disabled>Open print view</button>
      <button class="util-btn" type="button" data-h2p-image disabled>Download image PDF</button>
    </div>
    <p class="util-note" data-h2p-status>Paste HTML, then choose print view (real text) or an image PDF.</p>
    <div class="util-field">
      <label>Live preview</label>
      <iframe class="h2p-preview" data-h2p-preview sandbox="" title="HTML preview"></iframe>
    </div>
  `;

  const htmlEl = utilityBody.querySelector("[data-h2p-html]");
  const fileEl = utilityBody.querySelector("[data-h2p-file]");
  const sizeEl = utilityBody.querySelector("[data-h2p-size]");
  const orientEl = utilityBody.querySelector("[data-h2p-orient]");
  const marginEl = utilityBody.querySelector("[data-h2p-margin]");
  const widthEl = utilityBody.querySelector("[data-h2p-width]");
  const longEl = utilityBody.querySelector("[data-h2p-long]");
  const statusEl = utilityBody.querySelector("[data-h2p-status]");

  const nameEl = utilityBody.querySelector("[data-h2p-name]");
  const previewEl = utilityBody.querySelector("[data-h2p-preview]");
  const printBtn = utilityBody.querySelector("[data-h2p-print]");
  const imageBtn = utilityBody.querySelector("[data-h2p-image]");

  const H2P_KEY = "flip-watch-html2pdf";
  const savedH2P = readStored(H2P_KEY, null) || {};
  if (savedH2P.size) sizeEl.value = savedH2P.size;
  if (savedH2P.orient) orientEl.value = savedH2P.orient;
  if (savedH2P.margin !== undefined) marginEl.value = String(savedH2P.margin);
  if (savedH2P.width) widthEl.value = String(savedH2P.width);

  const persist = () =>
    writeStored(H2P_KEY, { size: sizeEl.value, orient: orientEl.value, margin: marginEl.value, width: widthEl.value });

  let previewTimer = 0;
  const syncPreview = () => {
    const html = htmlEl.value.trim();
    const empty = html === "";
    printBtn.disabled = empty;
    imageBtn.disabled = empty;
    const pagesOut = utilityBody.querySelector("[data-h2p-pages]");
    const mm = Number(marginEl.value) || 0;
    const pageH = sizeEl.value === "Letter" ? 792 : 595 * 1.414;
    const usable = (orientEl.value === "landscape" ? 595 : pageH) - ((mm / 25.4) * 72) * 2;
    const est = longEl.checked ? 1 : Math.max(1, Math.ceil((Math.max(200, previewEl.clientHeight || 800) * (900 / Math.max(320, Number(widthEl.value) || 900))) / Math.max(60, usable)));
    if (pagesOut) pagesOut.value = empty ? "—" : `≈ ${est}`;
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => {
      previewEl.srcdoc = empty
        ? "<body style=\"font:14px system-ui;color:#8b90a8;padding:16px\">Preview appears here.</body>"
        : `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:14px;font:15px/1.5 system-ui,sans-serif;color:#111;background:#fff}img,svg,table{max-width:100%}</style></head><body>${html}</body></html>`;
    }, 300);
  };

  [sizeEl, orientEl, marginEl, widthEl].forEach((el) => el.addEventListener("input", persist));
  htmlEl.addEventListener("input", syncPreview);
  syncPreview();

  utilityBody.querySelector("[data-h2p-sample]").addEventListener("click", () => {
    htmlEl.value = `<h1 style="color:#6c5ce7;margin:0 0 8px">Invoice #1042</h1>
<p style="color:#555">Flip Watch · 26 November 2026</p>
<table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
  <tr><th align="left">Item</th><th align="right">Amount</th></tr>
  <tr><td>Stopwatch Pro licence</td><td align="right">₹499</td></tr>
  <tr><td>PDF toolkit</td><td align="right">₹299</td></tr>
  <tr><td><strong>Total</strong></td><td align="right"><strong>₹798</strong></td></tr>
</table>
<p style="color:#777;font-size:13px">Thank you for your purchase.</p>`;
    syncPreview();
    statusEl.textContent = "Sample HTML loaded — try the print view.";
  });

  utilityBody.querySelector("[data-h2p-paste]").addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        statusEl.textContent = "Your clipboard is empty.";
        return;
      }
      htmlEl.value = text;
      syncPreview();
      statusEl.textContent = "Pasted from the clipboard.";
    } catch (error) {
      statusEl.textContent = "The browser blocked clipboard access — paste with Ctrl+V instead.";
    }
  });

  utilityBody.querySelector("[data-h2p-reset]").addEventListener("click", () => {
    sizeEl.value = "A4";
    orientEl.value = "portrait";
    marginEl.value = "12";
    widthEl.value = "900";
    longEl.checked = false;
    persist();
    statusEl.textContent = "Settings reset to defaults.";
  });

  utilityBody.querySelector("[data-h2p-clear]").addEventListener("click", () => {
    htmlEl.value = "";
    syncPreview();
    statusEl.textContent = "Cleared.";
    htmlEl.focus();
  });

  fileEl.addEventListener("change", async () => {
    const file = fileEl.files[0];
    if (!file) return;
    htmlEl.value = await file.text();
    nameEl.value = `${file.name.replace(/\.html?$/i, "") || "page"}.pdf`;
    syncPreview();
    statusEl.textContent = `${file.name} loaded · ${htmlEl.value.length} characters`;
  });

  const pageCss = () =>
    `@page { size: ${sizeEl.value} ${orientEl.value}; margin: ${Number(marginEl.value) || 0}mm; }
     body { margin: 0; padding: ${Number(marginEl.value) || 0}mm; font: 16px/1.5 system-ui, sans-serif; color: #111; background: #fff; }
     img, svg, table { max-width: 100%; }`;

  utilityBody.querySelector("[data-h2p-print]").addEventListener("click", () => {
    const html = htmlEl.value.trim();
    if (!html) {
      statusEl.textContent = "Paste some HTML first.";
      return;
    }
    const win = window.open("", "_blank");
    if (!win) {
      statusEl.textContent = "Allow pop-ups for this site to open the print view.";
      return;
    }
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>HTML to PDF</title><style>${pageCss()}</style></head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    window.setTimeout(() => win.print(), 350);
    statusEl.textContent = "Print view opened — choose “Save as PDF” in the print dialog.";
  });

  utilityBody.querySelector("[data-h2p-image]").addEventListener("click", async () => {
    const html = htmlEl.value.trim();
    if (!html) {
      statusEl.textContent = "Paste some HTML first.";
      return;
    }
    statusEl.textContent = "Rendering…";
    const width = Math.max(320, Math.min(1600, Math.round(Number(widthEl.value) || 900)));
    try {
      const frame = document.createElement("iframe");
      frame.style.cssText = `position:fixed;left:-9999px;top:0;width:${width}px;height:10px;border:0;`;
      document.body.append(frame);
      const doc = frame.contentDocument;
      doc.open();
      doc.write(`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px;font:16px/1.5 system-ui,sans-serif;color:#111;background:#fff}img,svg,table{max-width:100%}</style></head><body>${html}</body></html>`);
      doc.close();
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      const height = Math.max(200, Math.ceil(frame.contentDocument.body.scrollHeight));
      frame.style.height = `${height}px`;

      const serialized = new XMLSerializer().serializeToString(frame.contentDocument.documentElement);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${serialized}</foreignObject></svg>`;
      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("Could not rasterise that HTML."));
      });

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0);

      const isLong = longEl.checked;
      const ratio = sizeEl.value === "Letter" ? 1.294 : sizeEl.value === "A5" ? 1.414 : 1.414;
      const pageWidth = orientEl.value === "landscape" ? 842 : 595;
      const pageHeight = Math.round(pageWidth * ratio);
      const margin = ((Number(marginEl.value) || 0) / 25.4) * 72;

      const pages = [];
      const usableHeight = pageHeight - margin * 2;
      const scale = (pageWidth - margin * 2) / width;

      if (isLong) {
        const sliceHeight = height;
        pages.push({ canvas, sx: 0, sy: 0, sw: width, sh: sliceHeight });
      } else {
        const sliceHeight = Math.max(1, Math.floor(usableHeight / scale));
        for (let y = 0; y < height; y += sliceHeight) {
          pages.push({ canvas, sx: 0, sy: y, sw: width, sh: Math.min(sliceHeight, height - y) });
        }
      }

      const pdfPages = [];
      for (const slice of pages) {
        const piece = document.createElement("canvas");
        piece.width = Math.round(slice.sw * scale);
        piece.height = Math.round(slice.sh * scale);
        const pctx = piece.getContext("2d");
        pctx.fillStyle = "#ffffff";
        pctx.fillRect(0, 0, piece.width, piece.height);
        pctx.drawImage(slice.canvas, slice.sx, slice.sy, slice.sw, slice.sh, 0, 0, piece.width, piece.height);
        const blob = await new Promise((r) => piece.toBlob(r, "image/jpeg", Number(utilityBody.querySelector("[data-h2p-quality]").value) || 0.92));
        pdfPages.push({
          bytes: new Uint8Array(await blob.arrayBuffer()),
          width: piece.width,
          height: piece.height,
          pageWidth: isLong ? piece.width * 0.75 + margin * 2 : pageWidth,
          pageHeight: isLong ? piece.height * 0.75 + margin * 2 : pageHeight,
          drawWidth: isLong ? piece.width * 0.75 : pageWidth - margin * 2,
          drawHeight: isLong ? piece.height * 0.75 : (pageHeight - margin * 2),
          x: margin,
          y: margin,
        });
      }

      const pdf = createPdfFromImages(pdfPages);
      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = nameEl.value.trim() || "html-to-pdf.pdf";
      link.click();
      URL.revokeObjectURL(url);
      frame.remove();
      statusEl.textContent = `${pdfPages.length} page image PDF created (${(pdf.size / 1024).toFixed(0)} KB).`;
    } catch (error) {
      statusEl.textContent = `Could not render — ${error.message}. Try the print view instead.`;
    }
  });
}

/* ------------------------------------------------ PDF watermark tool */
function renderPdfWatermark() {
  utilityBody.innerHTML = `
    <div class="util-field">
      <label for="wm-file">PDF file</label>
      <input id="wm-file" class="util-file" type="file" accept="application/pdf" data-wm-file />
    </div>
    <div class="util-field">
      <label for="wm-mode">What do you want to do?</label>
      <select id="wm-mode" data-wm-mode>
        <option value="apply" selected>Apply a watermark</option>
        <option value="remove">Remove a watermark (erase an area)</option>
      </select>
    </div>
    <div data-wm-apply>
      <div class="util-field">
        <label for="wm-text">Watermark text</label>
        <input id="wm-text" type="text" value="CONFIDENTIAL" data-wm-text />
      </div>
      <div class="date-row">
        <div class="util-field">
          <label for="wm-size">Font size: <output data-wm-size-out>64</output></label>
          <input id="wm-size" type="range" min="16" max="160" value="64" data-wm-size />
        </div>
        <div class="util-field">
          <label for="wm-opacity">Opacity: <output data-wm-opacity-out>18</output>%</label>
          <input id="wm-opacity" type="range" min="4" max="100" value="18" data-wm-opacity />
        </div>
      </div>
      <div class="date-row">
        <div class="util-field">
          <label for="wm-angle">Angle: <output data-wm-angle-out>-30</output>°</label>
          <input id="wm-angle" type="range" min="-90" max="90" value="-30" data-wm-angle />
        </div>
        <div class="util-field">
          <label for="wm-colour">Colour</label>
          <input id="wm-colour" type="color" value="#ff3b30" data-wm-colour />
        </div>
      </div>
      <div class="util-field">
        <label for="wm-layout">Layout</label>
        <select id="wm-layout" data-wm-layout>
          <option value="center" selected>One in the centre</option>
          <option value="tile">Tiled across the page</option>
          <option value="corner">Bottom-right corner</option>
          <option value="diag">Diagonal band across the page</option>
        </select>
      </div>
    </div>
    <div data-wm-remove hidden>
      <div class="util-actions">
        <button class="control-button primary" type="button" data-wm-detect disabled>Detect watermark</button>
      </div>
      <p class="util-note" data-wm-detect-note>Detection compares every page: anything that appears in the same place on most pages is treated as a watermark.</p>
      <div class="util-field">
        <label for="wm-area">Or mark the area yourself</label>
        <select id="wm-area" data-wm-area>
          <option value="auto" selected>Use the detected watermark</option>
          <option value="center">Centre band</option>
          <option value="top">Top area</option>
          <option value="bottom">Bottom area</option>
          <option value="custom">Draw it on the preview</option>
        </select>
      </div>
      <p class="util-note">Red area = what will be erased. Drag on the preview to mark an area yourself.</p>
    </div>
    <div class="date-row">
      <div class="util-field">
        <label for="wm-from">From page</label>
        <input id="wm-from" type="number" inputmode="numeric" min="1" value="1" data-wm-from />
      </div>
      <div class="util-field">
        <label for="wm-to">To page</label>
        <input id="wm-to" type="number" inputmode="numeric" min="1" data-wm-to />
      </div>
    </div>
    <div class="util-actions">
      <button class="control-button primary" type="button" data-wm-run disabled>Apply to PDF</button>
      <button class="util-btn" type="button" data-wm-all>All pages</button>
      <button class="util-btn" type="button" data-wm-reset>Reset options</button>
    </div>
    <p class="util-note" data-wm-status>Choose a PDF to begin.</p>
    <p class="util-note">The output keeps the original page size, but pages are re-rendered as images, so text stops being selectable.</p>
    <div class="meter" hidden data-wm-meter-wrap aria-hidden="true"><span data-wm-meter></span></div>
    <div class="util-actions" data-wm-nav hidden>
      <button class="util-btn" type="button" data-wm-prev>‹ Previous</button>
      <span class="util-note" data-wm-page-label>Page 1</span>
      <button class="util-btn" type="button" data-wm-next>Next ›</button>
    </div>
    <div class="img-stage" data-wm-stage hidden><canvas class="img-canvas" data-wm-canvas></canvas></div>
    <div class="util-actions" data-wm-result hidden>
      <button class="control-button primary" type="button" data-wm-download>Download PDF</button>
      <span class="util-note" data-wm-result-note></span>
    </div>
    <div data-wm-review hidden>
      <p class="util-note" data-wm-review-note>Before and after — check that only the watermark changed.</p>
      <div class="wm-review">
        <figure class="wm-review__item"><figcaption>Before</figcaption><canvas data-wm-before></canvas></figure>
        <figure class="wm-review__item"><figcaption>After</figcaption><canvas data-wm-after></canvas></figure>
      </div>
      <div class="util-actions">
        <button class="util-btn" type="button" data-wm-rprev>‹ Previous</button>
        <span class="util-note" data-wm-rlabel>Page 1</span>
        <button class="util-btn" type="button" data-wm-rnext>Next ›</button>
        <button class="util-btn" type="button" data-wm-diff>Show difference</button>
      </div>
    </div>
  `;

  const fileEl = utilityBody.querySelector("[data-wm-file]");
  const modeEl = utilityBody.querySelector("[data-wm-mode]");
  const applyWrap = utilityBody.querySelector("[data-wm-apply]");
  const removeWrap = utilityBody.querySelector("[data-wm-remove]");
  const textEl = utilityBody.querySelector("[data-wm-text]");
  const sizeEl = utilityBody.querySelector("[data-wm-size]");
  const sizeOut = utilityBody.querySelector("[data-wm-size-out]");
  const opacityEl = utilityBody.querySelector("[data-wm-opacity]");
  const opacityOut = utilityBody.querySelector("[data-wm-opacity-out]");
  const angleEl = utilityBody.querySelector("[data-wm-angle]");
  const angleOut = utilityBody.querySelector("[data-wm-angle-out]");
  const colourEl = utilityBody.querySelector("[data-wm-colour]");
  const layoutEl = utilityBody.querySelector("[data-wm-layout]");
  const areaEl = utilityBody.querySelector("[data-wm-area]");
  const fromEl = utilityBody.querySelector("[data-wm-from]");
  const toEl = utilityBody.querySelector("[data-wm-to]");
  const runBtn = utilityBody.querySelector("[data-wm-run]");
  const resetBtn = utilityBody.querySelector("[data-wm-reset]");
  const statusEl = utilityBody.querySelector("[data-wm-status]");
  const meterWrap = utilityBody.querySelector("[data-wm-meter-wrap]");
  const meter = utilityBody.querySelector("[data-wm-meter]");
  const stage = utilityBody.querySelector("[data-wm-stage]");
  const canvas = utilityBody.querySelector("[data-wm-canvas]");

  let pdfDoc = null;
  let firstPageCanvas = null;
  let customRect = null;
  let dragging = null;
  let previewPage = 1;
  let maskInfo = null;      // { mask, w, h, coverage }
  let resultBlob = null;
  let reviewPages = [];
  let reviewIndex = 0;
  let showDiff = false;
  const reviewWrap = utilityBody.querySelector("[data-wm-review]");
  const reviewNote = utilityBody.querySelector("[data-wm-review-note]");
  const reviewLabel = utilityBody.querySelector("[data-wm-rlabel]");
  const beforeCanvas = utilityBody.querySelector("[data-wm-before]");
  const afterCanvas = utilityBody.querySelector("[data-wm-after]");
  const navWrap = utilityBody.querySelector("[data-wm-nav]");
  const pageLabel = utilityBody.querySelector("[data-wm-page-label]");
  const resultWrap = utilityBody.querySelector("[data-wm-result]");
  const resultNote = utilityBody.querySelector("[data-wm-result-note]");
  const detectBtn = utilityBody.querySelector("[data-wm-detect]");
  const detectNote = utilityBody.querySelector("[data-wm-detect-note]");

  const readOptions = () => ({
    mode: modeEl.value,
    text: textEl.value || "WATERMARK",
    size: Number(sizeEl.value),
    opacity: Number(opacityEl.value) / 100,
    angle: (Number(angleEl.value) * Math.PI) / 180,
    colour: colourEl.value,
    layout: layoutEl.value,
    area: areaEl.value,
  });

  const paintWatermark = (ctx, width, height, options) => {
    // Font size is authored against the preview canvas, so scale it to whatever
    // canvas we are drawing on. Long text shrinks until it fits the page.
    const factor = options.scaleFactor || 1;
    let size = options.size * factor;
    const fontOf = (value) => `800 ${Math.max(8, Math.round(value))}px system-ui, -apple-system, Segoe UI, sans-serif`;
    ctx.save();
    ctx.globalAlpha = options.opacity;
    ctx.fillStyle = options.colour;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = fontOf(size);
    while (ctx.measureText(options.text).width > width * 0.92 && size > 10) {
      size *= 0.92;
      ctx.font = fontOf(size);
    }

    const draw = (x, y, angle) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(options.text, 0, 0);
      ctx.restore();
    };

    if (options.layout === "center") {
      draw(width / 2, height / 2, options.angle);
    } else if (options.layout === "corner") {
      ctx.font = `700 ${Math.max(8, Math.round(size * 0.45))}px system-ui, sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      draw(width - 24, height - 24, 0);
    } else if (options.layout === "diag") {
      const step = size * 2.4;
      ctx.font = fontOf(size * 0.7);
      for (let i = -Math.ceil(height / step); i <= Math.ceil(height / step); i += 1) {
        draw(width / 2, height / 2 + i * step, options.angle);
      }
    } else {
      const stepX = size * 4.5;
      const stepY = size * 2.6;
      for (let y = stepY / 2; y < height + stepY; y += stepY) {
        for (let x = stepX / 2; x < width + stepX; x += stepX) {
          draw(x, y, options.angle);
        }
      }
    }
    ctx.restore();
  };

  const removeRect = (width, height, options) => {
    if (options.area === "custom" && customRect) {
      return {
        x: customRect.x * width,
        y: customRect.y * height,
        w: customRect.w * width,
        h: customRect.h * height,
      };
    }
    if (options.area === "top") return { x: 0, y: 0, w: width, h: height * 0.22 };
    if (options.area === "bottom") return { x: 0, y: height * 0.78, w: width, h: height * 0.22 };
    return { x: 0, y: height * 0.34, w: width, h: height * 0.32 };
  };

  const renderPageToCanvas = async (number, scale) => {
    const page = await pdfDoc.getPage(number);
    const viewport = page.getViewport({ scale });
    const out = document.createElement("canvas");
    out.width = Math.round(viewport.width);
    out.height = Math.round(viewport.height);
    const ctx = out.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    return out;
  };

  // Watermark detection: render a sample of pages and keep the pixels that are
  // non-background in the same place on most of them. Ordinary content moves
  // between pages, a stamp does not.
  const detectWatermark = async () => {
    if (!pdfDoc) return null;
    const sample = Math.min(pdfDoc.numPages, 10);
    const scale = 0.6;
    const first = await renderPageToCanvas(1, scale);
    const w = first.width;
    const h = first.height;
    const counts = new Uint16Array(w * h);
    let used = 0;
    for (let n = 1; n <= sample; n += 1) {
      const page = n === 1 ? first : await renderPageToCanvas(n, scale);
      if (page.width !== w || page.height !== h) continue;
      const data = page.getContext("2d").getImageData(0, 0, w, h).data;
      for (let i = 0, p = 0; p < w * h; i += 4, p += 1) {
        // Only "light ink" (faint stamps). Dark text and borders are ignored,
        // otherwise repeated page furniture looks like a watermark.
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (avg > 120 && avg < 232) counts[p] += 1;
      }
      used += 1;
    }
    if (!used) return null;
    const need = Math.max(2, Math.ceil(used * 0.85));
    const mask = new Uint8Array(w * h);
    let hits = 0;
    for (let p = 0; p < w * h; p += 1) {
      if (counts[p] >= need) { mask[p] = 1; hits += 1; }
    }
    // grow the mask by one pixel so anti-aliased edges go too
    const grown = new Uint8Array(w * h);
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const p = y * w + x;
        if (!mask[p]) continue;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < w && ny < h) grown[ny * w + nx] = 1;
          }
        }
      }
    }
    return { mask: grown, w, h, coverage: (hits / (w * h)) * 100, pages: used };
  };

  // Only inside the drawn box: keep what differs between pages (text) and mark
  // what repeats on almost every page (the watermark).
  const buildRegionMask = async (rect) => {
    const sample = Math.min(pdfDoc.numPages, 12);
    const scale = 0.6;
    const first = await renderPageToCanvas(1, scale);
    const w = first.width;
    const h = first.height;
    const rx = Math.max(0, Math.round(rect.x * w));
    const ry = Math.max(0, Math.round(rect.y * h));
    const rw = Math.max(1, Math.min(w - rx, Math.round(rect.w * w)));
    const rh = Math.max(1, Math.min(h - ry, Math.round(rect.h * h)));
    const counts = new Uint16Array(rw * rh);
    let used = 0;
    for (let n = 1; n <= sample; n += 1) {
      const page = n === 1 ? first : await renderPageToCanvas(n, scale);
      if (page.width !== w || page.height !== h) continue;
      const data = page.getContext("2d").getImageData(0, 0, w, h).data;
      for (let y = 0; y < rh; y += 1) {
        for (let x = 0; x < rw; x += 1) {
          const i = ((ry + y) * w + (rx + x)) * 4;
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (avg < 246) counts[y * rw + x] += 1;
        }
      }
      used += 1;
    }
    const need = Math.max(2, Math.ceil(used * 0.9));
    const mask = new Uint8Array(rw * rh);
    let hits = 0;
    for (let p = 0; p < rw * rh; p += 1) {
      if (counts[p] >= need) { mask[p] = 1; hits += 1; }
    }
    return { mask, rx, ry, rw, rh, w, h, pages: used, coverage: (hits / (rw * rh)) * 100 };
  };

  const renderPreview = async () => {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(Math.min(previewPage, pdfDoc.numPages));
    const viewport = page.getViewport({ scale: 1 });
    const target = Math.min(900, viewport.width * 1.2);
    const scale = target / viewport.width;
    const vp = page.getViewport({ scale });
    const off = document.createElement("canvas");
    off.width = Math.round(vp.width);
    off.height = Math.round(vp.height);
    const octx = off.getContext("2d");
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, off.width, off.height);
    await page.render({ canvasContext: octx, viewport: vp }).promise;
    firstPageCanvas = off;

    canvas.width = off.width;
    canvas.height = off.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(off, 0, 0);
    const options = { ...readOptions(), scaleFactor: 1 };
    if (options.mode === "apply") {
      paintWatermark(ctx, canvas.width, canvas.height, options);
    } else if (options.area === "auto" && maskInfo) {
      const { mask, w, h } = maskInfo;
      const overlay = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = overlay.data;
      for (let y = 0; y < canvas.height; y += 1) {
        const my = Math.min(h - 1, Math.floor((y / canvas.height) * h));
        for (let x = 0; x < canvas.width; x += 1) {
          const mx = Math.min(w - 1, Math.floor((x / canvas.width) * w));
          if (!mask[my * w + mx]) continue;
          const i = (y * canvas.width + x) * 4;
          data[i] = Math.min(255, data[i] * 0.35 + 170);
          data[i + 1] = data[i + 1] * 0.35;
          data[i + 2] = data[i + 2] * 0.35;
        }
      }
      ctx.putImageData(overlay, 0, 0);
    } else {
      const rect = removeRect(canvas.width, canvas.height, options);
      ctx.fillStyle = "rgba(255, 60, 60, 0.35)";
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = "#7c5cff";
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.setLineDash([]);
    }
    stage.hidden = false;
    navWrap.hidden = false;
    pageLabel.textContent = `Page ${Math.min(previewPage, pdfDoc.numPages)} / ${pdfDoc.numPages}`;
  };

  const syncMode = () => {
    resultWrap.hidden = true;
    reviewWrap.hidden = true;
    reviewPages = [];
    reviewIndex = 0;
    showDiff = false;
    resultBlob = null;
    const apply = modeEl.value === "apply";
    applyWrap.hidden = !apply;
    removeWrap.hidden = apply;
    runBtn.textContent = apply ? "Apply watermark" : "Remove watermark";
    renderPreview();
  };

  [textEl, sizeEl, opacityEl, angleEl, colourEl, layoutEl, areaEl].forEach((el) => {
    el.addEventListener("input", () => {
      sizeOut.textContent = sizeEl.value;
      opacityOut.textContent = opacityEl.value;
      angleOut.textContent = angleEl.value;
      renderPreview();
    });
  });
  modeEl.addEventListener("change", syncMode);

  const toRelative = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  };

  canvas.addEventListener("pointerdown", (event) => {
    if (readOptions().mode !== "remove") return;
    areaEl.value = "custom";
    canvas.setPointerCapture(event.pointerId);
    dragging = toRelative(event);
    customRect = { x: dragging.x, y: dragging.y, w: 0, h: 0 };
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const point = toRelative(event);
    customRect = {
      x: Math.min(dragging.x, point.x),
      y: Math.min(dragging.y, point.y),
      w: Math.abs(point.x - dragging.x),
      h: Math.abs(point.y - dragging.y),
    };
    renderPreview();
  });

  canvas.addEventListener("pointerup", () => {
    dragging = null;
  });

  fileEl.addEventListener("change", async () => {
    const file = fileEl.files[0];
    if (!file) return;
    statusEl.textContent = "Reading the PDF…";
    try {
      const pdfjs = await import("./pdf-reader/vendor/pdf.js");
      pdfjs.GlobalWorkerOptions.workerSrc = "./pdf-reader/vendor/pdf.worker.js?v=2";
      pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      fromEl.max = String(pdfDoc.numPages);
      toEl.max = String(pdfDoc.numPages);
      fromEl.value = "1";
      toEl.value = String(pdfDoc.numPages);
      runBtn.disabled = false;
      detectBtn.disabled = false;
      previewPage = 1;
      statusEl.textContent = `${pdfDoc.numPages} page(s) ready · ${(file.size / 1024).toFixed(0)} KB`;
      await renderPreview();
    } catch (error) {
      statusEl.textContent = `Could not open that PDF — ${error.message}`;
    }
  });

  const paintReview = () => {
    if (!reviewPages.length) return;
    const entry = reviewPages[Math.min(reviewIndex, reviewPages.length - 1)];
    beforeCanvas.width = entry.before.width;
    beforeCanvas.height = entry.before.height;
    beforeCanvas.getContext("2d").drawImage(entry.before, 0, 0);
    afterCanvas.width = entry.after.width;
    afterCanvas.height = entry.after.height;
    const ctx = afterCanvas.getContext("2d");
    ctx.drawImage(entry.after, 0, 0);
    let changed = 0;
    const total = entry.after.width * entry.after.height;
    if (showDiff) {
      const a = entry.before.getContext("2d").getImageData(0, 0, entry.before.width, entry.before.height).data;
      const img = ctx.getImageData(0, 0, afterCanvas.width, afterCanvas.height);
      const b = img.data;
      for (let i = 0; i < b.length; i += 4) {
        const diff = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
        if (diff > 30) {
          changed += 1;
          b[i] = 255; b[i + 1] = 40; b[i + 2] = 40;
        }
      }
      ctx.putImageData(img, 0, 0);
    } else {
      const a = entry.before.getContext("2d").getImageData(0, 0, entry.before.width, entry.before.height).data;
      const b = entry.after.getContext("2d").getImageData(0, 0, entry.after.width, entry.after.height).data;
      for (let i = 0; i < b.length; i += 4) {
        if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 30) changed += 1;
      }
    }
    const pct = ((changed / total) * 100).toFixed(1);
    reviewLabel.textContent = `Page ${entry.page} · ${reviewIndex + 1} / ${reviewPages.length}`;
    reviewNote.textContent = changed
      ? `${pct}% of this page changed. ${showDiff ? "Red = changed pixels." : "Press “Show difference” to highlight them."}`
      : "Nothing changed on this page.";
    reviewWrap.hidden = false;
  };

  utilityBody.querySelector("[data-wm-diff]").addEventListener("click", () => {
    showDiff = !showDiff;
    paintReview();
  });
  utilityBody.querySelector("[data-wm-rprev]").addEventListener("click", () => {
    if (reviewIndex > 0) { reviewIndex -= 1; paintReview(); }
  });
  utilityBody.querySelector("[data-wm-rnext]").addEventListener("click", () => {
    if (reviewIndex < reviewPages.length - 1) { reviewIndex += 1; paintReview(); }
  });

  utilityBody.querySelector("[data-wm-download]").addEventListener("click", () => {
    if (!resultBlob) return;
    const stem = (fileEl.files[0]?.name || "document").replace(/\.pdf$/i, "") || "document";
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = modeEl.value === "apply" ? `${stem}-watermarked.pdf` : `${stem}-clean.pdf`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    resultNote.textContent = `${(resultBlob.size / 1024).toFixed(0)} KB downloaded`;
  });

  utilityBody.querySelector("[data-wm-prev]").addEventListener("click", () => {
    if (previewPage > 1) { previewPage -= 1; renderPreview(); }
  });
  utilityBody.querySelector("[data-wm-next]").addEventListener("click", () => {
    if (pdfDoc && previewPage < pdfDoc.numPages) { previewPage += 1; renderPreview(); }
  });

  detectBtn.addEventListener("click", async () => {
    if (!pdfDoc) return;
    detectBtn.disabled = true;
    detectNote.textContent = "Looking for something that repeats on every page…";
    try {
      maskInfo = await detectWatermark();
      if (!maskInfo) {
        detectNote.textContent = "Could not analyse the pages.";
        return;
      }
      areaEl.value = "auto";
      if (maskInfo.coverage > 8) {
        maskInfo = null;
        detectNote.textContent = "This PDF repeats a lot of its layout, so an automatic erase would damage it. Mark the area yourself instead.";
        await renderPreview();
        return;
      }
      detectNote.textContent = maskInfo.coverage > 0.2
        ? `Found a repeating mark covering ${maskInfo.coverage.toFixed(1)}% of the page across ${maskInfo.pages} pages. Red = what will be erased.`
        : "No repeating watermark found. Mark the area yourself instead.";
      await renderPreview();
    } finally {
      detectBtn.disabled = false;
    }
  });

  utilityBody.querySelector("[data-wm-all]").addEventListener("click", () => {
    if (!pdfDoc) return;
    fromEl.value = "1";
    toEl.value = String(pdfDoc.numPages);
    statusEl.textContent = `All ${pdfDoc.numPages} page(s) selected.`;
  });

  resetBtn.addEventListener("click", () => {
    textEl.value = "CONFIDENTIAL";
    sizeEl.value = "64";
    opacityEl.value = "18";
    angleEl.value = "-30";
    colourEl.value = "#ff3b30";
    layoutEl.value = "center";
    areaEl.value = "center";
    customRect = null;
    sizeOut.textContent = "64";
    opacityOut.textContent = "18";
    angleOut.textContent = "-30";
    renderPreview();
  });

  runBtn.addEventListener("click", async () => {
    if (!pdfDoc) return;
    const options = readOptions();
    const first = Math.max(1, Math.min(pdfDoc.numPages, Math.floor(Number(fromEl.value) || 1)));
    const last = Math.max(first, Math.min(pdfDoc.numPages, Math.floor(Number(toEl.value) || pdfDoc.numPages)));
    meterWrap.hidden = false;
    reviewPages = [];
    reviewIndex = 0;
    showDiff = false;
    let region = null;
    if (options.mode === "remove") {
      let box = null;
      // Respect the chosen option: each one now uses its own area.
      if (options.area === "custom") {
        if (customRect && customRect.w > 0.01 && customRect.h > 0.01) box = customRect;
      } else if (options.area === "top") {
        box = { x: 0, y: 0, w: 1, h: 0.22 };
      } else if (options.area === "bottom") {
        box = { x: 0, y: 0.78, w: 1, h: 0.22 };
      } else if (options.area === "center") {
        box = { x: 0, y: 0.34, w: 1, h: 0.32 };
      } else if (maskInfo) {
        // No box drawn: use the bounds of what detection found.
        let minX = maskInfo.w, minY = maskInfo.h, maxX = -1, maxY = -1;
        for (let y = 0; y < maskInfo.h; y += 1) {
          for (let x = 0; x < maskInfo.w; x += 1) {
            if (!maskInfo.mask[y * maskInfo.w + x]) continue;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
        if (maxX >= minX && maxY >= minY) {
          const pad = 2;
          box = {
            x: Math.max(0, (minX - pad) / maskInfo.w),
            y: Math.max(0, (minY - pad) / maskInfo.h),
            w: Math.min(1, (maxX - minX + pad * 2) / maskInfo.w),
            h: Math.min(1, (maxY - minY + pad * 2) / maskInfo.h),
          };
        }
      }
      if (box) {
        statusEl.textContent = "Comparing that area across pages…";
        try {
          region = await buildRegionMask(box);
        } catch (error) {
          region = null;
        }
      }
    }
    const pages = [];
    try {
      for (let n = 1; n <= pdfDoc.numPages; n += 1) {
        statusEl.textContent = `Processing page ${n} of ${pdfDoc.numPages}…`;
        meter.style.width = `${Math.round((n / pdfDoc.numPages) * 100)}%`;
        const page = await pdfDoc.getPage(n);
        const viewport = page.getViewport({ scale: 2 });
        const out = document.createElement("canvas");
        out.width = Math.round(viewport.width);
        out.height = Math.round(viewport.height);
        const ctx = out.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, out.width, out.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (n >= first && n <= last && reviewPages.length < 40) {
          const small = document.createElement("canvas");
          small.width = Math.max(120, Math.round(out.width * 0.32));
          small.height = Math.max(160, Math.round(out.height * 0.32));
          small.getContext("2d").drawImage(out, 0, 0, small.width, small.height);
          var beforeSnapshot = small;
        }

        if (n >= first && n <= last) {
          if (options.mode === "apply") {
            paintWatermark(ctx, out.width, out.height, {
              ...options,
              scaleFactor: firstPageCanvas ? out.width / firstPageCanvas.width : 1,
            });
          } else if (region) {
            const image = ctx.getImageData(0, 0, out.width, out.height);
            const data = image.data;
            const W = out.width;
            const H = out.height;
            // Walk the output pixels once and look each one up in the mask. Doing
            // it the other way round (one mask pixel -> a block of output pixels)
            // erased 4x too much and swallowed nearby text.
            const left = Math.floor((region.rx / region.w) * W);
            const top = Math.floor((region.ry / region.h) * H);
            const right = Math.min(W - 1, Math.ceil(((region.rx + region.rw) / region.w) * W));
            const bottom = Math.min(H - 1, Math.ceil(((region.ry + region.rh) / region.h) * H));
            for (let py = top; py <= bottom; py += 1) {
              const my = Math.min(region.rh - 1, Math.floor(((py / H) * region.h - region.ry)));
              if (my < 0) continue;
              for (let px = left; px <= right; px += 1) {
                const mx = Math.min(region.rw - 1, Math.floor(((px / W) * region.w - region.rx)));
                if (mx < 0) continue;
                if (!region.mask[my * region.rw + mx]) continue;
                const i = (py * W + px) * 4;
                // Never touch high-contrast pixels: that is text or a rule.
                let min = 255;
                let max = 0;
                if (px > 0 && py > 0 && px < W - 1 && py < H - 1) {
                  for (let dy = -1; dy <= 1; dy += 1) {
                    for (let dx = -1; dx <= 1; dx += 1) {
                      const j = ((py + dy) * W + (px + dx)) * 4;
                      const lum = (data[j] + data[j + 1] + data[j + 2]) / 3;
                      if (lum < min) min = lum;
                      if (lum > max) max = lum;
                    }
                  }
                }
                if (max - min > 60) continue;
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
              }
            }
            ctx.putImageData(image, 0, 0);
          } else if (options.area === "auto" && maskInfo) {
            const image = ctx.getImageData(0, 0, out.width, out.height);
            const data = image.data;
            const { mask, w, h } = maskInfo;
            const W = out.width;
            for (let y = 1; y < out.height - 1; y += 1) {
              const my = Math.min(h - 1, Math.floor((y / out.height) * h));
              for (let x = 1; x < W - 1; x += 1) {
                const mx = Math.min(w - 1, Math.floor((x / W) * w));
                if (!mask[my * w + mx]) continue;
                const i = (y * W + x) * 4;
                // Local contrast: skip anything that looks like text or a line so
                // only smooth watermark areas are cleared.
                let min = 255;
                let max = 0;
                for (let dy = -1; dy <= 1; dy += 1) {
                  for (let dx = -1; dx <= 1; dx += 1) {
                    const j = ((y + dy) * W + (x + dx)) * 4;
                    const lum = (data[j] + data[j + 1] + data[j + 2]) / 3;
                    if (lum < min) min = lum;
                    if (lum > max) max = lum;
                  }
                }
                if (max - min > 55) continue;
                data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
              }
            }
            ctx.putImageData(image, 0, 0);
          } else {
            const rect = removeRect(out.width, out.height, options);
            // Sample just outside the area so erasing blends into the page
            // instead of leaving a bright white patch.
            let fill = "#ffffff";
            try {
              const sx = Math.min(out.width - 1, Math.max(0, Math.round(rect.x + rect.w / 2)));
              const sy = Math.max(0, Math.round(rect.y) - 4);
              const sample = ctx.getImageData(sx, sy, 1, 1).data;
              fill = `rgb(${sample[0]}, ${sample[1]}, ${sample[2]})`;
            } catch (error) {
              fill = "#ffffff";
            }
            ctx.fillStyle = fill;
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
          }
        }

        if (typeof beforeSnapshot !== "undefined" && beforeSnapshot) {
          const afterSmall = document.createElement("canvas");
          afterSmall.width = beforeSnapshot.width;
          afterSmall.height = beforeSnapshot.height;
          afterSmall.getContext("2d").drawImage(out, 0, 0, afterSmall.width, afterSmall.height);
          reviewPages.push({ page: n, before: beforeSnapshot, after: afterSmall });
          beforeSnapshot = null;
        }

        const blob = await new Promise((r) => out.toBlob(r, "image/jpeg", 0.92));
        // The canvas is rendered at 2x, so the page box in points is half of it.
        const pageW = out.width / 2;
        const pageH = out.height / 2;
        pages.push({
          bytes: new Uint8Array(await blob.arrayBuffer()),
          width: out.width,
          height: out.height,
          pageWidth: pageW,
          pageHeight: pageH,
          drawWidth: pageW,
          drawHeight: pageH,
          x: 0,
          y: 0,
        });
      }
      const pdf = createPdfFromImages(pages);
      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      const stem = (fileEl.files[0]?.name || "document").replace(/\.pdf$/i, "") || "document";
      link.download = options.mode === "apply" ? `${stem}-watermarked.pdf` : `${stem}-clean.pdf`;
      resultBlob = pdf;
      resultWrap.hidden = false;
      reviewIndex = 0;
      showDiff = false;
      paintReview();
      resultNote.textContent = `${pages.length} page(s) · ${(pdf.size / 1024).toFixed(0)} KB · nothing has downloaded yet`;
      meter.style.width = "100%";
      const what = options.mode === "apply"
        ? "Watermark applied"
        : region
          ? `Removed only the pattern common to all pages inside your box (${region.coverage.toFixed(1)}% of the box)`
          : options.area === "auto"
            ? "Detected watermark erased"
            : "Marked area erased";
      statusEl.textContent = `${what} on pages ${first}–${last}. Review it above, then press Download.`;
    } catch (error) {
      statusEl.textContent = `Could not finish — ${error.message}`;
    }
  });

  syncMode();
}

/* ---------------------------------------------------------- typing test */
const TYPING_WORDS = ("the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us").split(" ");
const TYPING_PUNCT = [",", ".", ";", ":", "!", "?"];

function renderTypingTest() {
  utilityBody.innerHTML = `
    <div class="util-actions" data-ty-modes>
      <button class="util-btn is-on" type="button" data-ty-mode="time" data-ty-value="15">15s</button>
      <button class="util-btn" type="button" data-ty-mode="time" data-ty-value="30">30s</button>
      <button class="util-btn" type="button" data-ty-mode="time" data-ty-value="60">60s</button>
      <button class="util-btn" type="button" data-ty-mode="time" data-ty-value="120">120s</button>
      <button class="util-btn" type="button" data-ty-mode="words" data-ty-value="10">10 words</button>
      <button class="util-btn" type="button" data-ty-mode="words" data-ty-value="25">25 words</button>
      <button class="util-btn" type="button" data-ty-mode="words" data-ty-value="50">50 words</button>
      <button class="util-btn" type="button" data-ty-mode="quote" data-ty-value="0">quote</button>
    </div>
    <div class="util-toggles">
      <label><input type="checkbox" data-ty-punct /> punctuation</label>
      <label><input type="checkbox" data-ty-numbers /> numbers</label>
      <label><input type="checkbox" data-ty-sound checked /> sound</label>
      <label><input type="checkbox" data-ty-stop /> stop on error</label>
      <label><input type="checkbox" data-ty-nobs /> no backspace</label>
      <label><input type="checkbox" data-ty-zen /> zen mode (no timer)</label>
      <label><input type="checkbox" data-ty-blind /> blind mode (hide mistakes)</label>
    </div>
    <div class="util-field">
      <label for="ty-custom">Or type your own text</label>
      <div class="pw-output">
        <input id="ty-custom" type="text" placeholder="Paste any text to practise with…" data-ty-custom />
        <button type="button" data-ty-use>Use</button>
      </div>
    </div>
    <div class="ty-bar">
      <span class="ty-stat"><strong data-ty-time>15</strong><small>sec</small></span>
      <span class="ty-stat"><strong data-ty-wpm>0</strong><small>wpm</small></span>
      <span class="ty-stat"><strong data-ty-acc>100%</strong><small>accuracy</small></span>
      <span class="ty-stat"><strong data-ty-best>0</strong><small>best wpm</small></span>
      <div class="meter ty-progress"><span data-ty-progress></span></div>
    </div>
    <canvas class="ty-live" data-ty-live width="720" height="54" hidden></canvas>
    <div class="ty-caps" data-ty-caps hidden>Caps Lock is on</div>
    <div class="ty-stage" data-ty-stage tabindex="0" role="textbox" aria-label="Typing area">
      <div class="ty-words" data-ty-words></div>
      <div class="ty-hint" data-ty-hint>Click here and start typing — Tab restarts</div>
    </div>
    <div class="ty-results" data-ty-results hidden>
      <div class="stat-grid" data-ty-stats></div>
      <canvas class="ty-chart" data-ty-chart width="720" height="180"></canvas>
      <div class="ty-heat" data-ty-heat></div>
      <div data-ty-history></div>
      <div class="util-actions">
        <button class="control-button primary" type="button" data-ty-again>Try again</button>
        <button class="util-btn" type="button" data-ty-share>Copy result</button>
        <button class="util-btn" type="button" data-ty-retry>Retry missed words</button>
      </div>
      <p class="util-note" data-ty-extra></p>
    </div>
    <p class="util-note" data-ty-status>Pick a mode, then start typing.</p>
  `;

  const stage = utilityBody.querySelector("[data-ty-stage]");
  const wordsEl = utilityBody.querySelector("[data-ty-words]");
  const hintEl = utilityBody.querySelector("[data-ty-hint]");
  const timeEl = utilityBody.querySelector("[data-ty-time]");
  const wpmEl = utilityBody.querySelector("[data-ty-wpm]");
  const accEl = utilityBody.querySelector("[data-ty-acc]");
  const progressEl = utilityBody.querySelector("[data-ty-progress]");
  const statusEl = utilityBody.querySelector("[data-ty-status]");
  const resultsEl = utilityBody.querySelector("[data-ty-results]");
  const statsEl = utilityBody.querySelector("[data-ty-stats]");
  const chartEl = utilityBody.querySelector("[data-ty-chart]");
  const extraEl = utilityBody.querySelector("[data-ty-extra]");
  const punctEl = utilityBody.querySelector("[data-ty-punct]");
  const numbersEl = utilityBody.querySelector("[data-ty-numbers]");
  const soundEl = utilityBody.querySelector("[data-ty-sound]");
  const stopEl = utilityBody.querySelector("[data-ty-stop]");
  const nobsEl = utilityBody.querySelector("[data-ty-nobs]");
  const zenEl = utilityBody.querySelector("[data-ty-zen]");
  const blindEl = utilityBody.querySelector("[data-ty-blind]");
  const capsEl = utilityBody.querySelector("[data-ty-caps]");
  const customEl = utilityBody.querySelector("[data-ty-custom]");
  const bestEl = utilityBody.querySelector("[data-ty-best]");
  const liveEl = utilityBody.querySelector("[data-ty-live]");

  let mode = "time";
  let target = 15;
  let text = "";
  let chars = [];
  let typed = [];
  let started = false;
  let finished = false;
  let startTime = 0;
  let ticker = 0;
  let samples = [];
  let keystrokes = 0;
  let correctKeys = 0;
  let keyErrors = {};
  let audioCtx = null;

  const beep = (freq, dur, type) => {
    if (!soundEl.checked) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (error) { /* audio is a nicety */ }
  };

  const TYPING_QUOTES = [
    "The quick brown fox jumps over the lazy dog while the sun sets behind the quiet hills.",
    "Small steps taken every day will always beat one giant leap taken once a year.",
    "Practice does not make perfect, but it does make permanent, so practise carefully.",
    "A calm mind and steady hands will finish far more work than a hurried rush ever can.",
    "Every expert was once a beginner who refused to stop showing up for the work.",
  ];

  const TYPING_SENTENCES = [
    "The morning train was late again, so she bought a cup of tea and waited on the platform.",
    "Good handwriting is not a talent you are born with, it is a habit you build slowly.",
    "He opened the old notebook and found a list of things he had promised himself to do.",
    "The garden looked different after the rain, greener and somehow much quieter than before.",
    "A small lamp on the desk was enough to light the whole room while the storm passed.",
    "She wrote the answer twice, once quickly and once carefully, and kept the second one.",
    "The market was crowded with people carrying bags of fruit, flowers and fresh bread.",
    "Learning to type without looking at the keys takes a week of patience and practice.",
    "They walked along the river until the street lights came on and the air turned cold.",
    "Every page of the book had a note in the margin, written in a neat, patient hand.",
    "The teacher asked the class to read the paragraph aloud and then explain it in their own words.",
    "A good plan today is worth more than a perfect plan that never leaves the notebook.",
    "The bus stopped at three villages before it finally reached the edge of the city.",
    "He kept the receipt in his wallet, not because he needed it, but because it reminded him of the trip.",
    "The rain started just as the children reached the gate, and they ran the rest of the way home.",
    "She measured the flour twice, added a pinch of salt, and left the dough to rest for an hour.",
    "The old clock in the hall still worked, though it lost a minute every single day.",
    "You can learn a great deal by watching how someone else solves a problem quietly.",
    "The library closed at six, so they had to finish their work before the lights went out.",
    "He wrote down the address on the back of his hand and hoped the ink would last.",
    "The first attempt failed, the second was worse, and the third finally worked perfectly.",
    "A clear desk and a short list of tasks can change the whole feeling of a working day.",
    "The road curved past the fields and disappeared behind a line of tall trees.",
    "She spoke slowly and clearly, and everyone in the room understood every single word.",
  ];

  const buildParagraph = (minWords) => {
    const picked = [];
    let words = 0;
    let guard = 0;
    while (words < minWords && guard < 200) {
      guard += 1;
      const sentence = TYPING_SENTENCES[Math.floor(Math.random() * TYPING_SENTENCES.length)];
      if (picked.length && picked[picked.length - 1] === sentence) continue;
      picked.push(sentence);
      words += sentence.split(" ").length;
    }
    return picked.join(" ");
  };

  const buildText = () => {
    if (mode === "quote") {
      text = TYPING_QUOTES[Math.floor(Math.random() * TYPING_QUOTES.length)];
      chars = text.split("");
      typed = new Array(chars.length).fill(null);
      return;
    }
    const count = mode === "words" ? target : 90;
    const paragraph = buildParagraph(count + 12);
    const words = paragraph.split(" ");
    if (mode === "words") {
      text = words.slice(0, count).join(" ").replace(/[,\.;:]$/, "");
    } else {
      text = words.slice(0, count).join(" ");
    }
    if (numbersEl.checked) {
      text = text.replace(/\b(\w{4,})\b/, (m) => `${m} ${Math.floor(Math.random() * 90) + 10}`);
    }
    if (!text.trim()) text = TYPING_SENTENCES[0];
    chars = text.split("");
    typed = new Array(chars.length).fill(null);
  };

  const paint = () => {
    const cursor = typed.indexOf(null);
    const parts = [];
    let word = [];
    let wordDone = true;
    let wordActive = false;
    const flush = () => {
      if (!word.length) return;
      const cls = `ty-word${wordDone ? " is-done" : ""}${wordActive ? " is-active" : ""}`;
      parts.push(`<span class="${cls}">${word.join("")}</span>`);
      word = [];
      wordDone = true;
      wordActive = false;
    };
    for (let i = 0; i < chars.length; i += 1) {
      const ch = chars[i] === " " ? "&nbsp;" : chars[i].replace("&", "&amp;").replace("<", "&lt;");
      let cls = "ty-char";
      if (typed[i] === true) cls += " is-ok";
      else if (typed[i] === false) cls += " is-bad";
      if (i === cursor) { cls += " is-cursor"; wordActive = true; }
      if (typed[i] === null) wordDone = false;
      word.push(`<span class="${cls}">${ch}</span>`);
      if (chars[i] === " ") flush();
    }
    flush();
    wordsEl.innerHTML = parts.join("");
  };

  const reset = () => {
    window.clearInterval(ticker);
    started = false;
    finished = false;
    startTime = 0;
    samples = [];
    keystrokes = 0;
    correctKeys = 0;
    keyErrors = {};
    resultsEl.hidden = true;
    buildText();
    paint();
    timeEl.textContent = String(target);
    wpmEl.textContent = "0";
    accEl.textContent = "100%";
    progressEl.style.width = "0%";
    hintEl.hidden = false;
    statusEl.textContent = mode === "time" ? `${target} second test — start typing.`
      : mode === "quote" ? "Quote test — start typing."
      : `${target} words — start typing.`;
  };

  const stats = () => {
    const elapsed = startTime ? (performance.now() - startTime) / 1000 : 0;
    const correctChars = typed.reduce((sum, v, i) => sum + (v === true && chars[i] !== " " ? 1 : 0), 0);
    const typedChars = typed.reduce((sum, v) => sum + (v === null ? 0 : 1), 0);
    const minutes = Math.max(elapsed / 60, 1 / 60);
    const netWpm = Math.max(0, Math.round((correctChars / 5) / minutes));
    const rawWpm = Math.max(0, Math.round((typedChars / 5) / minutes));
    const accuracy = keystrokes ? Math.round((correctKeys / keystrokes) * 100) : 100;
    return { elapsed, correctChars, typedChars, netWpm, rawWpm, accuracy };
  };

  const tick = () => {
    const s = stats();
    if (zenEl.checked) {
      timeEl.textContent = String(Math.round(s.elapsed));
      progressEl.style.width = "100%";
      wpmEl.textContent = String(s.netWpm);
      accEl.textContent = `${s.accuracy}%`;
      if (Math.floor(s.elapsed) % 2 === 0) samples.push({ t: s.elapsed, wpm: s.netWpm, raw: s.rawWpm });
      drawLive();
      return;
    }
    if (mode === "time") {
      const left = Math.max(0, target - s.elapsed);
      timeEl.textContent = String(Math.ceil(left));
      progressEl.style.width = `${Math.min(100, (s.elapsed / target) * 100)}%`;
      if (left <= 0) return finish();
    } else {
      timeEl.textContent = String(Math.round(s.elapsed));
      progressEl.style.width = `${Math.min(100, (typed.filter((v) => v !== null).length / chars.length) * 100)}%`;
    }
    wpmEl.textContent = String(s.netWpm);
    accEl.textContent = `${s.accuracy}%`;
    if (Math.floor(s.elapsed) % 2 === 0) samples.push({ t: s.elapsed, wpm: s.netWpm, raw: s.rawWpm });
    drawLive();
  };

  const drawLive = () => {
    if (samples.length < 2) return;
    liveEl.hidden = false;
    const ctx = liveEl.getContext("2d");
    const w = liveEl.width;
    const h = liveEl.height;
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(...samples.map((s) => s.wpm), 20);
    ctx.beginPath();
    samples.forEach((s, i) => {
      const x = (i / (samples.length - 1)) * (w - 4) + 2;
      const y = h - 4 - (s.wpm / max) * (h - 10);
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    });
    ctx.strokeStyle = "#7c5cff";
    ctx.lineWidth = 2;
    ctx.stroke();
    const ghost = Number(bestEl ? bestEl.textContent : 0) || 0;
    if (ghost > 0) {
      const gy = h - 4 - (ghost / max) * (h - 10);
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(2, gy);
      ctx.lineTo(w - 2, gy);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const drawChart = () => {
    const ctx = chartEl.getContext("2d");
    const w = chartEl.width;
    const h = chartEl.height;
    ctx.clearRect(0, 0, w, h);
    if (samples.length < 2) return;
    const maxWpm = Math.max(...samples.map((s) => Math.max(s.wpm, s.raw)), 20);
    const x = (i) => 12 + (i / (samples.length - 1)) * (w - 24);
    const y = (v) => h - 16 - (v / maxWpm) * (h - 36);
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1;
    for (let g = 0; g <= 3; g += 1) {
      const gy = 16 + (g / 3) * (h - 36);
      ctx.beginPath(); ctx.moveTo(12, gy); ctx.lineTo(w - 12, gy); ctx.stroke();
    }
    ctx.beginPath();
    samples.forEach((s, i) => (i ? ctx.lineTo(x(i), y(s.raw)) : ctx.moveTo(x(i), y(s.raw))));
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    samples.forEach((s, i) => (i ? ctx.lineTo(x(i), y(s.wpm)) : ctx.moveTo(x(i), y(s.wpm))));
    ctx.strokeStyle = "#7c5cff";
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearInterval(ticker);
    const s = stats();
    const wpmList = samples.map((x) => x.wpm);
    const mean = wpmList.reduce((a, b) => a + b, 0) / Math.max(1, wpmList.length);
    const variance = wpmList.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, wpmList.length);
    const consistency = mean ? Math.max(0, Math.round(100 - (Math.sqrt(variance) / mean) * 100)) : 0;
    const wrong = Object.entries(keyErrors).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const stat = (value, label) => `<div class="stat"><span>${value}</span><small>${label}</small></div>`;
    statsEl.innerHTML = [
      stat(`${s.netWpm}`, "net wpm"),
      stat(`${s.rawWpm}`, "raw wpm"),
      stat(`${s.accuracy}%`, "accuracy"),
      stat(`${consistency}%`, "consistency"),
      stat(`${s.correctChars}`, "correct chars"),
      stat(`${Math.round(s.elapsed)}s`, "time"),
    ].join("");

    drawChart();

    // keyboard heatmap of missed keys
    const heatEl = utilityBody.querySelector("[data-ty-heat]");
    const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    const worst = Math.max(1, ...Object.values(keyErrors));
    heatEl.innerHTML = rows.map((row) => `<div class="ty-heat__row">${row.split("").map((k) => {
      const n = keyErrors[k] || 0;
      const alpha = n ? 0.2 + (n / worst) * 0.7 : 0;
      return `<span class="ty-heat__key${n ? " is-hot" : ""}" style="--heat:${alpha}">${k}${n ? `<i>${n}</i>` : ""}</span>`;
    }).join("")}</div>`).join("");

    resultsEl.hidden = false;
    hintEl.hidden = true;
    statusEl.textContent = "Done — Tab or “Try again” for another run.";

    const store = readStored("flip-watch-typing", { best: 0, runs: [] }) || { best: 0, runs: [] };
    const best = Math.max(store.best || 0, s.netWpm);
    const runs = [{ wpm: s.netWpm, acc: s.accuracy, mode: `${target}${mode === "time" ? "s" : "w"}`, at: Date.now() }, ...(store.runs || [])].slice(0, 10);
    writeStored("flip-watch-typing", { best, runs });
    const avg = Math.round(runs.reduce((a, b) => a + b.wpm, 0) / runs.length);
    if (bestEl) bestEl.textContent = String(best);
    const historyEl = utilityBody.querySelector("[data-ty-history]");
    if (historyEl) {
      historyEl.innerHTML = `<table class="util-table"><caption>Last runs</caption><thead><tr><th>#</th><th>WPM</th><th>Accuracy</th><th>Mode</th></tr></thead><tbody>${
        runs.map((r, i) => `<tr><td>${i + 1}</td><td>${r.wpm}</td><td>${r.acc}%</td><td>${r.mode}</td></tr>`).join("")
      }</tbody></table>`;
    }
    extraEl.textContent = `Personal best ${best} wpm · last ${runs.length} run average ${avg} wpm${wrong.length ? ` · watch these keys: ${wrong.map(([k, n]) => `${k} (${n})`).join(", ")}` : ""}`;
  };

  const typeChar = (ch) => {
    if (finished) return;
    const index = typed.indexOf(null);
    if (index < 0) return finish();
    if (!started) {
      started = true;
      startTime = performance.now();
      ticker = window.setInterval(tick, 250);
      hintEl.hidden = true;
    }
    const expected = chars[index];
    const ok = ch === expected;
    if (!ok && stopEl.checked) {
      keystrokes += 1;
      keyErrors[expected === " " ? "space" : expected] = (keyErrors[expected === " " ? "space" : expected] || 0) + 1;
      beep(220, 0.08, "sawtooth");
      return;
    }
    keystrokes += 1;
    if (ok) correctKeys += 1;
    else keyErrors[expected === " " ? "space" : expected] = (keyErrors[expected === " " ? "space" : expected] || 0) + 1;
    typed[index] = ok;
    beep(ok ? 880 : 220, ok ? 0.03 : 0.08, ok ? "square" : "sawtooth");
    paint();
    if (mode === "words" && typed.filter((v) => v !== null).length >= chars.length) finish();
  };

  const onKey = (event) => {
    if (capsEl && typeof event.getModifierState === "function") {
      capsEl.hidden = !event.getModifierState("CapsLock");
    }
    if (event.key === "Tab" || event.key === "Escape") {
      event.preventDefault();
      reset();
      return;
    }
    if (finished) return;
    if (event.key === "Backspace") {
      event.preventDefault();
      if (nobsEl.checked) return;
      const last = typed.lastIndexOf(true, typed.length - 1);
      let idx = -1;
      for (let i = typed.length - 1; i >= 0; i -= 1) if (typed[i] !== null) { idx = i; break; }
      if (idx >= 0) { typed[idx] = null; paint(); }
      return;
    }
    if (event.key.length !== 1) return;
    event.preventDefault();
    typeChar(event.key);
  };

  utilityBody.querySelectorAll("[data-ty-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      utilityBody.querySelectorAll("[data-ty-mode]").forEach((b) => b.classList.remove("is-on"));
      button.classList.add("is-on");
      mode = button.dataset.tyMode;
      target = Number(button.dataset.tyValue);
      reset();
    });
  });
  [punctEl, numbersEl].forEach((el) => el.addEventListener("change", reset));
  utilityBody.querySelector("[data-ty-again]").addEventListener("click", reset);
  utilityBody.querySelector("[data-ty-retry]").addEventListener("click", () => {
    const wrongWords = new Set();
    let start = 0;
    for (let i = 0; i <= chars.length; i += 1) {
      if (i === chars.length || chars[i] === " ") {
        const word = chars.slice(start, i).join("");
        let bad = false;
        for (let j = start; j < i; j += 1) if (typed[j] === false) bad = true;
        if (bad && word.trim()) wrongWords.add(word.trim());
        start = i + 1;
      }
    }
    if (!wrongWords.size) {
      statusEl.textContent = "No missed words to practise — nice run.";
      return;
    }
    window.clearInterval(ticker);
    started = false; finished = false; startTime = 0; samples = []; keystrokes = 0; correctKeys = 0; keyErrors = {};
    resultsEl.hidden = true;
    liveEl.hidden = true;
    text = Array.from(wrongWords).join(" ");
    chars = text.split("");
    typed = new Array(chars.length).fill(null);
    paint();
    statusEl.textContent = `Practising ${wrongWords.size} missed word(s).`;
    stage.focus();
  });

  utilityBody.querySelector("[data-ty-share]").addEventListener("click", () => {
    const s = stats();
    utilCopy(`${s.netWpm} wpm · ${s.accuracy}% accuracy · ${target}${mode === "time" ? "s" : " words"} on Flip Watch`, "Result copied.");
  });

  stage.addEventListener("click", () => stage.focus());
  stage.addEventListener("focus", () => { hintEl.hidden = true; });
  stage.addEventListener("blur", () => {
    if (!finished) { hintEl.hidden = false; hintEl.textContent = "Click here to keep typing"; }
  });
  blindEl.addEventListener("change", () => {
    stage.classList.toggle("is-blind", blindEl.checked);
  });

  utilityBody.querySelector("[data-ty-use]").addEventListener("click", () => {
    const value = customEl.value.trim();
    if (!value) { statusEl.textContent = "Type or paste some text first."; return; }
    window.clearInterval(ticker);
    started = false; finished = false; startTime = 0; samples = []; keystrokes = 0; correctKeys = 0; keyErrors = {};
    resultsEl.hidden = true; liveEl.hidden = true;
    text = value;
    chars = text.split("");
    typed = new Array(chars.length).fill(null);
    paint();
    statusEl.textContent = "Custom text ready — start typing.";
    stage.focus();
  });

  // Capture keys at the document level too: the stage loses focus easily (after
  // clicking a mode button, for example) and then nothing was typed at all.
  if (window.__flipTypingHandler) {
    document.removeEventListener("keydown", window.__flipTypingHandler);
  }
  window.__flipTypingHandler = (event) => {
    if (!utilityPanel || utilityPanel.hidden) return;
    if (!utilityBody.querySelector("[data-ty-stage]")) return;
    const target = event.target;
    if (target && target.closest && target.closest("input, textarea, select")) return;
    if (target && target.closest && target.closest("button")) return;
    onKey(event);
  };
  document.addEventListener("keydown", window.__flipTypingHandler);
  window.__flipTypingCleanup = () => {
    document.removeEventListener("keydown", window.__flipTypingHandler);
    window.__flipTypingHandler = null;
    window.__flipTypingCleanup = null;
    window.clearInterval(ticker);
  };

  window.setTimeout(() => stage.focus(), 60);
  const storedBest = readStored("flip-watch-typing", { best: 0 }) || { best: 0 };
  if (bestEl) bestEl.textContent = String(storedBest.best || 0);
  if (!chars.length) buildText();
  paint();
  reset();
}

if (utilityPanel) {
  const backButton = utilityPanel.querySelector("[data-utility-back]");
  if (backButton) backButton.addEventListener("click", showDashboard);
}

/* =====================================================================
   App-level polish: version, install prompt, offline state, about dialog.
   ===================================================================== */
const APP_VERSION = "2.1.0";

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
