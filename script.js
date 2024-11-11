const game = document.getElementById('game');
const player = document.getElementById('player');
const gameWidth = game.offsetWidth;
let playerPosition = gameWidth / 2 - player.offsetWidth / 2;
let blocks = [];
let gameInterval;
let blockInterval;
let isGameOver = false;
let score = 0;
let level = 1;
let lives = 3;
let speedBoostActive = false;
let slowMotionActive = false;

// Set player initial position
player.style.left = `${playerPosition}px`;

// Display score, lives, and level
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');

// Array of colors for each level
const backgroundColors = [
  '#282C34', '#34495E', '#1ABC9C', '#3498DB', '#9B59B6', 
  '#E67E22', '#E74C3C', '#F1C40F', '#2ECC71', '#95A5A6'
];

function updateDisplay() {
  scoreDisplay.textContent = `Score: ${score} | Level: ${level}`;
  livesDisplay.textContent = `Lives: ${lives}`;
}
updateDisplay();

// Create an AudioContext for Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to play beep sound
function playBeep() {
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'square'; // Use a square wave for the beep sound
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // 1000 Hz frequency
  oscillator.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1); // Play sound for 0.1 second (short beep)
}

// Move player with arrow keys
document.addEventListener('keydown', (e) => {
  if (isGameOver) return;
  let step = speedBoostActive ? 20 : 10; // Increase speed with boost
  if (e.key === 'ArrowLeft' && playerPosition > 0) {
    playerPosition -= step;
  } else if (e.key === 'ArrowRight' && playerPosition < gameWidth - player.offsetWidth) {
    playerPosition += step;
  }
  player.style.left = `${playerPosition}px`;

  // Speed boost on Space key
  if (e.key === ' ' && !speedBoostActive) {
    activateSpeedBoost();
  }
});

// Function to create and drop blocks with random hazards and power-ups
function createBlock() {
  // Create more blocks at once to make it harder
  const blockCount = Math.min(level, 5); // Create up to 5 blocks at once

  for (let i = 0; i < blockCount; i++) {
    const block = document.createElement('div');
    block.classList.add('block');

    // 10% chance for a special hazard (bomb)
    if (Math.random() < 0.1) {
      block.classList.add('hazard');
    }

    // 10% chance for a power-up (shield or slow-motion)
    if (Math.random() < 0.1) {
      block.classList.add(Math.random() < 0.5 ? 'shield' : 'slow-motion');
    }

    block.style.left = `${Math.random() * (gameWidth - 30)}px`;
    game.appendChild(block);
    blocks.push(block);
  }
}

// Move blocks downward
function moveBlocks() {
  blocks.forEach((block, index) => {
    const blockTop = block.offsetTop;
    const speed = slowMotionActive ? 2 : 5; // Slow down if slow motion is active

    if (blockTop > game.offsetHeight) {
      block.remove();
      blocks.splice(index, 1);
      score += 10; // Increase score when block passes
      if (score % 100 === 0) increaseLevel(); // Level up every 100 points
    } else {
      block.style.top = `${blockTop + speed}px`;
    }

    // Check collision with player
    if (
      blockTop + block.offsetHeight >= game.offsetHeight - player.offsetHeight &&
      block.offsetLeft < playerPosition + player.offsetWidth &&
      block.offsetLeft + block.offsetWidth > playerPosition
    ) {
      if (block.classList.contains('hazard')) {
        loseLife(); // Hit by hazard
      } else if (block.classList.contains('shield')) {
        gainLife();
      } else if (block.classList.contains('slow-motion')) {
        activateSlowMotion();
      } else {
        loseLife(); // Hit by regular block
      }
    }
  });
}

// Increase game level
function increaseLevel() {
  level++;
  clearInterval(blockInterval);

  // Reduce the interval to create more blocks, and increase frequency
  blockInterval = setInterval(createBlock, Math.max(1000 - level * 80, 500)); // Decrease interval for more blocks

  updateBackgroundColor(); // Call function to update background color
  updateDisplay();
}

// Change background color based on the current level
function updateBackgroundColor() {
  const colorIndex = (level - 1) % backgroundColors.length; // Loop through colors
  game.style.backgroundColor = backgroundColors[colorIndex];
}

// Lose a life
function loseLife() {
  lives--;
  updateDisplay();
  playBeep(); // Play the beep sound when the player loses a life

  if (lives <= 0) endGame();
}

// Gain a life through shield power-up
function gainLife() {
  lives++;
  updateDisplay();
}

// Activate speed boost
function activateSpeedBoost() {
  speedBoostActive = true;
  setTimeout(() => speedBoostActive = false, 3000); // Speed boost for 3 seconds
}

// Activate slow motion power-up
function activateSlowMotion() {
  slowMotionActive = true;
  setTimeout(() => slowMotionActive = false, 3000); // Slow motion for 3 seconds
}

// End game function
function endGame() {
  clearInterval(gameInterval);
  clearInterval(blockInterval);
  isGameOver = true;
  alert(`Game Over! Final Score: ${score}`);
}

// Start the game
function startGame() {
  gameInterval = setInterval(moveBlocks, 20);
  blockInterval = setInterval(createBlock, 1000); // Blocks fall every second initially
  updateBackgroundColor(); // Set initial background color
}
  
startGame();
