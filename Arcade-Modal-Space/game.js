// game.js
const field = document.getElementById('battle-field');
const ship = document.getElementById('player-ship');
const sentenceEl = document.getElementById('sentence-panel');

let lives = 5, wins = 0, currentRound = 0, gameActive = false, invaders = [];
let sessionData = [];
let mistakesLog = []; 

function initGame() {
    lives = 5; wins = 0; currentRound = 0; mistakesLog = [];
    document.getElementById('lives-display').innerText = lives;
    document.getElementById('wins-display').innerText = wins;
    // Mezclamos las preguntas del data.js
    sessionData = [...db].sort(() => 0.5 - Math.random());
    gameActive = true;
    loadLevel();
    requestAnimationFrame(updateLoop);
}

function loadLevel() {
    if (currentRound >= sessionData.length || lives <= 0) {
        endGame(lives > 0);
        return;
    }
    // Mostramos la oración en el panel superior
    sentenceEl.innerHTML = sessionData[currentRound].s;
    createInvaders();
}

function createInvaders() {
    // Limpiamos invasores anteriores
    invaders.forEach(i => i.el.remove());
    invaders = [];
    
    let correct = sessionData[currentRound].ans;
    // Creamos un grupo de opciones (la correcta + 4 aleatorias del wordsPool)
    let pool = [correct, ...wordsPool.filter(w => w !== correct).sort(() => 0.5 - Math.random()).slice(0, 4)];
    pool.sort(() => 0.5 - Math.random());

    pool.forEach((word, i) => {
        const el = document.createElement('div');
        el.className = 'invader';
        el.innerText = word;
        el.style.left = (10 + (i * 18)) + "%";
        el.style.top = "-60px";
        // Al hacer clic, disparamos la lógica de revisión
        el.onclick = () => checkLogic(word, el);
        field.appendChild(el);
        invaders.push({ el, y: -60, speed: 1.5 });
    });
}

function checkLogic(picked, el) {
    if (!gameActive) return;
    const q = sessionData[currentRound];

    if (picked === q.ans) {
        // ACIERTO: Pasamos a la siguiente sin interrupciones
        currentRound++;
        wins++;
        document.getElementById('wins-display').innerText = wins;
        loadLevel();
    } else {
        // ERROR: Guardamos silenciosamente para el final
        if (!mistakesLog.some(m => m.s === q.s)) {
            mistakesLog.push(q); 
        }
        lives--;
        document.getElementById('lives-display').innerText = lives;
        el.style.opacity = "0.1"; // Se vuelve casi invisible al fallar
        el.style.pointerEvents = "none"; // Ya no puedes clickear el mismo error
        
        if (lives <= 0) endGame(false);
    }
}

function updateLoop() {
    if (!gameActive) return;
    invaders.forEach(inv => {
        inv.y += inv.speed;
        inv.el.style.top = inv.y + "px";
        // Si el invasor sale por abajo, vuelve a empezar arriba
        if (inv.y > window.innerHeight) inv.y = -60;
    });
    requestAnimationFrame(updateLoop);
}

function endGame(isWin) {
    gameActive = false;
    document.getElementById('end-screen').classList.remove('hidden');
    document.getElementById('end-status').innerText = isWin ? "MISSION ACCOMPLISHED" : "SYSTEM CRITICAL FAILURE";
    document.getElementById('end-status').style.color = isWin ? "#00d4ff" : "#ff00ff";

    const report = document.getElementById('feedback-report');
    if (mistakesLog.length > 0) {
        let html = "<h2 style='color:#00d4ff; text-align:center;'>DEBRIEFING: REVIEW YOUR ERRORS</h2><ol>";
        mistakesLog.forEach(m => {
            html += `<li>
                <strong>Question:</strong> ${m.s.replace("____", "<u>      </u>")}<br>
                <span style="color:#00ff41;">Correct Answer: ${m.ans}</span><br>
                <span style="color:#ffcc00;">Note: ${m.loss}</span>
            </li>`;
        });
        html += "</ol>";
        report.innerHTML = html;
    } else {
        report.innerHTML = "<h2 style='text-align:center;'>PERFECT ACCURACY! NO ERRORS.</h2>";
    }
}

// Movimiento de la nave con el mouse
field.onmousemove = (e) => { 
    if (gameActive) ship.style.left = e.clientX + "px"; 
};

// Botones de inicio y reinicio
document.getElementById('btn-start').onclick = () => {
    document.getElementById('start-screen').classList.add('hidden');
    initGame();
};

document.getElementById('retry-btn').onclick = () => {
    location.reload(); // Recarga la página para resetear todo
};