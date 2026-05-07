const area = document.getElementById("game-area");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round-counter");
const sentenceEl = document.getElementById("sentence-display");

let score = 0;
let currentRound = 1;
let gameActive = true;
let invaders = [];

// Ajuste inicial
const areaW = area.clientWidth || window.innerWidth;
const areaH = area.clientHeight || (window.innerHeight * 0.6);

function loadMission() {
    if (typeof db !== 'undefined' && db[currentRound - 1]) {
        const mission = db[currentRound - 1];
        sentenceEl.innerText = mission.s;
        roundEl.innerText = `RD: ${currentRound}/${db.length}`;
        spawnInvaders(mission.options, mission.ans);
    } else {
        endGame(true);
    }
}

function spawnInvaders(options, answer) {
    // Limpiar naves anteriores
    document.querySelectorAll('.invader').forEach(i => i.remove());
    invaders = [];
    
    const spacing = areaW / options.length;
    
    options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'invader';
        div.innerText = opt;
        div.style.top = "-50px";
        div.style.left = (i * spacing + 10) + "px";
        
        // Al tocar la palabra, se "dispara"
        div.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!gameActive) return;
            checkAnswer(opt === answer, div);
        });

        area.appendChild(div);
        invaders.push({ 
            div, 
            y: -50, 
            speed: 0.8 + (currentRound * 0.1) 
        });
    });
}

function checkAnswer(correct, div) {
    if (correct) {
        score += 100;
        scoreEl.innerText = score;
        div.style.backgroundColor = "#00ff41";
        div.style.color = "#000";
        setTimeout(() => {
            if (currentRound < db.length) {
                currentRound++;
                loadMission();
            } else {
                endGame(true);
            }
        }, 400);
    } else {
        score = Math.max(0, score - 50);
        scoreEl.innerText = score;
        div.style.borderColor = "#ff3131";
        div.style.boxShadow = "0 0 15px #ff3131";
    }
}

// Control táctil para mover la nave visualmente
area.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const rect = area.getBoundingClientRect();
    let x = touch.clientX - rect.left;
    if (x > 20 && x < areaW - 20) {
        player.style.left = x + "px";
    }
}, { passive: true });

// Bucle de movimiento
function update() {
    if (!gameActive) return;
    
    invaders.forEach(inv => {
        inv.y += inv.speed;
        inv.div.style.top = inv.y + "px";
        
        // Si la palabra llega a la nave
        if (inv.y > areaH - 80) {
            endGame(false);
        }
    });
}

function endGame(win) {
    gameActive = false;
    alert(win ? "¡SISTEMA ASEGURADO! Puntaje: " + score : "ERROR CRÍTICO: GAME OVER");
    location.reload();
}

// Iniciar
loadMission();
setInterval(update, 20); // 50 cuadros por segundo
