const display = document.querySelector(".display");
const appShell = document.querySelector("[data-app-shell]");
const dashboard = document.querySelector("[data-dashboard]");
const toolPanel = document.querySelector("[data-tool-panel]");
const calculatorPanel = document.querySelector("[data-calculator-panel]");
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
const awakeToggle = document.querySelector("[data-awake-toggle]");
const wakeStatus = document.querySelector("[data-wake-status]");
const screenFitButton = document.querySelector("[data-screen-fit]");
const soundToggle = document.querySelector("[data-sound-toggle]");
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

let elapsedBeforeStart = 0;
let startedAt = 0;
let stopwatchFrame = 0;
let clockFrame = 0;
let isRunning = false;
let activeMode = "stopwatch";
let wakeLock = null;
let wakeLockSupported = "wakeLock" in navigator;
let wakeLockLastError = "";
let lastRenderedCentiseconds = -1;
let selectedTimerDuration = 5 * 60 * 1000;
let timerRemainingBeforeStart = selectedTimerDuration;
const flipDuration = 820;
let calculatorAngleMode = "DEG";
let calculatorMemory = 0;
let calculatorHistory = [];
let calculatorLastAnswer = 0;
let soundEnabled = true;
let audioContext = null;

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

const calculatorFunctions = {
  sin: (value) => Math.sin(calculatorAngleMode === "DEG" ? value * Math.PI / 180 : value),
  cos: (value) => Math.cos(calculatorAngleMode === "DEG" ? value * Math.PI / 180 : value),
  tan: (value) => Math.tan(calculatorAngleMode === "DEG" ? value * Math.PI / 180 : value),
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
  round: Math.round,
  pow: Math.pow,
  mod: (left, right) => left % right,
  min: Math.min,
  max: Math.max,
};

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
    let value = parsePower();
    while (peek()?.value === "*" || peek()?.value === "/") {
      const operator = tokens[position++].value;
      const right = parsePower();
      if (operator === "/" && right === 0) {
        throw new Error("Cannot divide by zero");
      }
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  }

  function parsePower() {
    const value = parseUnary();
    if (peek()?.value === "^") {
      position += 1;
      return Math.pow(value, parsePower());
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
    return parsePostfix();
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
    renderCalculatorHistory();
    clearCalculatorError();
  } catch (error) {
    setCalculatorError(error.message || "Invalid expression");
  }
}

function insertCalculatorValue(value) {
  const input = calculatorInput;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const shouldReplaceZero = input.value === "0" && (/[0-9.]/.test(value) || value === "pi" || value === "e");
  if (shouldReplaceZero) {
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
  if (open) calculatorGuideClose.focus();
}

function handleCalculatorAction(action) {
  if (action === "clear") {
    calculatorInput.value = "0";
    calculatorPrevious.textContent = "Ready";
    clearCalculatorError();
    return;
  }
  if (action === "delete") {
    calculatorInput.value = calculatorInput.value.length > 1 ? calculatorInput.value.slice(0, -1) : "0";
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

  setHalfValue(card, ".flip-top", currentValue);
  setHalfValue(card, ".flip-bottom", currentValue);
  setHalfValue(card, ".fold-top", currentValue);
  setHalfValue(card, ".fold-bottom", nextValue);

  card.classList.remove("is-flipping");
  void card.offsetWidth;
  card.classList.add("is-flipping");
  card.dataset.value = nextValue;
  card.setAttribute("aria-label", nextValue);

  card._flipTimers.push(window.setTimeout(() => {
    setHalfValue(card, ".flip-top", nextValue);
  }, flipDuration / 2));

  card._flipTimers.push(window.setTimeout(() => {
    setHalfValue(card, ".flip-bottom", nextValue);
    card.classList.remove("is-flipping");
    card._flipTimers = [];
  }, flipDuration));
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

function renderDuration(durationMs, force = false) {
  const centiseconds = Math.floor(durationMs / 10);

  if (!force && centiseconds === lastRenderedCentiseconds) {
    return false;
  }

  lastRenderedCentiseconds = centiseconds;

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
  const elapsed = getElapsed();
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

  isRunning = true;
  startedAt = performance.now();
  startButton.hidden = true;
  stopButton.hidden = false;
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
  } else {
    elapsedBeforeStart = getElapsed();
  }

  isRunning = false;
  cancelAnimationFrame(stopwatchFrame);
  startButton.hidden = false;
  stopButton.hidden = true;
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
  } else {
    elapsedBeforeStart = 0;
  }

  startedAt = performance.now();
  isRunning = false;
  cancelAnimationFrame(stopwatchFrame);
  lastRenderedCentiseconds = -1;
  startButton.hidden = false;
  stopButton.hidden = true;
  if (activeMode === "timer") {
    renderTimer(true);
  } else {
    renderStopwatch(true);
  }
  void releaseWakeLock("reset");
}

function renderClock() {
  const now = new Date();
  clockTime.textContent = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  clockDate.textContent = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (activeMode === "clock") {
    clockFrame = requestAnimationFrame(renderClock);
  }
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
    button.classList.toggle("active", button.dataset.mode === nextMode);
  });

  display.hidden = isClock;
  controls.hidden = isClock;
  clockDisplay.hidden = !isClock;
  timerOptions.hidden = !isTimer;

  cancelAnimationFrame(clockFrame);
  cancelAnimationFrame(stopwatchFrame);
  lastRenderedCentiseconds = -1;

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

