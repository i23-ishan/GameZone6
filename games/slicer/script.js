document.addEventListener("DOMContentLoaded", () => {
    const playerNameDisplay = document.getElementById('playerNameDisplay');
    const savedName = localStorage.getItem('arcade_player_name');
    if (savedName) {
        playerNameDisplay.innerHTML = `👤 ${savedName}`;
        playerNameDisplay.style.display = 'inline-block';
    }
});

// --- Sounds ---
const sliceSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2045/2045-preview.mp3');
sliceSound.volume = 0.6;
const bombSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1723/1723-preview.mp3');
bombSound.volume = 0.8;
const gameOverSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2043/2043-preview.mp3');

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const startScreen = document.getElementById('startScreen');
const screenTitle = document.getElementById('screenTitle');
const screenMsg = document.getElementById('screenMsg');

let animationId;
let gameActive = false;
let score = 0;
let lives = 3;
let fruits = [];
let sliceTrail = [];
let isSlicing = false;
let frameCount = 0;

const fruitEmojis = ['🍉', '🍎', '🍌', '🍍', '🥥', '🥝'];
const bombEmoji = '💣';

// Mouse & Touch Events for slicing
function startSlice(e) { 
    if(!gameActive) return;
    isSlicing = true; 
    sliceTrail = []; 
    addPoint(e); 
}
function stopSlice() { isSlicing = false; sliceTrail = []; }
function drawSlice(e) { 
    if(isSlicing) addPoint(e); 
}

function addPoint(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    // Scale coordinates if canvas is resized by CSS
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    sliceTrail.push({ x: x * scaleX, y: y * scaleY });
    if(sliceTrail.length > 10) sliceTrail.shift(); // Trail එක දිග වැඩිවෙන එක නවත්තනවා
}

canvas.addEventListener('mousedown', startSlice);
canvas.addEventListener('mousemove', drawSlice);
canvas.addEventListener('mouseup', stopSlice);
canvas.addEventListener('mouseleave', stopSlice);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startSlice(e); }, {passive: false});
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); drawSlice(e); }, {passive: false});
canvas.addEventListener('touchend', stopSlice);

class Fruit {
    constructor() {
        this.isBomb = Math.random() < 0.15; // 15% චාන්ස් එකක් තියෙනවා බෝම්බයක් වෙන්න
        this.emoji = this.isBomb ? bombEmoji : fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
        this.x = Math.random() * (canvas.width - 60) + 30;
        this.y = canvas.height + 50;
        this.vx = (Math.random() - 0.5) * 4; // වමට දකුණට යන වේගය
        this.vy = -(Math.random() * 4 + 10); // උඩට විසිවෙන වේගය
        this.gravity = 0.2;
        this.size = 40;
        this.sliced = false;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
}

function spawnFruit() {
    if (frameCount % 60 === 0) {
        let count = Math.floor(Math.random() * 3) + 1; // පලතුරු 1ත් 3ත් අතර ගාණක් එක පාර එනවා
        for(let i=0; i<count; i++) fruits.push(new Fruit());
    }
}

function updateLivesDisplay() {
    livesDisplay.innerText = '❤️'.repeat(lives);
    if(lives <= 0) gameOver();
}

function startGame() {
    startScreen.style.display = 'none';
    score = 0;
    lives = 3;
    fruits = [];
    sliceTrail = [];
    frameCount = 0;
    gameActive = true;
    scoreDisplay.innerText = score;
    updateLivesDisplay();
    animationId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameActive = false;
    cancelAnimationFrame(animationId);
    gameOverSound.currentTime = 0;
    gameOverSound.play();

    const currentHighScore = localStorage.getItem('highscore_slicer') || 0;
    if (score > currentHighScore) localStorage.setItem('highscore_slicer', score);

    screenTitle.innerText = "GAME OVER";
    screenTitle.style.color = "#ef4444";
    screenMsg.innerHTML = `Your Score: <strong style="color:#facc15">${score}</strong>`;
    startScreen.style.display = 'flex';
    startScreen.querySelector('button').innerText = "Play Again";
}

function gameLoop() {
    if (!gameActive) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    spawnFruit();

    // Update & Draw Fruits
    for (let i = fruits.length - 1; i >= 0; i--) {
        let f = fruits[i];
        f.update();
        f.draw();

        // Check if fruit fell down
        if (f.y > canvas.height + 100 && !f.sliced) {
            if (!f.isBomb) {
                lives--;
                updateLivesDisplay();
            }
            fruits.splice(i, 1);
            continue;
        }

        // Check Slicing Collision
        if (isSlicing && sliceTrail.length > 1 && !f.sliced) {
            let lastPoint = sliceTrail[sliceTrail.length - 1];
            let dist = Math.hypot(f.x - lastPoint.x, f.y - lastPoint.y);
            
            if (dist < f.size) { // කඩුව පලතුරේ වැදුනා!
                f.sliced = true;
                
                if (f.isBomb) {
                    bombSound.currentTime = 0;
                    bombSound.play();
                    gameOver();
                    return;
                } else {
                    sliceSound.currentTime = 0;
                    sliceSound.play();
                    score += 10;
                    scoreDisplay.innerText = score;
                    
                    // කපපු ගමන් ඒක මැකෙන්න හදලා තියෙනවා (Effect එක)
                    fruits.splice(i, 1);
                }
            }
        }
    }

    // Draw Slice Trail (කඩුවෙන් කපන පාර)
    if (isSlicing && sliceTrail.length > 0) {
        ctx.beginPath();
        ctx.moveTo(sliceTrail[0].x, sliceTrail[0].y);
        for (let i = 1; i < sliceTrail.length; i++) {
            ctx.lineTo(sliceTrail[i].x, sliceTrail[i].y);
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
    }

    animationId = requestAnimationFrame(gameLoop);
}