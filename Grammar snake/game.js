const container = document.getElementById('game-container');
const missionEl = document.getElementById('mission-text');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const sndEat = document.getElementById('snd-eat');
const sndLose = document.getElementById('snd-lose');
const music = document.getElementById('fondo-music');

let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let dir = {x: 0, y: 0}, nextDir = {x: 0, y: 0};
let score = 0, lives = 5, currentWordIdx = 0, missionIdx = 0, gameActive = true;
let audioStarted = false;
const box = 20;

function triggerFeedback(msg, color) {
    document.querySelectorAll('.fb-msg').forEach(m => m.remove()); // LIMPIEZA
    const fb = document.createElement('div');
    fb.className = 'fb-msg';
    fb.innerText = msg;
    fb.style.color = color;
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
        let rx = Math.floor(Math.random() * (container.clientWidth / box - 4) + 2) * box;
        let ry = Math.floor(Math.random() * (container.clientHeight / box - 4) + 2) * box;
        div.style.left = rx + 'px'; div.style.top = ry + 'px';
        div.dataset.correct = (txt === target);
        container.appendChild(div);
    });
}

function update() {
    if (!gameActive || (dir.x === 0 && dir.y === 0)) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // MUERTE POR PARED
    if (head.x < 0 || head.x >= container.clientWidth || head.y < 0 || head.y >= container.clientHeight) {
        return gameOver("COLLISION!");
    }

    let ate = false;
    document.querySelectorAll('.food').forEach(f => {
        const fx = parseInt(f.style.left);
        const fy = parseInt(f.style.top);
        // HITBOX AMPLIADO: Distancia de 25 píxeles para "succionar" la palabra
        const dist = Math.sqrt(Math.pow(head.x - fx, 2) + Math.pow(head.y - fy, 2));
        
        if (dist < 25) {
            if (f.dataset.correct === "true") {
                sndEat.currentTime = 0; sndEat.play().catch(()=>{});
                triggerFeedback("CORRECT!", "#00d4ff");
                score += 150; currentWordIdx++;
                if (currentWordIdx >= snakeMissions[missionIdx].words.length) {
                    missionIdx++; currentWordIdx = 0;
                    if (missionIdx >= snakeMissions.length) return victory();
                }
                spawnFoods();
            } else {
                sndLose.currentTime = 0; sndLose.play().catch(()=>{});
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

function changeDir(x, y) {
    if (!audioStarted) { music.play().catch(()=>{}); audioStarted = true; }
    if (x !== 0 && dir.x === 0) nextDir = {x, y: 0};
    if (y !== 0 && dir.y === 0) nextDir = {x: 0, y};
}

function renderMission() {
    const m = snakeMissions[missionIdx];
    missionEl.innerHTML = m.words.map((w, i) => `<span class="word-box ${i < currentWordIdx ? 'found' : ''}">${i < currentWordIdx ? w : '____'}</span>`).join('');
}

function gameOver(m) { gameActive = false; sndLose.play().catch(()=>{}); triggerFeedback(m, "#ff3131"); setTimeout(()=>location.reload(), 2000); }
function victory() { gameActive = false; triggerFeedback("WINNER!", "#00ff41"); }

spawnFoods();
setInterval(update, 150);
