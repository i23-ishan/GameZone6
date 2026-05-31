document.addEventListener("DOMContentLoaded", () => {
    const playerNameDisplay = document.getElementById('playerNameDisplay');
    const savedName = localStorage.getItem('arcade_player_name');
    if (savedName) {
        playerNameDisplay.innerHTML = `👤 ${savedName}`;
        playerNameDisplay.style.display = 'inline-block';
    }
});

const gameArea = document.getElementById('gameArea');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const startScreen = document.getElementById('startScreen');
const screenTitle = document.getElementById('screenTitle');
const screenMsg = document.getElementById('screenMsg');
const pauseOverlay = document.getElementById('pauseOverlay');

let score = 0;
let level = 1;
let isPaused = false;
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let canFlip = true;
let gameActive = false;

// --- අලුතෙන් දාපු Sounds ටික ---
const flipSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
const matchSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
const winSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');

// සද්ද වල Volume එක පොඩ්ඩක් අඩු කළා කනට අමාරු නැති වෙන්න
flipSound.volume = 0.5;
matchSound.volume = 0.7;
winSound.volume = 0.8;

const items = ['🍎', '🚀', '👽', '🎮', '🏎️', '💎', '🔥', '🌟', '🍔', '👻', '⚽', '🎸'];

document.addEventListener('keydown', (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        togglePause();
    }
});

function togglePause() {
    if (!gameActive) return;

    isPaused = !isPaused;
    if (isPaused) {
        pauseOverlay.style.display = 'flex';
        canFlip = false;
    } else {
        pauseOverlay.style.display = 'none';
        canFlip = true;
    }
}

function startGame() {
    startScreen.style.display = 'none';
    score = 0;
    level = 1;
    scoreDisplay.innerText = score;
    levelDisplay.innerText = level;
    isPaused = false;
    gameActive = true;
    pauseOverlay.style.display = 'none';
    
    const startBtn = startScreen.querySelector('button');
    startBtn.innerText = "Start Game";
    startBtn.onclick = startGame;

    loadLevel();
}

function loadLevel() {
    gameArea.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;
    canFlip = true;

    let columns = 4;
    if (level === 1) { totalPairs = 2; columns = 2; }
    else if (level === 2) { totalPairs = 4; columns = 4; }
    else if (level === 3) { totalPairs = 6; columns = 4; }
    else if (level === 4) { totalPairs = 8; columns = 4; }
    else { totalPairs = 10; columns = 5; }

    gameArea.style.gridTemplateColumns = `repeat(${columns}, auto)`;

    let levelItems = items.slice(0, totalPairs);
    let cardDeck = [...levelItems, ...levelItems]; 
    
    cardDeck.sort(() => Math.random() - 0.5);

    cardDeck.forEach((item) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = item;
        card.innerHTML = `
            <div class="back">❓</div>
            <div class="front">${item}</div>
        `;
        card.addEventListener('click', () => flipCard(card));
        gameArea.appendChild(card);
    });
}

function flipCard(card) {
    if (!canFlip || isPaused || card.classList.contains('flipped') || flippedCards.includes(card)) return;

    // කාඩ් එක හරවන සද්දෙ ප්ලේ කරනවා
    flipSound.currentTime = 0; 
    flipSound.play();

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        canFlip = false;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.value === card2.dataset.value) {
        // කාඩ් දෙක ගැලපෙන සද්දෙ ප්ලේ කරනවා
        matchSound.currentTime = 0;
        matchSound.play();

        score += 20;
        scoreDisplay.innerText = score;
        matchedPairs++;
        flippedCards = [];
        canFlip = true;

        if (matchedPairs === totalPairs) {
            setTimeout(levelUp, 800);
        }
    } else {
        setTimeout(() => {
            // කාඩ් දෙක ආයෙත් අනිත් පැත්ත හරවන සද්දෙ 
            flipSound.currentTime = 0;
            flipSound.play();
            
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            canFlip = true;
        }, 1000);
    }
}

function levelUp() {
    // ලෙවල් පාස් වුණාම එන සද්දෙ ප්ලේ කරනවා
    winSound.currentTime = 0;
    winSound.play();

    level++;
    levelDisplay.innerText = level;
    score += 50; 
    scoreDisplay.innerText = score;
    gameActive = false;
    
    screenTitle.innerText = "Level Complete! 🎉";
    screenTitle.style.color = "#22c55e";
    screenMsg.innerHTML = `Awesome! Get ready for Level ${level}.`;
    startScreen.style.display = "flex";
    
    const startBtn = startScreen.querySelector('button');
    startBtn.innerText = "Next Level";
    startBtn.onclick = () => {
        startScreen.style.display = 'none';
        gameActive = true;
        loadLevel();
    };
}