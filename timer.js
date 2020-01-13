const StartButtonState = Object.freeze({
  START: "start",
  PAUSE: "pause"
});

const Modes = Object.freeze({
  POMODORO: "pomodoro",
  BREAK: "break",
  LONGBREAK: "longbreak"
});

const POMODOROS_UNTIL_LONGBREAK = 4;

const bell = document.querySelector("audio");
const durationContainer = document.querySelector("#duration-container");
const durationButtons = Array.from(
  durationContainer.querySelectorAll(".change-duration")
);
const startButton = document.querySelector("#start-pause");
const resetButton = document.querySelector("#reset");
const timer = document.querySelector("#timer");
const title = document.querySelector("title");

let tickingInterval;
let isTicking = false;
let numPomodoros = 0;
let currentMode = Modes.POMODORO;

let modeLengths = {
  pomodoro: "25:00",
  break: "5:00",
  longbreak: "10:00"
};

function updateMode() {
  if (currentMode === Modes.POMODORO) {
    numPomodoros++;
    if (numPomodoros % POMODOROS_UNTIL_LONGBREAK === 0) {
      currentMode = Modes.LONGBREAK;
      return;
    }
    currentMode = Modes.BREAK;
    return;
  }
  currentMode = Modes.POMODORO;
}

function tickTimer() {
  let [minutes, seconds] = timer.textContent.split(":");

  if (minutes === "00" && seconds === "00") {
    bell.play();
    clearInterval(tickingInterval);
    updateMode();
    setDisplay(startButton, "none");
    resetTimer();
    return;
  }

  minutes = +minutes;
  seconds = +seconds;

  if (seconds > 0) {
    seconds--;
  } else {
    minutes--;
    seconds = 59;
  }

  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  let timeRemaining = `${minutes}:${seconds}`;
  timer.textContent = timeRemaining;
  title.textContent = `(${timeRemaining}) - Pomodoro Timer`;
}

function startOrPauseTimer() {
  if (isTicking) {
    clearInterval(tickingInterval);
  } else {
    tickingInterval = setInterval(tickTimer, 1000);
    setDisplay(durationContainer, "none");
  }
  isTicking = !isTicking;
}

function resetTimer() {
  isTicking = false;
  clearInterval(tickingInterval);
  setStartButtonState(StartButtonState.START);
  title.textContent = "Pomodoro Timer";
}

function setStartButtonState(state) {
  startButton.classList = "";
  startButton.classList.add(state);
  startButton.textContent = state;
}

function switchStartButtonState() {
  if (startButton.classList.contains(StartButtonState.START)) {
    setStartButtonState(StartButtonState.PAUSE);
  } else {
    setStartButtonState(StartButtonState.START);
  }
}

function setDisplay(element, display) {
  element.style.display = display;
}

function changeModeDuration(button) {
  let increment = button.getAttribute("value") === "+";
  let modeToChange = button.getAttribute("data-for-mode");

  let currentDurationDiv = document.querySelector(`#${modeToChange + "-min"}`);
  let currentDuration = currentDurationDiv.textContent;
  if (!increment && currentDuration === "1") {
    return;
  }

  if (increment) {
    currentDuration = +currentDuration + 1;
  } else {
    currentDuration = +currentDuration - 1;
  }

  currentDurationDiv.textContent = currentDuration;

  let durationMinutes =
    currentDuration < 10 ? "0" + currentDuration : currentDuration;
  let durationString = `${durationMinutes}:00`;
  modeLengths[modeToChange] = durationString;

  if (currentMode == modeToChange) {
    timer.textContent = durationString;
  }
}

startButton.addEventListener("click", () => {
  startOrPauseTimer();
  switchStartButtonState();
});

resetButton.addEventListener("click", () => {
  bell.pause();
  bell.currentTime = 0;
  resetTimer();
  setDisplay(startButton, "inline-block");
  setDisplay(durationContainer, "grid");
  timer.textContent = modeLengths[currentMode];
});

durationButtons.forEach(button => {
  button.addEventListener("click", e => changeModeDuration(e.target));
});
