const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round-counter");
const sentenceEl = document.getElementById("sentence-display");

// Ajuste forzado para móvil
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.6; // Ocupa el 60% de la pantalla
}
window.addEventListener('resize', resize);
resize();

let score = 0, currentRound = 1, gameActive = true;
const totalRounds = (typeof db !== 'undefined') ? db.length : 15;
let player = { x: canvas.width / 2 - 20, y: canvas.height - 50, w: 40, h: 40 };
let bullets = [], invaders = [];

function loadMission() {
    if (typeof db !== 'undefined' && db[currentRound - 1]) {
        sentenceEl.innerText = db[currentRound - 1].s;
        const options = db[currentRound - 1].options;
        const answer = db[currentRound - 1].ans;
        invaders = [];
        const spacing = canvas.width / options.length;
        options.forEach((opt, i) => {
            invaders.push({
                x: (i * spacing) + 10,
                y: 10,
                w: spacing - 20,
                h: 30,
                text: opt,
                isCorrect: opt === answer,
                speed: 0.5 + (currentRound * 0.05)
            });
        });
    }
}

// CONTROL TÁCTIL MEJORADO
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    let touch = e.touches[0];
    let rect = canvas.getBoundingClientRect();
    player.x = (touch.clientX - rect.left) - player.w / 2;
}, { passive: false });

canvas.addEventListener("touchstart", (e) => {
    if (gameActive) bullets.push({ x: player.x + player.w / 2, y: player.y });
}, { passive: false });

function update() {
    if (!gameActive) return;
    bullets.forEach((b, bi) => {
        b.y -= 5;
        invaders.forEach((inv, ii) => {
            if (b.x > inv.x && b.x < inv.x + inv.w && b.y > inv.y && b.y < inv.y + inv.h) {
                if (inv.isCorrect) { score += 100; nextLevel(); }
                bullets.splice(bi, 1);
            }
        });
    });
    invaders.forEach(inv => {
        inv.y += inv.speed;
        if (inv.y > canvas.height - 40) endGame(false);
    });
    bullets = bullets.filter(b => b.y > 0);
}

function nextLevel() {
    if (currentRound < totalRounds) { currentRound++; loadMission(); } 
    else { endGame(true); }
}

function draw() {
    ctx.fillStyle = "#000"; // Fondo negro
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Jugador
    ctx.fillStyle = "#00d4ff";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Balas
    ctx.fillStyle = "#ff00ff";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

    // Invasores
    invaders.forEach(inv => {
        ctx.strokeStyle = "#00ff41";
        ctx.strokeRect(inv.x, inv.y, inv.w, inv.h);
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(inv.text, inv.x + inv.w/2, inv.y + 20);
    });
    scoreEl.innerText = score;
    roundEl.innerText = `RD: ${currentRound}/${totalRounds}`;
}

function gameLoop() {
    update(); draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

loadMission();
gameLoop();