function openTool(mode) {
  if (mode === "pdf") {
    window.location.href = "pdf-reader/index.html";
    return;
  }

  if (mode === "calculator") {
    dashboard.hidden = true;
    toolPanel.hidden = true;
    calculatorPanel.hidden = false;
    calculatorInput.focus();
    return;
  }

  dashboard.hidden = true;
  toolPanel.hidden = false;
  setMode(mode);
}

function showDashboard() {
  if (isRunning) {
    stopCurrentMode();
  }

  cancelAnimationFrame(clockFrame);
  cancelAnimationFrame(stopwatchFrame);
  toolPanel.hidden = true;
  calculatorPanel.hidden = true;
  dashboard.hidden = false;
}

function setTimerDuration(minutes) {
  const safeMinutes = Math.min(Math.max(Number(minutes) || 1, 1), 5999);
  selectedTimerDuration = safeMinutes * 60 * 1000;
  timerRemainingBeforeStart = selectedTimerDuration;
  customMinutesInput.value = String(safeMinutes);
  lastRenderedCentiseconds = -1;

  presetButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.minutes) === safeMinutes);
  });

  if (activeMode === "timer" && !isRunning) {
    renderTimer(true);
  }
}

startButton.addEventListener("click", startCurrentMode);
stopButton.addEventListener("click", stopCurrentMode);
resetButton.addEventListener("click", resetCurrentMode);

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

toolCards.forEach((card) => {
  card.addEventListener("click", () => openTool(card.dataset.openTool));
});

backDashboardButton.addEventListener("click", showDashboard);
document.querySelector("[data-calculator-back]").addEventListener("click", showDashboard);
screenFitButton.addEventListener("click", () => {
  void toggleScreenFit();
});

soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  updateSoundToggle();
});

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement === appShell) {
    updateScreenFitControl(true);
  }
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => setTimerDuration(button.dataset.minutes));
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
  if (document.visibilityState === "visible") {
    console.info("[WakeLock] Tab visible; checking wake lock state.");
    void requestWakeLock();
  } else {
    console.info("[WakeLock] Tab hidden; browser may release wake lock.");
  }
});

window.addEventListener("pagehide", () => {
  void releaseWakeLock("page hidden");
});

prepareFlipCards();
renderStopwatch(true);
renderCalculatorHistory();
updateCalculatorMemoryStatus();
updateSoundToggle();
setWakeIndicator(wakeLockSupported ? "idle" : "warning", wakeLockSupported ? "Screen Awake: Off" : "Wake Lock Unsupported");
