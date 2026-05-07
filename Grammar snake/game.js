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
        alert("¡FELICIDADES! COMPLETADO.");
        location.reload();
    }
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
        div.style.left = food.x + 'px';
        div.style.top = food.y + 'px';
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

    // Efecto túnel
    if (head.x < 0) head.x = Math.floor(container.clientWidth/box)*box - box;
    if (head.x >= container.clientWidth) head.x = 0;
    if (head.y < 0) head.y = Math.floor(container.clientHeight/box)*box - box;
    if (head.y >= container.clientHeight) head.y = 0;

    let ate = false;
    foods.forEach((f, i) => {
        if (head.x === f.x && head.y === f.y) {
            if (f.isCorrect) {
                score += 150;
                currentWordIdx++;
                if (currentWordIdx >= snakeMissions[missionIdx].words.length) {
                    missionIdx++;
                    initLevel();
                } else {
                    spawnFoods();
                }
            } else {
                lives--;
                score = Math.max(0, score - 50);
                if (lives <= 0) { gameActive = false; alert("GAME OVER"); location.reload(); }
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
        div.style.left = p.x + 'px';
        div.style.top = p.y + 'px';
        container.appendChild(div);
    });
    scoreEl.innerText = score;
    livesEl.innerText = lives;
}

function renderMission() {
    const m = snakeMissions[missionIdx];
    missionEl.innerHTML = m.words.map((w, i) => 
        `<span class="word-box ${i < currentWordIdx ? 'found' : ''}">${i < currentWordIdx ? w : '____'}</span>`
    ).join('');
}

initLevel();
setInterval(update, 150);
