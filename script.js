// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0;
let coins = 0;
let timerInterval;
let timeLeft = 30;
let coinMaker; // interval for coins
let blackDropMaker; // interval for black drops
let highScore = Number(localStorage.getItem("highScore") || 0);

// Difficulty configurations
const difficultyConfig = {
  easy:   { time: 40, dropInterval: 1200, coinInterval: 6000, blackInterval: 4000, goal: 10 },
  normal: { time: 30, dropInterval: 1000, coinInterval: 5000, blackInterval: 2500, goal: 15 },
  hard:   { time: 20, dropInterval: 700,  coinInterval: 4000, blackInterval: 1500, goal: 20 }
};

let currentGoal = 15; // displayed goal / win target

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  // read and apply difficulty immediately (also updates UI)
  const selected = document.getElementById("difficulty-select").value || "normal";
  const cfg = applyDifficulty(selected);

  gameRunning = true;
  score = 0;
  coins = 0;
  document.getElementById("score").textContent = score;
  document.getElementById("coins-count").textContent = coins;

  // Remove any existing game over popup
  const oldPopup = document.getElementById("game-over-popup");
  if (oldPopup) oldPopup.remove();

  // clear any previous intervals just in case
  clearInterval(dropMaker);
  clearInterval(coinMaker);
  clearInterval(blackDropMaker);
  clearInterval(timerInterval);

  // Create new drops/coins/black drops using cfg returned from applyDifficulty
  dropMaker = setInterval(createDrop, cfg.dropInterval);
  coinMaker = setInterval(createCoin, cfg.coinInterval);
  blackDropMaker = setInterval(createBlackDrop, cfg.blackInterval);

  // Start timer countdown
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// End the game, stop intervals, show popup
function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  clearInterval(coinMaker);
  clearInterval(blackDropMaker);

  // Update high score if needed
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  // Remove all drops and coins
  document.querySelectorAll('.water-drop').forEach(drop => drop.remove());
  document.querySelectorAll('.coin').forEach(coin => coin.remove());
  document.querySelectorAll('.black-drop').forEach(drop => drop.remove());

  // Determine win/lose based on goal
  const won = score >= currentGoal;
  showGameOverPopup(won);
}

// Show a popup in the center of the game container
function showGameOverPopup(won) {
  const popup = document.createElement("div");
  popup.id = "game-over-popup";
  popup.style.position = "absolute";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "#fff";
  popup.style.padding = "28px 40px";
  popup.style.borderRadius = "12px";
  popup.style.fontSize = "1.6rem";
  popup.style.fontWeight = "700";
  popup.style.color = "#131313";
  popup.style.boxShadow = "0 4px 24px rgba(0,0,0,0.18)";
  popup.style.zIndex = "100";
  popup.style.display = "flex";
  popup.style.flexDirection = "column";
  popup.style.alignItems = "center";
  popup.style.gap = "12px";
  popup.style.minWidth = "260px";

  // Result text
  const resultText = document.createElement("div");
  resultText.textContent = won ? "You Win!" : "Game Over";
  resultText.style.color = won ? "#159A48" : "#F5402C";
  resultText.style.fontSize = "1.6rem";
  popup.appendChild(resultText);

  // Score summary
  const summary = document.createElement("div");
  summary.style.fontSize = "1rem";
  summary.style.color = "#333";
  summary.textContent = `Score: ${score}   |   Goal: ${currentGoal}`;
  popup.appendChild(summary);

  // High Score display
  const highScoreDiv = document.createElement("div");
  highScoreDiv.style.fontSize = "0.95rem";
  highScoreDiv.style.color = "#666";
  highScoreDiv.textContent = `High Score: ${highScore}`;
  popup.appendChild(highScoreDiv);

  // Add Replay button
  const replayBtn = document.createElement("button");
  replayBtn.textContent = "Replay";
  replayBtn.style.marginTop = "6px";
  replayBtn.style.padding = "8px 20px";
  replayBtn.style.fontSize = "1rem";
  replayBtn.style.background = "#2E9DF7";
  replayBtn.style.color = "#fff";
  replayBtn.style.border = "none";
  replayBtn.style.borderRadius = "6px";
  replayBtn.style.cursor = "pointer";
  replayBtn.style.fontWeight = "700";
  replayBtn.addEventListener("click", () => {
    popup.remove();
    startGame();
  });

  popup.appendChild(replayBtn);
  document.getElementById("game-container").appendChild(popup);
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });

  // Collision check interval
  const collisionInterval = setInterval(() => {
    if (!document.body.contains(drop)) {
      clearInterval(collisionInterval);
      return;
    }
    if (checkCollision(drop, basket)) {
      drop.remove();
      clearInterval(collisionInterval);
      score++;
      document.getElementById("score").textContent = score;
    }
  }, 20);
}

