const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round-counter");
const sentenceEl = document.getElementById("sentence-display");

// Ajuste dinámico para pantallas de móvil
function resizeCanvas() {
    canvas.width = window.innerWidth < 480 ? window.innerWidth * 0.95 : 480;
    canvas.height = window.innerHeight * 0.6;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let score = 0, currentRound = 1;
const totalRounds = (typeof db !== 'undefined') ? db.length : 10;
let player = { x: canvas.width / 2 - 25, y: canvas.height - 60, w: 50, h: 40 };
let bullets = [], invaders = [], gameActive = true;

function updateHUD() {
    scoreEl.innerText = score;
    if (roundEl) roundEl.innerText = `RD: ${currentRound}/${totalRounds}`;
}

function loadMission() {
    if (typeof db !== 'undefined' && db[currentRound - 1]) {
        sentenceEl.innerText = db[currentRound - 1].s;
        spawnInvaders(db[currentRound - 1].options, db[currentRound - 1].ans);
    }
}

function spawnInvaders(options, answer) {
    invaders = [];
    const spacing = canvas.width / options.length;
    options.forEach((opt, i) => {
        invaders.push({
            x: (i * spacing) + 5,
            y: 20,
            w: spacing - 10,
            h: 35,
            text: opt,
            isCorrect: opt === answer,
            speed: 0.5 + (currentRound * 0.1)
        });
    });
}

// CONTROLES TÁCTILES (MÓVIL)
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    player.x = (touch.clientX - rect.left) - player.w / 2;
}, { passive: false });

canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (gameActive) bullets.push({ x: player.x + player.w / 2, y: player.y });
}, { passive: false });

function update() {
    if (!gameActive) return;
    bullets.forEach((b, bi) => {
        b.y -= 7;
        invaders.forEach((inv, ii) => {
            if (b.x > inv.x && b.x < inv.x + inv.w && b.y > inv.y && b.y < inv.y + inv.h) {
                if (inv.isCorrect) { score += 100; nextLevel(); } 
                else { score = Math.max(0, score - 50); }
                bullets.splice(bi, 1);
            }
        });
    });
    invaders.forEach(inv => {
        inv.y += inv.speed;
        if (inv.y > canvas.height - 50) endGame(false);
    });
    bullets = bullets.filter(b => b.y > 0);
}

function nextLevel() {
    if (currentRound < totalRounds) { currentRound++; updateHUD(); loadMission(); } 
    else { endGame(true); }
}

function draw() {
    ctx.fillStyle = "#050508";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Nave
    ctx.fillStyle = "#00d4ff";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Balas
    ctx.fillStyle = "#ff00ff";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

    // Opciones (Invasores)
    invaders.forEach(inv => {
        ctx.strokeStyle = "#00ff41";
        ctx.strokeRect(inv.x, inv.y, inv.w, inv.h);
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(inv.text, inv.x + inv.w/2, inv.y + 22);
    });
}

function gameLoop() {
    update(); draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

function endGame(win) {
    gameActive = false;
    alert(win ? "MISIÓN CUMPLIDA" : "GAME OVER");
    location.reload();
}

updateHUD(); loadMission(); gameLoop();
