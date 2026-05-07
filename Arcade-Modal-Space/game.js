const area = document.getElementById("game-area");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const roundEl = document.getElementById("round-counter");
const sentenceEl = document.getElementById("sentence-display");
const sndEat = document.getElementById('snd-eat');
const sndLose = document.getElementById('snd-lose');

let score = 0, currentRound = 1, gameActive = true, invaders = [];
let audioStarted = false;

function startAudio() {
    if (!audioStarted) {
        sndEat.volume = 0.5;
        sndLose.volume = 0.5;
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
        div.style.top = "-50px";
        div.style.left = (i * spacing + 10) + "px";
        div.onclick = () => { startAudio(); checkAnswer(opt === answer, div); };
        area.appendChild(div);
        invaders.push({ div, y: -50, speed: 0.8 + (currentRound * 0.15) });
    });
}

function checkAnswer(correct, div) {
    if (!gameActive) return;
    // Limpiar feedbacks anteriores pegados
    document.querySelectorAll('.fb-text').forEach(f => f.remove());

    const fb = document.createElement('div');
    fb.className = 'fb-text';
    fb.style.cssText = `position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); font-weight:bold; z-index:100; font-size:2rem;`;

    if (correct) {
        sndEat.play().catch(()=>{});
        score += 100;
        fb.innerText = "EXCELLENT!";
        fb.style.color = "#00ff41";
        div.style.backgroundColor = "#00ff41";
        gameActive = false; 
        setTimeout(() => { fb.remove(); gameActive = true; currentRound++; loadMission(); }, 1000);
    } else {
        sndLose.play().catch(()=>{});
        score = Math.max(0, score - 50);
        fb.innerText = "WRONG!";
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

loadMission();
setInterval(update, 20);