function createCoin() {
  const coin = document.createElement("div");
  coin.className = "coin";

  // Coin size
  const coinSize = 40;
  coin.style.width = coin.style.height = `${coinSize}px`;

  // Position the coin randomly across the game width
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - coinSize);
  coin.style.left = xPosition + "px";

  // Animate coin fall for 4 seconds
  coin.style.animation = "dropFall 4s linear forwards";

  // Add the coin to the game screen
  document.getElementById("game-container").appendChild(coin);

  // Remove coins that reach the bottom
  coin.addEventListener("animationend", () => {
    coin.remove();
  });

  // Collision check interval
  const collisionInterval = setInterval(() => {
    if (!document.body.contains(coin)) {
      clearInterval(collisionInterval);
      return;
    }
    if (checkCollision(coin, basket)) {
      coin.remove();
      clearInterval(collisionInterval);
      coins++;
      document.getElementById("coins-count").textContent = coins;
    }
  }, 20);
}

function createBlackDrop() {
  const drop = document.createElement("div");
  drop.className = "water-drop black-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove();
  });

  // Collision check interval
  const collisionInterval = setInterval(() => {
    if (!document.body.contains(drop)) {
      clearInterval(collisionInterval);
      return;
    }
    if (checkCollision(drop, basket)) {
      drop.remove();
      clearInterval(collisionInterval);
      score -= 3;
      document.getElementById("score").textContent = score;
    }
  }, 20);
}

// Collision detection between drop and basket
function checkCollision(drop, basket) {
  const dropRect = drop.getBoundingClientRect();
  const basketRect = basket.getBoundingClientRect();
  // Check overlap
  return !(
    dropRect.right < basketRect.left ||
    dropRect.left > basketRect.right ||
    dropRect.bottom < basketRect.top ||
    dropRect.top > basketRect.bottom
  );
}

// Basket movement setup
const basket = document.getElementById("basket");
const gameContainer = document.getElementById("game-container");
let basketX = 0;
const basketWidth = 80; // px
const basketSpeed = 30; // px per key press

// Initialize basket position
function positionBasket() {
  const containerWidth = gameContainer.offsetWidth;
  basketX = (containerWidth - basketWidth) / 2;
  basket.style.width = basketWidth + "px";
  basket.style.left = basketX + "px";
  basket.style.bottom = "0px";
  basket.style.position = "absolute";
  basket.style.height = "30px";
}
positionBasket();

// Listen for arrow key presses to move basket
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  const containerWidth = gameContainer.offsetWidth;
  if (e.key === "ArrowLeft") {
    basketX = Math.max(0, basketX - basketSpeed);
    basket.style.left = basketX + "px";
  } else if (e.key === "ArrowRight") {
    basketX = Math.min(containerWidth - basketWidth, basketX + basketSpeed);
    basket.style.left = basketX + "px";
  }
});

// --- Touch and Mouse Drag Support ---

let isDragging = false;
let dragOffsetX = 0;

// Touch events for mobile
basket.addEventListener("touchstart", (e) => {
  if (!gameRunning) return;
  isDragging = true;
  const touch = e.touches[0];
  const basketRect = basket.getBoundingClientRect();
  dragOffsetX = touch.clientX - basketRect.left;
  e.preventDefault();
});

document.addEventListener("touchmove", (e) => {
  if (!isDragging || !gameRunning) return;
  const touch = e.touches[0];
  const containerRect = gameContainer.getBoundingClientRect();
  let newLeft = touch.clientX - containerRect.left - dragOffsetX;
  newLeft = Math.max(0, Math.min(newLeft, gameContainer.offsetWidth - basketWidth));
  basketX = newLeft;
  basket.style.left = basketX + "px";
});

