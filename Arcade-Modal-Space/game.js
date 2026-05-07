// Arcade Space - Modal Defense Logic
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round-counter");
const sentenceEl = document.getElementById("sentence-display");

// Configuración de pantalla
canvas.width = 480;
canvas.height = 550;

// VARIABLES DE JUEGO
let score = 0;
let currentRound = 1;
// Detecta automáticamente cuántas frases hay en tu data.js
const totalRounds = (typeof db !== 'undefined') ? db.length : 10;

let player = { x: canvas.width / 2 - 25, y: canvas.height - 70, w: 50, h: 50 };
let bullets = [];
let invaders = [];
let gameActive = true;

// 1. ACTUALIZAR TEXTOS EN PANTALLA
function updateHUD() {
    scoreEl.innerText = score;
    // Esto actualiza el RD: 1/15
    if (roundEl) {
        roundEl.innerText = `RD: ${currentRound}/${totalRounds}`;
    }
}

// 2. CARGAR MISIÓN ACTUAL
function loadMission() {
    if (typeof db !== 'undefined' && db[currentRound - 1]) {
        const mission = db[currentRound - 1];
        sentenceEl.innerText = mission.s; // Muestra la oración con el espacio
        spawnInvaders(mission.options, mission.ans);
    }
}

function spawnInvaders(options, answer) {
    invaders = [];
    const spacing = canvas.width / options.length;
    options.forEach((opt, i) => {
        invaders.push({
            x: (i * spacing) + 10,
            y: -50, // Aparecen desde arriba
            w: spacing - 20,
            h: 40,
            text: opt,
            isCorrect: opt === answer,
            speed: 0.8 + (currentRound * 0.1) // Aumenta velocidad cada nivel
        });
    });
}

// 3. LÓGICA DE MOVIMIENTO Y COLISIONES
function update() {
    if (!gameActive) return;

    // Balas
    bullets.forEach((b, bi) => {
        b.y -= 8;
        invaders.forEach((inv, ii) => {
            if (b.x > inv.x && b.x < inv.x + inv.w && b.y > inv.y && b.y < inv.y + inv.h) {
                if (inv.isCorrect) {
                    score += 100;
                    bullets.splice(bi, 1);
                    nextLevel();
                } else {
                    score = Math.max(0, score - 50); // Penalización
                    bullets.splice(bi, 1);
                }
            }
        });
    });

    // Invasores
    invaders.forEach(inv => {
        inv.y += inv.speed;
        if (inv.y > canvas.height - 100) {
            endGame(false); // Si tocan la línea del jugador
        }
    });

    bullets = bullets.filter(b => b.y > 0);
}

// 4. PASAR DE NIVEL
function nextLevel() {
    if (currentRound < totalRounds) {
        currentRound++;
        updateHUD();
        loadMission();
    } else {
        endGame(true);
    }
}

// 5. RENDERIZADO (DIBUJO)
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Jugador (Nave)
    ctx.fillStyle = "#00d4ff";
    ctx.fillRect(player.x, player.y, player.w, player.h);
    // Brillo de la nave
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00d4ff";

    // Balas
    ctx.fillStyle = "#ff00ff";
    ctx.shadowColor = "#ff00ff";
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 12));

    // Invasores (Opciones)
    ctx.shadowBlur = 0;
    invaders.forEach(inv => {
        ctx.strokeStyle = "#00ff41";
        ctx.lineWidth = 2;
        ctx.strokeRect(inv.x, inv.y, inv.w, inv.h);
        
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(inv.text.toUpperCase(), inv.x + inv.w/2, inv.y + 25);
    });
}

function gameLoop() {
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

// CONTROLES (Mouse y Táctil)
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    player.x = mouseX - player.w / 2;
});

canvas.addEventListener("mousedown", () => {
    if (gameActive) {
        bullets.push({ x: player.x + player.w / 2 - 2, y: player.y });
    }
});

function endGame(win) {
    gameActive = false;
    alert(win ? "SYSTEM SECURED: ¡HAS GANADO!" : "CRITICAL ERROR: GAME OVER");
    location.reload();
}

// INICIO DEL SISTEMA
updateHUD();
loadMission();
gameLoop();
