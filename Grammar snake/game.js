const container = document.getElementById('game-container');
const missionEl = document.getElementById('mission-text');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const sndEat = document.getElementById('snd-eat');
const sndLose = document.getElementById('snd-lose');

let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let dir = {x: 20, y: 0}, nextDir = {x: 20, y: 0};
let score = 0, lives = 5, currentWordIdx = 0, missionIdx = 0, gameActive = true;
const box = 20;

function triggerFeedback(msg, color) {
    // Eliminar mensajes viejos para que no se queden pegados
    document.querySelectorAll('.fb-msg').forEach(m => m.remove());
    const fb = document.createElement('div');
    fb.className = 'fb-msg';
    fb.innerText = msg;
    fb.style.cssText = `position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); 
        color:${color}; font-weight:bold; font-size:1.8rem; text-shadow:0 0 10px ${color}; z-index:1000;`;
    container.appendChild(fb);
    setTimeout(() => fb.remove(), 1000);
}

function spawnFoods() {
    document.querySelectorAll('.food').forEach(f => f.remove());
    const m = snakeMissions[missionIdx];
    const target = m.words[currentWordIdx];
    const options = [target, ...m.fakes].sort(() => Math.random() - 0.5);
    
    options.forEach(txt => {
        const div = document.createElement('div');
        div.className = 'food';
        div.innerText = txt;
        let rx, ry;
        // Evitar que aparezcan fuera del área visible
        rx = Math.floor(Math.random() * (container.clientWidth / box - 2) + 1) * box;
        ry = Math.floor(Math.random() * (container.clientHeight / box - 2) + 1) * box;
        div.style.left = rx + 'px'; div.style.top = ry + 'px';
        div.dataset.correct = (txt === target);
        container.appendChild(div);
    });
}

function update() {
    if (!gameActive) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // MUERTE POR PARED (Revisado)
    if (head.x < 0 || head.x >= container.clientWidth || head.y < 0 || head.y >= container.clientHeight) {
        return gameOver("COLLISION!");
    }

    // MUERTE POR CUERPO
    if (snake.some(p => p.x === head.x && p.y === head.y)) return gameOver("SELF-EATEN!");

    let ate = false;
    document.querySelectorAll('.food').forEach(f => {
        if (head.x === parseInt(f.style.left) && head.y === parseInt(f.style.top)) {
            if (f.dataset.correct === "true") {
                sndEat.play().catch(()=>{});
                triggerFeedback("CORRECT!", "#00d4ff");
                score += 150; currentWordIdx++;
                if (currentWordIdx >= snakeMissions[missionIdx].words.length) {
                    missionIdx++; currentWordIdx = 0;
                    if (missionIdx >= snakeMissions.length) return victory();
                }
                spawnFoods();
            } else {
                sndLose.play().catch(()=>{});
                triggerFeedback("WRONG!", "#ff3131");
                lives--; score = Math.max(0, score - 50);
                if (lives <= 0) return gameOver("NO LIVES!");
                spawnFoods();
            }
            ate = true;
        }
    });

    if (!ate) snake.pop();
    snake.unshift(head);
    draw();
}

function draw() {
    document.querySelectorAll('.snake-part').forEach(p => p.remove());
    snake.forEach(p => {
        const div = document.createElement('div');
        div.className = 'snake-part';
        div.style.left = p.x + 'px'; div.style.top = p.y + 'px';
        container.appendChild(div);
    });
    scoreEl.innerText = score; livesEl.innerText = lives;
    renderMission();
}

function renderMission() {
    const m = snakeMissions[missionIdx];
    missionEl.innerHTML = m.words.map((w, i) => 
        `<span class="word-box ${i < currentWordIdx ? 'found' : ''}">${i < currentWordIdx ? w : '____'}</span>`
    ).join('');
}

function changeDir(x, y) {
    if (x !== 0 && dir.x === 0) nextDir = {x, y: 0};
    if (y !== 0 && dir.y === 0) nextDir = {x: 0, y};
}

function gameOver(m) { gameActive = false; triggerFeedback(m, "#ff3131"); setTimeout(()=>location.reload(), 2000); }
function victory() { gameActive = false; triggerFeedback("WINNER!", "#00ff41"); }

spawnFoods();
setInterval(update, 150);
