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

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  coins = 0;
  timeLeft = 30;
  document.getElementById("score").textContent = score;
  document.getElementById("coins-count").textContent = coins;
  document.getElementById("time").textContent = timeLeft;

  // Remove any existing game over popup
  const oldPopup = document.getElementById("game-over-popup");
  if (oldPopup) oldPopup.remove();

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);

  // Create coins every 5 seconds
  coinMaker = setInterval(createCoin, 5000);

  // Create black drops every 2.5 seconds
  blackDropMaker = setInterval(createBlackDrop, 2500);

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

  // Show game over popup
  showGameOverPopup();
}

// Show a popup in the center of the game container
function showGameOverPopup() {
  const popup = document.createElement("div");
  popup.id = "game-over-popup";
  popup.style.position = "absolute";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "#fff";
  popup.style.padding = "40px 60px";
  popup.style.borderRadius = "12px";
  popup.style.fontSize = "2rem";
  popup.style.fontWeight = "bold";
  popup.style.color = "#8BD1CB";
  popup.style.boxShadow = "0 4px 24px rgba(0,0,0,0.18)";
  popup.style.zIndex = "100";
  popup.style.display = "flex";
  popup.style.flexDirection = "column";
  popup.style.alignItems = "center";

  // Game Over text
  const overText = document.createElement("div");
  overText.textContent = "Game Over";
  popup.appendChild(overText);

  // High Score display
  const highScoreDiv = document.createElement("div");
  highScoreDiv.style.fontSize = "1.2rem";
  highScoreDiv.style.color = "#2E9DF7";
  highScoreDiv.style.marginTop = "18px";
  highScoreDiv.textContent = `High Score: ${highScore}`;
  popup.appendChild(highScoreDiv);

  // Add Replay button
  const replayBtn = document.createElement("button");
  replayBtn.textContent = "Replay";
  replayBtn.style.marginTop = "24px";
  replayBtn.style.padding = "10px 28px";
  replayBtn.style.fontSize = "1.2rem";
  replayBtn.style.background = "#8BD1CB";
  replayBtn.style.color = "#fff";
  replayBtn.style.border = "none";
  replayBtn.style.borderRadius = "6px";
  replayBtn.style.cursor = "pointer";
  replayBtn.style.fontWeight = "bold";
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