document.addEventListener("touchend", () => {
  isDragging = false;
});

// Mouse events for desktop
basket.addEventListener("mousedown", (e) => {
  if (!gameRunning) return;
  isDragging = true;
  const basketRect = basket.getBoundingClientRect();
  dragOffsetX = e.clientX - basketRect.left;
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging || !gameRunning) return;
  const containerRect = gameContainer.getBoundingClientRect();
  let newLeft = e.clientX - containerRect.left - dragOffsetX;
  newLeft = Math.max(0, Math.min(newLeft, gameContainer.offsetWidth - basketWidth));
  basketX = newLeft;
  basket.style.left = basketX + "px";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Apply difficulty settings immediately (returns cfg)
function applyDifficulty(selected) {
  const cfg = difficultyConfig[selected] || difficultyConfig.normal;

  // Update goal and UI
  currentGoal = cfg.goal;
  document.getElementById("goal").textContent = currentGoal;

  // If game not running, set the full time; if running, shorten remaining time if new config is smaller
  if (!gameRunning) {
    timeLeft = cfg.time;
  } else {
    timeLeft = Math.min(timeLeft, cfg.time);
  }
  document.getElementById("time").textContent = timeLeft;

  // If game is running, restart spawn intervals with new cadence
  if (gameRunning) {
    clearInterval(dropMaker);
    clearInterval(coinMaker);
    clearInterval(blackDropMaker);

    dropMaker = setInterval(createDrop, cfg.dropInterval);
    coinMaker = setInterval(createCoin, cfg.coinInterval);
    blackDropMaker = setInterval(createBlackDrop, cfg.blackInterval);
  }

  return cfg;
}

// New: listen for difficulty changes and apply immediately
document.getElementById("difficulty-select").addEventListener("change", (e) => {
  applyDifficulty(e.target.value);
});

// Milestone message logic
document.addEventListener('DOMContentLoaded', () => {
  const scoreEl = document.getElementById('score');
  const goalEl = document.getElementById('goal');
  const msgEl = document.getElementById('milestone-message');
  if (!scoreEl || !goalEl || !msgEl) return;

  let shownMilestones = new Set();
  let currentGoal = parseInt(goalEl.textContent, 10) || 0;

  function resetMilestones() {
    shownMilestones.clear();
    currentGoal = parseInt(goalEl.textContent, 10) || 0;
  }

  function showMsg(text) {
    msgEl.textContent = text;
    msgEl.hidden = false;
    msgEl.classList.remove('visible');
    // force reflow to restart animation
    void msgEl.offsetWidth;
    msgEl.classList.add('visible');
    clearTimeout(msgEl._hideTimeout);
    msgEl._hideTimeout = setTimeout(() => {
      msgEl.classList.remove('visible');
      // hide after transition
      setTimeout(() => (msgEl.hidden = true), 320);
    }, 2500);
  }

  function checkMilestones() {
    const score = parseInt(scoreEl.textContent, 10) || 0;
    const goal = parseInt(goalEl.textContent, 10) || 0;
    if (goal <= 0) return;

    // If the goal changed externally, reset tracking
    if (goal !== currentGoal) {
      resetMilestones();
    }

    const pct = score / goal;

    const milestones = [
      { key: '25', reached: pct >= 0.25, text: 'Great start! 25% there.' },
      { key: '50', reached: pct >= 0.5, text: 'Halfway there!' },
      { key: '75', reached: pct >= 0.75, text: 'Almost there! 75% reached.' },
      { key: 'goal', reached: score >= goal, text: 'Goal reached! Well done!' }
    ];

    for (const m of milestones) {
      if (m.reached && !shownMilestones.has(m.key)) {
        shownMilestones.add(m.key);
        showMsg(m.text);
        break; // show one milestone at a time
      }
    }
  }

  // Observe score changes
  const scoreObserver = new MutationObserver(checkMilestones);
  scoreObserver.observe(scoreEl, { characterData: true, childList: true, subtree: true });

  // Observe goal changes to reset milestone tracking
  const goalObserver = new MutationObserver(resetMilestones);
  goalObserver.observe(goalEl, { characterData: true, childList: true, subtree: true });

  // initial check
  checkMilestones();
});
