// --- අලුතෙන් දාපු Snake Game Sounds ---
const eatSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3');
eatSound.volume = 0.6;
const gameOverSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2043/2043-preview.mp3');
gameOverSound.volume = 0.8;
// ----------------------------------------

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const startScreen = document.getElementById("startScreen");
const pauseOverlay = document.getElementById("pauseOverlay");
const screenTitle = document.getElementById("screenTitle");
const screenMsg = document.getElementById("screenMsg");

const box = 20; 
let snake, food, d, score, level, gameInterval, speed;
let isPaused = false;

// Fix for canvas drawing scaling properly with responsive CSS
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const cols = canvasWidth / box;
const rows = canvasHeight / box;

// Keyboard Controls
document.addEventListener("keydown", handleKey);
// Allow tapping the pause overlay to resume on mobile
pauseOverlay.addEventListener("click", togglePause);

function handleKey(event) {
    if (event.code === "Space") {
        event.preventDefault(); 
        togglePause();
        return;
    }
    if (!isPaused) {
        if (event.keyCode == 37) setDirection("LEFT");
        else if (event.keyCode == 38) setDirection("UP");
        else if (event.keyCode == 39) setDirection("RIGHT");
        else if (event.keyCode == 40) setDirection("DOWN");
    }
}

// Function used by BOTH keyboard and mobile buttons
function setDirection(newD) {
    if (isPaused) return;
    if (newD === "LEFT" && d !== "RIGHT") d = "LEFT";
    if (newD === "UP" && d !== "DOWN") d = "UP";
    if (newD === "RIGHT" && d !== "LEFT") d = "RIGHT";
    if (newD === "DOWN" && d !== "UP") d = "DOWN";
}

function togglePause() {
    if (!snake || snake.length === 0) return; 

    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameInterval);
        pauseOverlay.style.display = "flex"; 
    } else {
        pauseOverlay.style.display = "none";
        gameInterval = setInterval(draw, speed);
    }
}

function startGame() {
    startScreen.style.display = "none";
    pauseOverlay.style.display = "none";
    
    snake = [];
    snake[0] = { x: Math.floor(cols / 2) * box, y: Math.floor(rows / 2) * box };
    
    generateFood();
    
    score = 0;
    level = 1;
    speed = 200; 
    d = null;
    isPaused = false;
    
    scoreDisplay.innerText = score;
    levelDisplay.innerText = level;
    
    clearInterval(gameInterval);
    gameInterval = setInterval(draw, speed);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * cols) * box,
        y: Math.floor(Math.random() * (rows - 2) + 2) * box 
    };
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) return true;
    }
    return false;
}

function gameOver() {
    // --- ගේම් ඕවර් වෙද්දි සද්දෙ ප්ලේ වෙනවා ---
    gameOverSound.currentTime = 0;
    gameOverSound.play();

    clearInterval(gameInterval);
    snake = [];
    
    const currentHighScore = localStorage.getItem('highscore_snake') || 0;
    if(score > currentHighScore) {
        localStorage.setItem('highscore_snake', score);
    }

    screenTitle.innerText = "Game Over";
    screenTitle.style.color = "#e11d48";
    screenMsg.innerHTML = `Level ${level} reached.<br>Score: <strong>${score}</strong>`;
    startScreen.style.display = "flex";
}

function draw() {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw Snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "#60a5fa" : "#3b82f6"; 
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "#0f172a";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw Food
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    if (snakeX < 0) {
        snakeX = canvasWidth - box;
    } else if (snakeX >= canvasWidth) {
        snakeX = 0;
    }

    if (snakeY < 0) {
        snakeY = canvasHeight - box;
    } else if (snakeY >= canvasHeight) {
        snakeY = 0;
    }

    if (snakeX == food.x && snakeY == food.y) {
        // --- කෑම කද්දි සද්දෙ ප්ලේ වෙනවා ---
        eatSound.currentTime = 0;
        eatSound.play();

        score += 10;
        scoreDisplay.innerText = score;
        
        if (score % 50 === 0) {
            level++;
            levelDisplay.innerText = level;
            
            if (speed > 80) {
                speed -= 10; 
            }
            
            clearInterval(gameInterval);
            gameInterval = setInterval(draw, speed);
        }
        generateFood();
    } else {
        snake.pop(); 
    }

    let newHead = { x: snakeX, y: snakeY };

    if (collision(newHead, snake)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);
}