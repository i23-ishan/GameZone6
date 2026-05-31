document.addEventListener("DOMContentLoaded", () => {
    const playerNameDisplay = document.getElementById('playerNameDisplay');
    const savedName = localStorage.getItem('arcade_player_name');
    if (savedName) {
        playerNameDisplay.innerHTML = `👤 ${savedName}`;
        playerNameDisplay.style.display = 'inline-block';
    }
});

// --- Sounds ---
const shootSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1706/1706-preview.mp3');
shootSound.volume = 0.5;
const explodeSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3');
explodeSound.volume = 0.6;
const gameOverSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2043/2043-preview.mp3');
gameOverSound.volume = 0.8;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const startScreen = document.getElementById('startScreen');
const pauseOverlay = document.getElementById('pauseOverlay');
const screenTitle = document.getElementById('screenTitle');
const screenMsg = document.getElementById('screenMsg');

let animationId;
let isPaused = false;
let gameActive = false;
let score = 0;
let level = 1;
let enemySpeed = 2;

let player = { x: 175, y: 530, w: 50, h: 50, speed: 6, dx: 0 };
let bullets = [];
let enemies = [];

// Controls
document.addEventListener('keydown', (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        togglePause();
    }
    if (!gameActive || isPaused) return;

    if (e.code === "ArrowLeft") player.dx = -player.speed;
    if (e.code === "ArrowRight") player.dx = player.speed;
    if (e.code === "ArrowUp") shoot();
});

document.addEventListener('keyup', (e) => {
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") player.dx = 0;
});

// Mobile Controls
function moveLeft() { player.dx = -player.speed; }
function moveRight() { player.dx = player.speed; }
function stopMove() { player.dx = 0; }

function togglePause() {
    if (!gameActive) return;
    isPaused = !isPaused;
    if (isPaused) {
        cancelAnimationFrame(animationId);
        pauseOverlay.style.display = 'flex';
    } else {
        pauseOverlay.style.display = 'none';
        animationId = requestAnimationFrame(gameLoop);
    }
}

function shoot() {
    if (!gameActive || isPaused) return;
    shootSound.currentTime = 0;
    shootSound.play();
    bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 15, speed: 8 });
}

function spawnEnemy() {
    if (Math.random() < 0.03 + (level * 0.005)) { // ලෙවල් එක වැඩි වෙද්දි සතුරෝ එනවා වැඩියි
        let w = 40;
        let x = Math.random() * (canvas.width - w);
        enemies.push({ x: x, y: -40, w: w, h: 40, speed: enemySpeed + (Math.random() * 2) });
    }
}

function startGame() {
    startScreen.style.display = 'none';
    pauseOverlay.style.display = 'none';
    score = 0;
    level = 1;
    enemySpeed = 2;
    bullets = [];
    enemies = [];
    player.x = 175;
    player.dx = 0;
    gameActive = true;
    isPaused = false;
    scoreDisplay.innerText = score;
    levelDisplay.innerText = level;
    
    animationId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameActive = false;
    cancelAnimationFrame(animationId);
    gameOverSound.currentTime = 0;
    gameOverSound.play();

    const currentHighScore = localStorage.getItem('highscore_shooter') || 0;
    if (score > currentHighScore) {
        localStorage.setItem('highscore_shooter', score);
    }

    screenTitle.innerText = "MISSION FAILED";
    screenTitle.style.color = "#ef4444";
    screenMsg.innerHTML = `You reached Level ${level}.<br>Final Score: <strong style="color:#facc15">${score}</strong>`;
    startScreen.style.display = 'flex';
    startScreen.querySelector('button').innerText = "Try Again";
}

function drawPlayer() {
    ctx.fillStyle = "#00f2fe";
    ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawBullets() {
    ctx.fillStyle = "#facc15"; // Yellow bullets
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
}

function drawEnemies() {
    ctx.fillStyle = "#ef4444"; // Red enemies
    enemies.forEach(e => ctx.fillRect(e.x, e.y, e.w, e.h));
}

function gameLoop() {
    if (!gameActive || isPaused) return;

    // Clear Canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update Player
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

    // Update Bullets
    bullets.forEach((b, index) => {
        b.y -= b.speed;
        if (b.y < 0) bullets.splice(index, 1);
    });

    // Spawn & Update Enemies
    spawnEnemy();
    enemies.forEach((e, index) => {
        e.y += e.speed;

        // Player Crash
        if (e.x < player.x + player.w && e.x + e.w > player.x &&
            e.y < player.y + player.h && e.y + e.h > player.y) {
            gameOver();
        }

        // Enemy reached bottom
        if (e.y > canvas.height) {
            enemies.splice(index, 1);
            score = Math.max(0, score - 5); // සතුරෙක් ගෙදරට ආවොත් ලකුණු 5ක් කැපෙනවා!
            scoreDisplay.innerText = score;
        }
    });

    // Collision Detection (Bullets & Enemies)
    bullets.forEach((b, bIndex) => {
        enemies.forEach((e, eIndex) => {
            if (b.x < e.x + e.w && b.x + b.w > e.x &&
                b.y < e.y + e.h && b.y + b.h > e.y) {
                
                // Boom!
                explodeSound.currentTime = 0;
                explodeSound.play();
                
                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                
                score += 10;
                scoreDisplay.innerText = score;

                // Level Up Logic
                if (score > 0 && score % 100 === 0) {
                    level++;
                    levelDisplay.innerText = level;
                    enemySpeed += 0.5; // සතුරන්ගේ වේගය වැඩි වෙනවා
                }
            }
        });
    });

    drawPlayer();
    drawBullets();
    drawEnemies();

    animationId = requestAnimationFrame(gameLoop);
}