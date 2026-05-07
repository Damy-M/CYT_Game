const area = document.getElementById("game-area");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round-counter");
const sentenceEl = document.getElementById("sentence-display");
const sndEat = document.getElementById('snd-eat');
const sndLose = document.getElementById('snd-lose');
const music = document.getElementById('fondo-music');

let score = 0, currentRound = 1, gameActive = true, invaders = [];
let audioStarted = false;

function startAudio() {
    if (!audioStarted) {
        music.play().catch(() => {});
        audioStarted = true;
    }
}

function loadMission() {
    if (typeof db !== 'undefined' && db[currentRound - 1]) {
        const mission = db[currentRound - 1];
        sentenceEl.innerText = mission.s;
        roundEl.innerText = `RD: ${currentRound}/${db.length}`;
        spawnInvaders(mission.options, mission.ans);
    } else { endGame(true); }
}

function spawnInvaders(options, answer) {
    document.querySelectorAll('.invader').forEach(i => i.remove());
    invaders = [];
    const spacing = area.clientWidth / options.length;
    options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'invader';
        div.innerText = opt;
        div.style.top = "-60px";
        div.style.left = (i * spacing + 5) + "px";
        div.onclick = () => { startAudio(); checkAnswer(opt === answer, div); };
        area.appendChild(div);
        invaders.push({ div, y: -60, speed: 1.0 + (currentRound * 0.12) });
    });
}

function checkAnswer(correct, div) {
    if (!gameActive) return;
    document.querySelectorAll('.fb-text').forEach(f => f.remove()); // LIMPIEZA TOTAL

    const fb = document.createElement('div');
    fb.className = 'fb-text';
    
    if (correct) {
        sndEat.currentTime = 0; sndEat.play().catch(()=>{});
        score += 100;
        fb.innerText = "EXCELLENT!";
        fb.style.color = "#00ff41";
        div.style.backgroundColor = "#00ff41";
        gameActive = false; 
        setTimeout(() => { fb.remove(); gameActive = true; currentRound++; loadMission(); }, 1000);
    } else {
        sndLose.currentTime = 0; sndLose.play().catch(()=>{});
        score = Math.max(0, score - 50);
        fb.innerText = "RETRY!";
        fb.style.color = "#ff3131";
        div.style.borderColor = "#ff3131";
        setTimeout(() => fb.remove(), 800);
    }
    area.appendChild(fb);
    scoreEl.innerText = score;
}

function update() {
    if (!gameActive) return;
    invaders.forEach(inv => {
        inv.y += inv.speed;
        inv.div.style.top = inv.y + "px";
        if (inv.y > area.clientHeight - 80) endGame(false);
    });
}

function endGame(win) {
    gameActive = false;
    alert(win ? "SYSTEM SECURED!" : "DEFENSES BREACHED!");
    location.reload();
}

window.addEventListener('touchstart', startAudio, {once: true});
loadMission();
setInterval(update, 20);
