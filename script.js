const display = document.querySelector(".display");
const dashboard = document.querySelector("[data-dashboard]");
const toolPanel = document.querySelector("[data-tool-panel]");
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
const hourCards = document.querySelectorAll('[data-unit="hours"] .flip-card');
const minuteCards = document.querySelectorAll('[data-unit="minutes"] .flip-card');
const secondCards = document.querySelectorAll('[data-unit="seconds"] .flip-card');
const millisText = document.querySelector('[data-unit="milliseconds"]');
const flipCards = document.querySelectorAll(".flip-card");

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

function pad(value, size) {
  return String(value).padStart(size, "0");
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
  const didRender = renderDuration(remaining, force);

  if (!didRender) {
    if (isRunning && activeMode === "timer") {
      stopwatchFrame = requestAnimationFrame(() => renderTimer(false));
    }
    return;
  }

  if (remaining <= 0) {
    isRunning = false;
    timerRemainingBeforeStart = 0;
    cancelAnimationFrame(stopwatchFrame);
    startButton.hidden = false;
    stopButton.hidden = true;
    void releaseWakeLock("timer complete");
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

presetButtons.forEach((button) => {
  button.addEventListener("click", () => setTimerDuration(button.dataset.minutes));
});

customMinutesInput.addEventListener("input", () => setTimerDuration(customMinutesInput.value));
customMinutesInput.addEventListener("change", () => setTimerDuration(customMinutesInput.value));

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
setWakeIndicator(wakeLockSupported ? "idle" : "warning", wakeLockSupported ? "Screen Awake: Off" : "Wake Lock Unsupported");
