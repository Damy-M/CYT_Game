const area = document.getElementById("game-area");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round-counter");
const sentenceEl = document.getElementById("sentence-display");

let score = 0, currentRound = 1, gameActive = true, invaders = [];
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
    document.querySelectorAll('.invader').forEach(i => i.remove());
    invaders = [];
    const spacing = areaW / options.length;
    options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'invader';
        div.innerText = opt;
        div.style.top = "-50px";
        div.style.left = (i * spacing + 10) + "px";
        div.onclick = () => checkAnswer(opt === answer, div); // Feedback inmediato al tocar
        area.appendChild(div);
        invaders.push({ div, y: -50, speed: 0.8 + (currentRound * 0.1) });
    });
}

function checkAnswer(correct, div) {
    if (!gameActive) return;
    const fb = document.createElement('div');
    fb.style.position = 'absolute';
    fb.style.left = div.style.left;
    fb.style.top = div.style.top;
    fb.style.zIndex = '50';
    fb.style.fontWeight = 'bold';

    if (correct) {
        score += 100;
        fb.innerText = "EXCELLENT!";
        fb.style.color = "#00ff41";
        div.style.backgroundColor = "#00ff41";
        gameActive = false; // Pausa para feedback
        setTimeout(() => { gameActive = true; currentRound++; loadMission(); }, 800);
    } else {
        score = Math.max(0, score - 50);
        fb.innerText = "RETRY!";
        fb.style.color = "#ff3131";
        div.style.borderColor = "#ff3131";
        setTimeout(() => fb.remove(), 500);
    }
    area.appendChild(fb);
    scoreEl.innerText = score;
}

function update() {
    if (!gameActive) return;
    invaders.forEach(inv => {
        inv.y += inv.speed;
        inv.div.style.top = inv.y + "px";
        if (inv.y > areaH - 80) endGame(false);
    });
}

function endGame(win) {
    gameActive = false;
    alert(win ? "SYSTEM SECURED!" : "DEFENSES BREACHED!");
    location.reload();
}

loadMission();
setInterval(update, 20);
