// Grammar Snake Logic
const board = document.getElementById('game-board');
const missionEl = document.getElementById('mission-control');
const scoreVal = document.getElementById('score-val');
const shieldVal = document.getElementById('shield-val');

// Configuración
let snake = [{x: 160, y: 160}, {x: 140, y: 160}, {x: 120, y: 160}];
let dir = {x: 20, y: 0}, nextDir = {x: 20, y: 0};
let active = true;
let score = 0;
let lives = 5;
let currentStep = 0;
let missionIndex = 0;
let foods = [];
const boxSize = 20;

const neonColors = ['#00d4ff', '#ff00ff', '#00ff41', '#ff3131'];

function initMission() {
    // Usamos snakeMissions de tu data.js
    if (typeof snakeMissions !== 'undefined' && snakeMissions[missionIndex]) {
        currentStep = 0;
        spawnFoods();
        renderMission();
    }
}

function spawnFoods() {
    document.querySelectorAll('.food-item').forEach(f => f.remove());
    foods = [];
    
    const mission = snakeMissions[missionIndex];
    const correctWord = mission.words[currentStep];
    const options = shuffle([correctWord, ...mission.fakes]);

    options.forEach(text => {
        const food = {
            x: Math.floor(Math.random() * (board.clientWidth / boxSize - 4) + 2) * boxSize,
            y: Math.floor(Math.random() * (board.clientHeight / boxSize - 4) + 2) * boxSize,
            text: text,
            color: neonColors[Math.floor(Math.random() * neonColors.length)]
        };
        foods.push(food);
        const div = document.createElement('div');
        div.className = 'food-item';
        div.innerText = food.text.toUpperCase();
        div.style.left = food.x + 'px';
        div.style.top = food.y + 'px';
        div.style.color = food.color;
        board.appendChild(div);
    });
}

function update() {
    if (!active) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Efecto Túnel
    if (head.x < 0) head.x = Math.floor(board.clientWidth / 20) * 20 - 20;
    if (head.x >= board.clientWidth) head.x = 0;
    if (head.y < 0) head.y = Math.floor(board.clientHeight / 20) * 20 - 20;
    if (head.y >= board.clientHeight) head.y = 0;

    // Colisión con cuerpo
    if (snake.some(p => p.x === head.x && p.y === head.y)) endGame("SISTEMA DAÑADO");

    let ate = false;
    foods.forEach((f, i) => {
        // Rango de colisión un poco más amplio para palabras largas
        if (Math.abs(head.x - f.x) < 20 && Math.abs(head.y - f.y) < 20) {
            if (f.text === snakeMissions[missionIndex].words[currentStep]) {
                document.getElementById('snd-eat').play();
                score += 150;
                currentStep++;
                ate = true;
                if (currentStep >= snakeMissions[missionIndex].words.length) {
                    missionIndex++;
                    if (missionIndex >= snakeMissions.length) {
                        victory();
                    } else {
                        initMission();
                    }
                } else {
                    spawnFoods();
                }
            } else {
                lives--;
                if (lives <= 0) endGame("ESCUDOS AGOTADOS");
                spawnFoods(); // Reposicionar tras error
            }
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
        div.style.left = p.x + 'px';
        div.style.top = p.y + 'px';
        div.style.color = i === 0 ? varProp('--blue') : varProp('--pink');
        div.style.background = 'currentColor';
        board.appendChild(div);
    });
    scoreVal.innerText = score;
    shieldVal.innerText = `${lives}/5`;
    renderMission();
}

function renderMission() {
    const mission = snakeMissions[missionIndex];
    missionEl.innerHTML = mission.words.map((w, i) => 
        `<span class="slot ${i < currentStep ? 'done' : ''}">${i < currentStep ? w : '____'}</span>`
    ).join(' ');
}

function varProp(name) { return getComputedStyle(document.documentElement).getPropertyValue(name); }

function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

// Controles
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && dir.y === 0) nextDir = {x: 0, y: -20};
    if (e.key === 'ArrowDown' && dir.y === 0) nextDir = {x: 0, y: 20};
    if (e.key === 'ArrowLeft' && dir.x === 0) nextDir = {x: -20, y: 0};
    if (e.key === 'ArrowRight' && dir.x === 0) nextDir = {x: 20, y: 0};
});

function endGame(msg) {
    active = false;
    document.getElementById('snd-lose').play();
    alert(msg + "\nSCORE FINAL: " + score);
    location.reload();
}

function victory() {
    active = false;
    document.getElementById('snd-win').play();
    alert("¡MISIÓN COMPLETADA, AGENTE!");
    location.reload();
}

initMission();
setInterval(update, 150);
