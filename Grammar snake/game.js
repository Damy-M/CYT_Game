const container = document.getElementById('game-container');
const missionEl = document.getElementById('mission-text');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const music = document.getElementById('fondo-music');
const sndEat = document.getElementById('snd-eat');
const sndLose = document.getElementById('snd-lose');

let snake = [{x: 100, y: 100}, {x: 80, y: 100}, {x: 60, y: 100}];
let dir = {x: 0, y: 0}, nextDir = {x: 0, y: 0};
let score = 0, lives = 5, currentWordIdx = 0, missionIdx = 0, gameActive = true;
let audioStarted = false;
const box = 20;

function triggerFeedback(msg, color) {
    document.querySelectorAll('.fb-msg').forEach(m => m.remove());
    const fb = document.createElement('div');
    fb.className = 'fb-msg';
    fb.innerText = msg;
    fb.style.cssText = `position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); color:${color}; font-weight:bold; font-size:2rem; z-index:100; pointer-events:none; text-shadow: 2px 2px #000;`;
    container.appendChild(fb);
    setTimeout(() => fb.remove(), 800);
}

function spawnFoods() {
    document.querySelectorAll('.food').forEach(f => f.remove());
    const m = snakeMissions[missionIdx];
    const target = m.words[currentWordIdx];
    const options = [target, ...m.fakes, "have you", "is it"].sort(() => Math.random() - 0.5);
    
    options.forEach(txt => {
        const div = document.createElement('div');
        div.className = 'food';
        div.innerText = txt;
        let rx = Math.floor(Math.random() * (container.clientWidth / box - 4) + 2) * box;
        let ry = Math.floor(Math.random() * (container.clientHeight / box - 4) + 2) * box;
        div.style.cssText = `left:${rx}px; top:${ry}px; position:absolute; padding:6px 10px; border:1px solid #ff00ff; background:rgba(0,0,0,0.8); color:white; font-size:0.8rem; border-radius:6px; transform:translate(-50%, -50%); z-index:5;`;
        div.dataset.correct = (txt === target);
        container.appendChild(div);
    });
}

function update() {
    if (!gameActive || (dir.x === 0 && dir.y === 0)) return;
    dir = nextDir;
    let head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0) head.x = Math.floor(container.clientWidth/box)*box - box;
    else if (head.x >= container.clientWidth) head.x = 0;
    if (head.y < 0) head.y = Math.floor(container.clientHeight/box)*box - box;
    else if (head.y >= container.clientHeight) head.y = 0;

    let ate = false;
    document.querySelectorAll('.food').forEach(f => {
        const fx = parseInt(f.style.left);
        const fy = parseInt(f.style.top);
        const dist = Math.sqrt(Math.pow(head.x - fx, 2) + Math.pow(head.y - fy, 2));
        if (dist < 35) {
            if (f.dataset.correct === "true") {
                if(sndEat) { sndEat.currentTime=0; sndEat.play(); }
                triggerFeedback("CORRECT!", "#00d4ff");
                score += 150; currentWordIdx++;
                if (currentWordIdx >= snakeMissions[missionIdx].words.length) {
                    missionIdx++; currentWordIdx = 0;
                    if (missionIdx >= snakeMissions.length) return victory();
                }
                spawnFoods();
            } else {
                if(sndLose) { sndLose.currentTime=0; sndLose.play(); }
                triggerFeedback("WRONG!", "#ff3131");
                lives--; score = Math.max(0, score - 50);
                if (lives <= 0) return gameOver("GAME OVER");
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
    snake.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'snake-part';
        div.style.cssText = `left:${p.x}px; top:${p.y}px; position:absolute; width:18px; height:18px; border-radius:4px; z-index:20; background:${i===0?'#FFF':'#00d4ff'}; box-shadow:0 0 10px #00d4ff;`;
        container.appendChild(div);
    });
    scoreEl.innerText = score; livesEl.innerText = lives;
    renderMission();
}

function changeDir(x, y) {
    if(!audioStarted && music) { music.play(); audioStarted = true; }
    if (x !== 0 && dir.x === 0) nextDir = {x, y: 0};
    if (y !== 0 && dir.y === 0) nextDir = {x: 0, y};
}

function renderMission() {
    const m = snakeMissions[missionIdx];
    missionEl.innerHTML = m.words.map((w, i) => `<span class="word-box ${i < currentWordIdx ? 'found' : ''}">${i < currentWordIdx ? w : '____'}</span>`).join('');
}

function gameOver(m) { gameActive = false; alert(m); location.reload(); }
function victory() { gameActive = false; alert("YOU WIN!"); location.reload(); }

spawnFoods();
setInterval(update, 150);
