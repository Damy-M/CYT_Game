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
const colors = ["#00ff41", "#ff00ff", "#00d4ff", "#ffff00"];

function loadMission() {
    if (typeof db !== 'undefined' && db[currentRound - 1]) {
        const mission = db[currentRound - 1];
        sentenceEl.innerText = mission.s;
        roundEl.innerText = `RD: ${currentRound}/${db.length}`;
        
        // ALEATORIEDAD: Mezclamos las opciones para que no siempre la correcta esté en el mismo sitio
        const shuffledOptions = [...mission.options].sort(() => Math.random() - 0.5);
        spawnInvaders(shuffledOptions, mission.ans);
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
        // Estilo adaptado: naves más pequeñas y colores neón alternos
        div.style.cssText = `
            top: -60px; 
            left: ${i * spacing + 5}px; 
            font-size: 0.75rem; 
            padding: 6px 10px; 
            border: 2px solid ${colors[i % colors.length]};
            box-shadow: 0 0 8px ${colors[i % colors.length]};
            position: absolute; color: white; border-radius: 8px; font-weight: bold;
        `;
        
        div.onclick = () => { 
            if(!audioStarted && music){ music.play().catch(()=>{}); audioStarted=true; }
            checkAnswer(opt === answer, div); 
        };
        
        area.appendChild(div);
        invaders.push({ div, y: -60, speed: 1.1 + (currentRound * 0.1) });
    });
}

function checkAnswer(correct, div) {
    if (!gameActive) return;
    // LIMPIEZA: Elimina carteles previos para que no se peguen
    document.querySelectorAll('.fb-text').forEach(f => f.remove());

    const fb = document.createElement('div');
    fb.className = 'fb-text';
    fb.style.cssText = `position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); font-weight:bold; z-index:100; font-size:2rem; pointer-events:none;`;

    if (correct) {
        if(sndEat) { sndEat.currentTime=0; sndEat.play().catch(()=>{}); }
        score += 100;
        fb.innerText = "EXCELLENT!";
        fb.style.color = "#00ff41";
        div.style.backgroundColor = "#00ff41";
        gameActive = false; 
        setTimeout(() => { fb.remove(); gameActive = true; currentRound++; loadMission(); }, 800);
    } else {
        if(sndLose) { sndLose.currentTime=0; sndLose.play().catch(()=>{}); }
        score = Math.max(0, score - 50);
        fb.innerText = "TRY AGAIN!";
        fb.style.color = "#ff3131";
        div.style.borderColor = "#ff3131";
        setTimeout(() => fb.remove(), 600);
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
    alert(win ? "MISSION ACCOMPLISHED!" : "SYSTEM OVERRUN!");
    location.reload();
}

loadMission();
setInterval(update, 20);
