// --- ADD THIS AT THE TOP OF YOUR SCRIPT.JS ---
document.addEventListener("DOMContentLoaded", () => {
    const playerNameDisplay = document.getElementById('playerNameDisplay');
    const savedName = localStorage.getItem('arcade_player_name');
    
    // User නමක් දීලා තියෙනවා නම් ඒක Header එකේ පෙන්නනවා
    if (savedName) {
        playerNameDisplay.innerHTML = `👤 ${savedName}`;
        playerNameDisplay.style.display = 'inline-block';
    }
});
// ----------------------------------------------

// --- අලුතෙන් දාපු Car Game Sounds ---
const crashSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1723/1723-preview.mp3');
crashSound.volume = 0.8;
const levelUpSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
levelUpSound.volume = 0.7;
// --------------------------------------

const gameArea = document.getElementById('gameArea');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const startScreen = document.getElementById('startScreen');

let player = { speed: 5, score: 0, level: 1, isPlaying: false };
let keys = { ArrowLeft: false, ArrowRight: false };
let animationId;
let isPaused = false; 

// Input tracking 
document.addEventListener('keydown', (e) => {
    if (e.code === "Space") {
        e.preventDefault(); 
        togglePause();
    } else {
        keys[e.key] = true;
    }
});
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Pause / Resume Function 
function togglePause() {
    if (!player.isPlaying) return; 

    isPaused = !isPaused;
    const pauseOverlay = document.getElementById('pauseOverlay');

    if (isPaused) {
        cancelAnimationFrame(animationId); 
        if (pauseOverlay) pauseOverlay.style.display = 'flex'; 
    } else {
        if (pauseOverlay) pauseOverlay.style.display = 'none'; 
        animationId = requestAnimationFrame(gameLoop); 
    }
}

function startGame() {
    startScreen.classList.add('hide');
    startScreen.style.display = 'none';
    
    isPaused = false;
    const pauseOverlay = document.getElementById('pauseOverlay');
    if (pauseOverlay) pauseOverlay.style.display = 'none';

    gameArea.innerHTML = ''; 
    
    player.isPlaying = true;
    player.score = 0;
    player.level = 1;
    player.speed = 5;
    
    // Create road lines
    for(let i = 0; i < 5; i++) {
        let line = document.createElement('div');
        line.setAttribute('class', 'line');
        line.y = (i * 150);
        line.style.top = line.y + "px";
        gameArea.appendChild(line);
    }
    
    // Create Player Car
    let car = document.createElement('div');
    car.setAttribute('class', 'car');
    gameArea.appendChild(car);
    player.x = car.offsetLeft;
    player.y = car.offsetTop;

    // Create Enemies
    for(let i = 0; i < 3; i++) {
        let enemy = document.createElement('div');
        enemy.setAttribute('class', 'enemy');
        enemy.y = ((i + 1) * 350) * -1;
        enemy.style.top = enemy.y + "px";
        enemy.style.left = Math.floor(Math.random() * 350) + "px";
        gameArea.appendChild(enemy);
    }
    
    animationId = requestAnimationFrame(gameLoop);
}

function checkCollision(car, enemy) {
    let cRect = car.getBoundingClientRect();
    let eRect = enemy.getBoundingClientRect();
    return !((cRect.top > eRect.bottom) || (cRect.bottom < eRect.top) || 
             (cRect.right < eRect.left) || (cRect.left > eRect.right));
}

function gameOver() {
    // --- කාර් එක හැප්පෙද්දි සද්දෙ ප්ලේ වෙනවා ---
    crashSound.currentTime = 0;
    crashSound.play();

    player.isPlaying = false;
    cancelAnimationFrame(animationId);
    
    // Save High Score 
    const currentHighScore = localStorage.getItem('highscore_car-racing') || 0;
    if(player.score > currentHighScore) {
        localStorage.setItem('highscore_car-racing', player.score);
    }

    startScreen.style.display = 'flex';
    
    startScreen.innerHTML = `
        <div class="overlay-content">
            <h2 style="color: #ef4444; font-size: 2.5rem; text-shadow: 0 0 15px rgba(239, 68, 68, 0.5);">CRASHED!</h2>
            <p style="font-size: 1.2rem; color: #fff; margin-bottom: 20px;">Final Score: <span style="color: #facc15; font-weight: bold;">${player.score}</span></p>
            <button onclick="startGame()" class="glow-btn">Restart Engine</button>
        </div>
    `;
}

function gameLoop() {
    if(!player.isPlaying) return;

    let car = document.querySelector('.car');
    
    // Move lines
    let lines = document.querySelectorAll('.line');
    lines.forEach(line => {
        if(line.y >= 700) line.y -= 750;
        line.y += player.speed;
        line.style.top = line.y + "px";
    });

    // Move enemies
    let enemies = document.querySelectorAll('.enemy');
    enemies.forEach(enemy => {
        if(checkCollision(car, enemy)) { gameOver(); }

        if(enemy.y >= 750) {
            enemy.y = -300;
            enemy.style.left = Math.floor(Math.random() * 350) + "px";
        }
        enemy.y += player.speed;
        enemy.style.top = enemy.y + "px";
    });

    // Move player
    if(keys.ArrowLeft && player.x > 0) player.x -= 5;
    if(keys.ArrowRight && player.x < 350) player.x += 5;
    car.style.left = player.x + "px";

    // Scoring & Leveling
    player.score++;
    scoreDisplay.innerText = player.score;
    
    if(player.score % 1000 === 0) {
        player.level++;
        player.speed++; 
        levelDisplay.innerText = player.level;
        
        // --- ලෙවල් අප් වෙද්දි සද්දෙ ප්ලේ වෙනවා ---
        levelUpSound.currentTime = 0;
        levelUpSound.play();
    }

    animationId = requestAnimationFrame(gameLoop);
}

// Mobile Button Controls Integration
function moveLeft() { keys.ArrowLeft = true; }
function moveRight() { keys.ArrowRight = true; }
function stopMove() { keys.ArrowLeft = false; keys.ArrowRight = false; }