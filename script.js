const display = document.querySelector(".display");
const clockDisplay = document.querySelector(".clock-display");
const clockTime = document.querySelector(".clock-time");
const clockDate = document.querySelector(".clock-date");
const controls = document.querySelector("[data-controls]");
const startButton = document.querySelector('[data-action="start"]');
const stopButton = document.querySelector('[data-action="stop"]');
const resetButton = document.querySelector('[data-action="reset"]');
const modeButtons = document.querySelectorAll(".mode-button");
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
let lastRenderedCentiseconds = -1;
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
  if (!isRunning || activeMode !== "stopwatch") {
    return;
  }

  if (!wakeLockSupported) {
    console.warn("[WakeLock] Screen Wake Lock API is not supported in this browser.");
    setWakeIndicator("warning", "Wake Lock Unsupported");
    return;
  }

  if (wakeLock || document.visibilityState !== "visible") {
    return;
  }

  try {
    wakeLock = await navigator.wakeLock.request("screen");
    console.info("[WakeLock] Screen wake lock acquired.");
    setWakeIndicator("active", "Screen Awake");

    wakeLock.addEventListener("release", () => {
      console.info("[WakeLock] Screen wake lock released by browser/system.");
      wakeLock = null;
      if (isRunning && activeMode === "stopwatch" && document.visibilityState === "visible") {
        setWakeIndicator("warning", "Reacquiring Wake Lock");
        void requestWakeLock();
      } else {
        setWakeIndicator("idle", "Screen Awake: Off");
      }
    });
  } catch (error) {
    console.warn("[WakeLock] Failed to acquire screen wake lock.", error);
    wakeLock = null;
    setWakeIndicator("warning", "Wake Lock Failed");
  }
}

async function releaseWakeLock(reason = "manual") {
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

function renderStopwatch(force = false) {
  const elapsed = getElapsed();
  const centiseconds = Math.floor(elapsed / 10);

  if (!force && centiseconds === lastRenderedCentiseconds) {
    if (isRunning && activeMode === "stopwatch") {
      stopwatchFrame = requestAnimationFrame(() => renderStopwatch(false));
    }
    return;
  }

  lastRenderedCentiseconds = centiseconds;

  const hours = Math.floor(elapsed / 3600000) % 100;
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  const millis = Math.floor((elapsed % 1000) / 10);

  setCardPair(hourCards, hours);
  setCardPair(minuteCards, minutes);
  setCardPair(secondCards, seconds);
  millisText.textContent = pad(millis, 2);

  if (isRunning && activeMode === "stopwatch") {
    stopwatchFrame = requestAnimationFrame(() => renderStopwatch(false));
  }
}

function startStopwatch() {
  if (isRunning) {
    return;
  }

  isRunning = true;
  startedAt = performance.now();
  startButton.hidden = true;
  stopButton.hidden = false;
  renderStopwatch(true);
  void requestWakeLock();
}

function stopStopwatch() {
  if (!isRunning) {
    return;
  }

  elapsedBeforeStart = getElapsed();
  isRunning = false;
  cancelAnimationFrame(stopwatchFrame);
  startButton.hidden = false;
  stopButton.hidden = true;
  renderStopwatch(true);
  void releaseWakeLock("paused");
}

function resetStopwatch() {
  elapsedBeforeStart = 0;
  startedAt = performance.now();
  isRunning = false;
  cancelAnimationFrame(stopwatchFrame);
  lastRenderedCentiseconds = -1;
  startButton.hidden = false;
  stopButton.hidden = true;
  renderStopwatch(true);
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
  activeMode = nextMode;
  const isClock = nextMode === "clock";

  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === nextMode);
  });

  display.hidden = isClock;
  controls.hidden = isClock;
  clockDisplay.hidden = !isClock;

  cancelAnimationFrame(clockFrame);
  cancelAnimationFrame(stopwatchFrame);

  if (isClock) {
    void releaseWakeLock("clock mode");
    renderClock();
  } else {
    renderStopwatch(true);
    if (isRunning) {
      void requestWakeLock();
    }
  }
}

startButton.addEventListener("click", startStopwatch);
stopButton.addEventListener("click", stopStopwatch);
resetButton.addEventListener("click", resetStopwatch);

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
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
