// --- අලුතෙන් එකතු කරපු Sounds ---
// මෙතන තියෙන ලින්ක් එක ඔයාට කැමති එකකට මාරු කරගන්න පුළුවන්
const bgMusic = new Audio('https://assets.mixkit.co/active_storage/sfx/2268/2268-preview.mp3');
bgMusic.loop = true; // සින්දුව ඉවර වුණාම ආයෙත් මුල ඉඳන් ප්ලේ වෙන්න
bgMusic.volume = 0.2; // සද්දෙ ටිකක් අඩු කළා කනට අමාරු නැති වෙන්න

const clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
clickSound.volume = 0.8;

// සයිට් එකේ ඕනෑම බටන් එකක් හරි ලින්ක් එකක් හරි ක්ලික් කරද්දි සද්දෙ එන්න හැදුවා
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.glass-card')) {
        clickSound.currentTime = 0;
        clickSound.play().catch(err => console.log("Sound error blocked by browser"));
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector('.game-grid');
    const loginBtn = document.getElementById('loginBtn');
    const userGreeting = document.getElementById('userGreeting');
    const displayPlayerName = document.getElementById('displayPlayerName');
    const userAvatar = document.getElementById('userAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('loginModal');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const playerNameInput = document.getElementById('playerNameInput');
    const musicToggle = document.getElementById('musicToggle');

    let isMusicPlaying = false;

    // Music Button Click Event
    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (isMusicPlaying) {
                bgMusic.pause();
                musicToggle.innerText = '🔈 Music: OFF';
                musicToggle.style.background = '#475569';
                musicToggle.style.boxShadow = 'none';
            } else {
                bgMusic.play();
                musicToggle.innerText = '🔊 Music: ON';
                musicToggle.style.background = 'linear-gradient(45deg, #8b5cf6, #6d28d9)';
                musicToggle.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.5)';
            }
            isMusicPlaying = !isMusicPlaying;
        });
    }

    // 1. Load Games Function
    function loadGames() {
        if (!grid) return;
        grid.innerHTML = ''; 
        
        gamesConfig.forEach(game => {
            const highScore = localStorage.getItem(`highscore_${game.id}`) || 0;
            const card = document.createElement('div');
            card.className = 'glass-card';
            
            const playButton = game.path === "#" 
                ? `<a href="#" class="play-link" style="background: #475569; pointer-events: none; color: #cbd5e1; box-shadow: none;">Coming Soon</a>` 
                : `<a href="${game.path}" class="play-link">Play Now</a>`;

            card.innerHTML = `
                <div class="card-icon">${game.icon}</div>
                <h3>${game.title}</h3>
                <p>${game.description}</p>
                <div class="score-badge">High Score: <span>${highScore}</span></div>
                ${playButton}
            `;
            grid.appendChild(card);
        });
    }

    // 2. Check Login Status
    function checkLoginStatus() {
        const savedName = localStorage.getItem('arcade_player_name');
        if (savedName) {
            displayPlayerName.innerText = savedName;
            userAvatar.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${savedName}`;
            if(loginBtn) loginBtn.classList.add('hidden');
            if(userGreeting) userGreeting.classList.remove('hidden');
        } else {
            if(loginBtn) loginBtn.classList.remove('hidden');
            if(userGreeting) userGreeting.classList.add('hidden');
        }
    }

    // 3. Button Click Events
    if(loginBtn) loginBtn.addEventListener('click', () => loginModal.classList.remove('hidden'));
    if(closeModalBtn) closeModalBtn.addEventListener('click', () => loginModal.classList.add('hidden'));

    if(saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const name = playerNameInput.value.trim();
            if (name !== "") {
                localStorage.setItem('arcade_player_name', name);
                loginModal.classList.add('hidden');
                checkLoginStatus();
            } else {
                alert("Please enter a username!");
            }
        });
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('arcade_player_name');
            checkLoginStatus();
        });
    }

    // Start Everything
    loadGames();
    checkLoginStatus();
});