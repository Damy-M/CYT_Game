const container = document.getElementById('game-container');
const missionEl = document.getElementById('mission-text');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let dir = {x: 20, y: 0}, nextDir = {x: 20, y: 0};
let score = 0, lives = 5, currentWordIdx = 0, missionIdx = 0;
let foods = [], gameActive = true;
const box = 20;

function initLevel() {
    if (typeof snakeMissions !== 'undefined' && snakeMissions[missionIdx]) {
        currentWordIdx = 0;
        spawnFoods();
        renderMission();
    } else {
        triggerFeedback("VICTORY! ALL MISSIONS CLEAR", "#00ff41");
        gameActive = false;
    }
}

// FEEDBACK VISUAL
function triggerFeedback(msg, color) {
    const fb = document.createElement('div');
    fb.innerText = msg;
    fb.style.cssText = `position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); 
        color:${color}; font-weight:bold; font-size:1.5rem; text-shadow:0 0 10px ${color}; z-index:100;`;
    container.appendChild(fb);
    setTimeout(() => fb.remove(), 1200);
}

function spawnFoods() {
    document.querySelectorAll('.food').forEach(f => f.remove());
    foods = [];
    const mission = snakeMissions[missionIdx];
    const target = mission.words[currentWordIdx];
    const options = [target, ...mission.fakes].sort(() => Math.random() - 0.5);

    options.forEach(txt => {
        const food = {
            x: Math.floor(Math.random() * (container.clientWidth / box - 2) + 1) * box,
            y: Math.floor(Math.random() * (container.clientHeight / box - 2) + 1) * box,
            text: txt,
            isCorrect: txt === target
        };
        foods.push(food);
        const div = document.createElement('div');
        div.className = 'food';
        div.innerText = food.text;
        div.style.left = food.x + 'px'; div.style.top = food.y + 'px';
        container.appendChild(div);
    });
}

function changeDir(x, y) {
    if (x !== 0 && dir.x === 0) nextDir = {x, y: 0};
    if (y !== 0 && dir.y === 0) nextDir = {x: 0, y};
}

function update() {
    if (!gameActive) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // --- REGLA: MUERTE POR PARED ---
    if (head.x < 0 || head.x >= container.clientWidth || head.y < 0 || head.y >= container.clientHeight) {
        handleDeath("WALL COLLISION!");
        return;
    }

    // --- REGLA: MUERTE POR AUTO-CHOQUE ---
    if (snake.some(p => p.x === head.x && p.y === head.y)) {
        handleDeath("SELF COLLISION!");
        return;
    }

    let ate = false;
    foods.forEach((f) => {
        if (head.x === f.x && head.y === f.y) {
            if (f.isCorrect) {
                try { document.getElementById('snd-eat').play(); } catch(e){}
                triggerFeedback("CORRECT +150", "#00d4ff");
                score += 150;
                currentWordIdx++;
                if (currentWordIdx >= snakeMissions[missionIdx].words.length) {
                    missionIdx++;
                    initLevel();
                } else {
                    spawnFoods();
                }
            } else {
                try { document.getElementById('snd-lose').play(); } catch(e){}
                triggerFeedback("WRONG WORD -50", "#ff3131");
                lives--;
                score = Math.max(0, score - 50);
                if (lives <= 0) handleDeath("LIVES EXHAUSTED");
                spawnFoods();
            }
            ate = true;
        }
    });

    if (!ate) snake.pop();
    snake.unshift(head);
    draw();
}

function handleDeath(reason) {
    gameActive = false;
    triggerFeedback(reason, "#ff3131");
    setTimeout(() => location.reload(), 2000);
}

function draw() {
    document.querySelectorAll('.snake-part').forEach(p => p.remove());
    snake.forEach(p => {
        const div = document.createElement('div');
        div.className = 'snake-part';
        div.style.left = p.x + 'px'; div.style.top = p.y + 'px';
        container.appendChild(div);
    });
    scoreEl.innerText = score;
    livesEl.innerText = lives;
    renderMission();
}

function renderMission() {
    const m = snakeMissions[missionIdx];
    missionEl.innerHTML = m.words.map((w, i) => 
        `<span class="word-box ${i < currentWordIdx ? 'found' : ''}">${i < currentWordIdx ? w : '____'}</span>`
    ).join('');
}

initLevel();
setInterval(update, 150);
