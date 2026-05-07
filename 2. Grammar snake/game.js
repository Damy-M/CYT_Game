// game.js
const board = document.getElementById('game-board');
const missionEl = document.getElementById('mission-control');
const snd = {
    bg: document.getElementById('snd-bg'),
    eat: document.getElementById('snd-eat'),
    win: document.getElementById('snd-win'),
    lose: document.getElementById('snd-lose')
};

let snake = [{x: 300, y: 200}, {x: 280, y: 200}, {x: 260, y: 200}];
let dir = {x: 20, y: 0}, nextDir = {x: 20, y: 0};
let active = false, score = 0, lives = 5, currentStep = 0;
let foods = [], mistakesLog = [], currentMission;

// Paleta de colores neón para camuflar las palabras
const neonColors = ['#00d4ff', '#ff00ff', '#00ff41', '#ff3131', '#9d00ff', '#ffff00', '#ff8c00'];

function getRandomColor() {
    return neonColors[Math.floor(Math.random() * neonColors.length)];
}

window.addEventListener('keydown', e => {
    if(e.key === 'ArrowUp' && dir.y === 0) nextDir = {x: 0, y: -20};
    if(e.key === 'ArrowDown' && dir.y === 0) nextDir = {x: 0, y: 20};
    if(e.key === 'ArrowLeft' && dir.x === 0) nextDir = {x: -20, y: 0};
    if(e.key === 'ArrowRight' && dir.x === 0) nextDir = {x: 20, y: 0};
});

function initMission() {
    let next;
    do { next = snakeMissions[Math.floor(Math.random() * snakeMissions.length)]; } 
    while (next === currentMission); 
    currentMission = next;
    currentStep = 0;
    renderHUD();
    spawnFood();
}

function spawnFood() {
    foods.forEach(f => f.el.remove());
    foods = [];
    
    // Mezclamos la correcta con las falsas
    const allWords = [
        { text: currentMission.words[currentStep], isCorrect: true },
        ...currentMission.fakes.map(f => ({ text: f, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);
    
    allWords.forEach((wordObj) => {
        const el = document.createElement('div');
        el.className = 'food';
        el.innerText = wordObj.text;
        
        // ASIGNACIÓN DE COLOR ALEATORIO (Camuflaje total)
        const randomColor = getRandomColor();
        el.style.color = randomColor;
        el.style.borderColor = randomColor;
        el.style.boxShadow = `0 0 10px ${randomColor}44`; // Brillo suave
        
        board.appendChild(el);

        let fx, fy, overlap;
        do {
            overlap = false;
            fx = Math.floor(Math.random() * 22 + 4) * 20;
            fy = Math.floor(Math.random() * 14 + 3) * 20;
            foods.forEach(f => {
                if (Math.abs(fx - f.x) < 110 && Math.abs(fy - f.y) < 55) overlap = true;
            });
        } while (overlap);

        el.style.left = fx + 'px';
        el.style.top = fy + 'px';
        foods.push({ x: fx, y: fy, text: wordObj.text, isCorrect: wordObj.isCorrect, el, w: el.offsetWidth, h: el.offsetHeight });
    });
}

function move() {
    if(!active) return;
    dir = nextDir;
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

    if(head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 400 || 
       snake.some((p, i) => i !== 0 && p.x === head.x && p.y === head.y)) {
        return endGame("COLLISION DETECTED");
    }

    let ate = false;
    foods.forEach((f, index) => {
        // Colisión por borde mejorada
        if (head.x + 15 > f.x - f.w/2 && head.x - 15 < f.x + f.w/2 &&
            head.y + 15 > f.y - f.h/2 && head.y - 15 < f.y + f.h/2) {
            
            if(f.isCorrect) {
                currentStep++;
                score += 100;
                snd.eat.currentTime = 0; snd.eat.play().catch(()=>{});
                ate = true;
                if(currentStep >= currentMission.words.length) {
                    snd.win.play().catch(()=>{});
                    initMission();
                } else {
                    renderHUD();
                    spawnFood();
                }
            } else {
                if(!mistakesLog.some(m => m.words === currentMission.words)) mistakesLog.push(currentMission);
                lives--;
                snd.lose.currentTime = 0; snd.lose.play().catch(()=>{});
                f.el.remove();
                foods.splice(index, 1);
                if(lives <= 0) return endGame("SHIELD OVERLOAD");
            }
        }
    });

    snake.unshift(head);
    if(!ate) snake.pop();
    draw();
    setTimeout(move, 125);
}

function endGame(reason) {
    active = false;
    snd.bg.pause();
    document.getElementById('end-screen').classList.remove('hidden');
    document.getElementById('end-status').innerText = reason;
    const report = document.getElementById('feedback-report');
    
    let html = "<h3>MISSION LOG (Mistakes)</h3><ol>";
    mistakesLog.forEach(m => {
        html += `<li style="margin-bottom:10px;"><strong>Sentence:</strong> ${m.words.join(" ")}<br><span style="color:#ffcc00;">Note: ${m.note}</span></li>`;
    });
    report.innerHTML = mistakesLog.length > 0 ? html + "</ol>" : "<h3>PERFECT SCORE! NO ERRORS.</h3>";
}

function draw() {
    document.querySelectorAll('.snake-part').forEach(p => p.remove());
    snake.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'snake-part';
        if(i === 0) div.style.background = "#fff"; // Cabeza blanca para distinguir
        div.style.left = p.x + 'px'; div.style.top = p.y + 'px';
        board.appendChild(div);
    });
    document.getElementById('shield-val').innerText = `${lives}/5`;
    document.getElementById('score-val').innerText = score;
}

function renderHUD() {
    missionEl.innerHTML = currentMission.words.map((w, i) => 
        `<span class="slot ${i < currentStep ? 'done' : ''}">${i < currentStep ? w : '___'}</span>`
    ).join("");
}

document.getElementById('start-btn').onclick = () => {
    document.getElementById('start-screen').classList.add('hidden');
    active = true;
    snd.bg.volume = 0.3;
    snd.bg.play().catch(() => {});
    initMission();
    move();
};