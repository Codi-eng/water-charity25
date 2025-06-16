// Game state variables
let score = 0;
let timeLeft = 30;
let level = 1;
let gameInterval, timerInterval;
let gameActive = false;

// DOM element references
const bucket = document.getElementById('bucket');
const gameArea = document.querySelector('.game-area');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const popup = document.getElementById('popup');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const kidsImage = document.getElementById('kidsImage');
const failMessage = document.getElementById('failMessage');
const transformLife = document.getElementById('transformLife');
const restartBtnLevel2 = document.getElementById('restartBtnLevel2');
const startOverlay = document.getElementById('startOverlay');
const startBtn = document.getElementById('startBtn');

let bucketOriginalWidth = 80; // px
let bucketMinWidth = 40; // px

// Listen for keyboard arrow key presses to move the bucket left or right
document.addEventListener('keydown', (e) => {
  if (!gameActive) return; // Only allow movement when game is active
  let left = parseInt(bucket.style.left) || 0;
  let maxLeft = gameArea.offsetWidth - bucket.offsetWidth;
  if (e.key === 'ArrowLeft') {
    bucket.style.left = Math.max(0, left - 20) + 'px';
  } else if (e.key === 'ArrowRight') {
    bucket.style.left = Math.min(maxLeft, left + 20) + 'px';
  }
});

// Enable bucket movement with mouse or touch
gameArea.addEventListener('mousemove', (e) => {
  if (!gameActive) return;
  moveBucket(e.clientX);
});
gameArea.addEventListener('touchmove', (e) => {
  if (!gameActive) return;
  moveBucket(e.touches[0].clientX);
});

// Move the bucket to follow the cursor/touch position
function moveBucket(clientX) {
  let areaRect = gameArea.getBoundingClientRect();
  let x = clientX - areaRect.left;
  let bucketWidth = bucket.offsetWidth;
  let maxLeft = gameArea.offsetWidth - bucketWidth;
  let newLeft = x - bucketWidth / 2;
  newLeft = Math.max(0, Math.min(newLeft, maxLeft));
  bucket.style.left = newLeft + 'px';
}

// Create a falling drop (clean or dirty) at a random position
function createDrop() {
  const drop = document.createElement('div');
  const isClean = Math.random() > 0.3; // 70% chance clean, 30% dirty
  drop.classList.add('drop', isClean ? 'clean' : 'dirty');
  // Adjust for new drop width (32px)
  drop.style.left = Math.random() * (gameArea.offsetWidth - 32) + 'px';

  gameArea.appendChild(drop);

  // Animate the drop falling down
  let dropInterval = setInterval(() => {
    let top = parseInt(window.getComputedStyle(drop).getPropertyValue('top')) || 0;
    if (top >= (gameArea.clientHeight - 50)) {
      // Check if drop lands in the bucket
      let bucketLeft = parseInt(bucket.style.left);
      let dropLeft = parseInt(drop.style.left);

      if (Math.abs(bucketLeft - dropLeft) < 50) {
        score += isClean ? 10 : -10; // Add or subtract score
        scoreDisplay.innerText = score;
      }
      drop.remove();
      clearInterval(dropInterval);
    } else {
      drop.style.top = top + (level === 2 ? 8 : 5) + 'px'; // Faster in level 2
    }
  }, 30);

  // Only create stones in level 2
  if (level === 2 && Math.random() < 0.2) {
    createStone();
  }
}

// Create a falling stone obstacle
function createStone() {
  const stone = document.createElement('div');
  stone.classList.add('stone');
  stone.style.left = Math.random() * (gameArea.offsetWidth - 32) + 'px';
  stone.style.top = '0px';
  gameArea.appendChild(stone);

  let stoneInterval = setInterval(() => {
    let top = parseInt(window.getComputedStyle(stone).getPropertyValue('top')) || 0;
    if (top >= (gameArea.clientHeight - 50)) {
      // Check collision with bucket
      let bucketLeft = parseInt(bucket.style.left) || 0;
      let bucketWidth = bucket.offsetWidth;
      let stoneLeft = parseInt(stone.style.left);

      // Collision detection
      if (
        stoneLeft + 32 > bucketLeft &&
        stoneLeft < bucketLeft + bucketWidth
      ) {
        // Reduce bucket size by 15% (but not below min width)
        let newWidth = Math.max(bucketMinWidth, Math.floor(bucket.offsetWidth * 0.85));
        updateBucketWidth(newWidth);

        // Add shake effect
        bucket.classList.add('bucket-shake');
        setTimeout(() => {
          bucket.classList.remove('bucket-shake');
        }, 400); // Match the animation duration
      }
      stone.remove();
      clearInterval(stoneInterval);
    } else {
      stone.style.top = top + (level === 2 ? 8 : 5) + 'px';
    }
  }, 30);
}

// Update bucket width and CSS variable
function updateBucketWidth(newWidth) {
  bucket.style.width = newWidth + 'px';
  bucket.style.setProperty('--bucket-width', newWidth + 'px');
}

// Start or restart the game
function startGame() {
  score = 0;
  timeLeft = 30;
  scoreDisplay.innerText = score;
  timeDisplay.innerText = timeLeft;
  popup.style.display = 'none';
  nextLevelBtn.classList.add('d-none');

  gameActive = true; // Enable controls

  // Reset bucket size and center it at the start
  updateBucketWidth(bucketOriginalWidth);
  bucket.style.left = (gameArea.clientWidth - bucket.offsetWidth) / 2 + 'px';

  gameInterval = setInterval(createDrop, 700); // Drops fall every 700ms
  timerInterval = setInterval(() => {
    timeLeft--;
    timeDisplay.innerText = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  if (startOverlay) startOverlay.style.display = 'none';
}

// End the game and show popup
function endGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  gameActive = false; // Disable controls
  finalScoreDisplay.innerText = score;
  popup.style.display = 'block';

  // Hide all optional popup elements by default
  if (kidsImage) kidsImage.style.display = 'none';
  if (failMessage) failMessage.style.display = 'none';
  if (transformLife) transformLife.style.display = 'none';
  const popupScore = document.getElementById('popupScore');
  if (popupScore) popupScore.style.display = 'block';
  if (restartBtn) restartBtn.style.display = '';
  if (nextLevelBtn) nextLevelBtn.style.display = '';

  // Level 1 logic
  if (score >= 200 && level === 1) {
    nextLevelBtn.classList.remove('d-none');
    triggerConfetti();
  } else if (score < 200 && level === 1) {
    if (kidsImage) kidsImage.style.display = 'block';
    if (failMessage) failMessage.style.display = 'block';
  }

  // Level 2 logic: only show donation link and restart at the end of the game
  if (level === 2) {
    if (transformLife) transformLife.style.display = 'block';
    if (popupScore) popupScore.style.display = 'none';
    if (kidsImage) kidsImage.style.display = 'none';
    if (failMessage) failMessage.style.display = 'none';
    if (restartBtn) restartBtn.style.display = 'none';
    if (nextLevelBtn) nextLevelBtn.style.display = 'none';
  }
}

// Function to trigger confetti (visual effect)
function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

// Function to show the "Level 2" button in popup
function showNextLevelButton() {
  finalScoreDisplay.innerText = score;
  nextLevelBtn.classList.remove('d-none');
  popup.style.display = 'block';
}

// Event listener for "Level 2" button
nextLevelBtn.addEventListener('click', () => {
  // Logic to transition to Level 2
  score = 0;
  scoreDisplay.innerText = score;
  popup.style.display = 'none';
  nextLevelBtn.classList.add('d-none');
  startLevel2();
});

// Function to start Level 2 (placeholder for custom logic)
function startLevel2() {
  console.log('Level 2 started!');
  // ...add Level 2 game logic...
}

// Restart button resets to level 1
restartBtn.addEventListener('click', () => {
  level = 1;
  startGame();
});

// Next level button sets level to 2 and restarts game
nextLevelBtn.addEventListener('click', () => {
  level = 2;
  startGame();
});

// Add event listener for the new restart button in level 2 popup
document.addEventListener('DOMContentLoaded', () => {
  const restartBtnLevel2 = document.getElementById('restartBtnLevel2');
  if (restartBtnLevel2) {
    restartBtnLevel2.addEventListener('click', () => {
      level = 1;
      startGame();
      if (transformLife) transformLife.style.display = 'none';
    });
  }

  // Ensure the Transform Life link opens in a new tab (for robustness)
  const transformLifeLink = document.querySelector('#transformLife a');
  if (transformLifeLink) {
    transformLifeLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.open(this.href, '_blank');
    });
  }
});

// Prevent game from starting automatically
window.onload = function() {
  if (startOverlay) startOverlay.style.display = 'flex';
};

// Start game when start button is clicked
if (startBtn) {
  startBtn.addEventListener('click', () => {
    if (startOverlay) startOverlay.style.display = 'none';
    startGame();
  });
}

// Add animated bubbles to the background
function createBubble() {
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const size = Math.random() * 40 + 20;
  bubble.style.width = size + 'px';
  bubble.style.height = size + 'px';
  bubble.style.left = Math.random() * 100 + 'vw';
  bubble.style.animationDuration = (6 + Math.random() * 6) + 's';
  document.body.appendChild(bubble);
  setTimeout(() => bubble.remove(), 12000);
}
setInterval(createBubble, 700);
