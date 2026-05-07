// game.js
const board = document.getElementById('game-board');
const missionEl = document.getElementById('mission-control');
const scoreVal = document.getElementById('score-val');
const shieldVal = document.getElementById('shield-val');

// Referencias de audio
const snd = {
    bg: document.getElementById('snd-bg'),
    eat: document.getElementById('snd-eat'),
    win: document.getElementById('snd-win'),
    lose: document.getElementById('snd-lose')
};

// Configuración inicial
let snake = [{x: 160, y: 160}, {x: 140, y: 160}, {x: 120, y: 160}];
let dir = {x: 20, y: 0}, nextDir = {x: 20, y: 0};
let active = false;
let score = 0;
let lives = 5;
let currentStep = 0;
let missionIndex = 0;
let foods = [];
let mistakesLog = [];
let currentMission;

const boxSize = 20;

// Colores neón para las palabras
const neonColors = ['#00d4ff', '#ff00ff', '#00ff41', '#ff3131', '#9d00ff', '#ffff00'];

// Iniciar el juego (Llamada desde el botón del index.html)
window.initGame = function() {
    active = true;
    score = 0;
    lives = 5;
    missionIndex = 0;
    mistakesLog = [];
    resetMission();
    gameLoop();
};

function resetMission() {
    // Usamos snakeMissions de tu data.js
    currentMission = snakeMissions[missionIndex];
    currentStep = 0;
    spawnFoods();
    renderHUD();
}

function spawnFoods() {
    // Limpiar palabras anteriores
    document.querySelectorAll('.food-item').forEach(f => f.remove());
    foods = [];

    // Palabra correcta
    const correctWord = currentMission.words[currentStep];
    // Palabras falsas
    const options = [correctWord, ...currentMission.fakes];

    options.forEach(text => {
        const food = {
            x: Math.floor(Math.random() * (board.clientWidth / boxSize - 2) + 1) * boxSize,
            y: Math.floor(Math.random() * (board.clientHeight / boxSize - 2) + 1) * boxSize,
            text: text,
            color: neonColors[Math.floor(Math.random() * neonColors.length)]
        };
        foods.push(food);
        createFoodElement(food);
    });
}

function createFoodElement(food) {
    const div = document.createElement('div');
    div.className = 'food-item';
    div.innerText = food.text.toUpperCase();
    div.style.left = food.x + 'px';
    div.style.top = food.y + 'px';
    div.style.color = food.color;
    board.appendChild(div);
}

// Control por teclado
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && dir.y === 0) nextDir = {x: 0, y: -boxSize};
    if (e.key === 'ArrowDown' && dir.y === 0) nextDir = {x: 0, y: boxSize};
    if (e.key === 'ArrowLeft' && dir.x === 0) nextDir = {x: -boxSize, y: 0};
    if (e.key === 'ArrowRight' && dir.x === 0) nextDir = {x: boxSize, y: 0};
});

function update() {
    if (!active) return;

    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Efecto túnel (Atravesar paredes)
    if (head.x < 0) head.x = board.clientWidth - boxSize;
    if (head.x >= board.clientWidth) head.x = 0;
    if (head.y < 0) head.y = board.clientHeight - boxSize;
    if (head.y >= board.clientHeight) head.y = 0;

    // Colisión con el cuerpo
    if (snake.some(p => p.x === head.x && p.y === head.y)) {
        gameOver("¡TE HAS MORDIDO!");
        return;
    }

    let ate = false;
    // Chequear si come una palabra
    foods.forEach((f, i) => {
        if (head.x === f.x && head.y === f.y) {
            if (f.text === currentMission.words[currentStep]) {
                // Acierto
                snd.eat.play();
                score += 100;
                currentStep++;
                ate = true;
                if (currentStep >= currentMission.words.length) {
                    missionIndex++;
                    if (missionIndex >= snakeMissions.length) {
                        victory();
                    } else {
                        resetMission();
                    }
                } else {
                    spawnFoods();
                }
            } else {
                // Error
                lives--;
                mistakesLog.push({word: f.text, correct: currentMission.words[currentStep], note: currentMission.note});
                if (lives <= 0) gameOver("ESCUDOS AGOTADOS");
            }
        }
    });

    if (!ate) snake.pop();
    snake.unshift(head);
    
    draw();
}

function draw() {
    // Dibujar serpiente
    document.querySelectorAll('.snake-part').forEach(p => p.remove());
    snake.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'snake-part';
        div.style.left = p.x + 'px';
        div.style.top = p.y + 'px';
        div.style.background = i === 0 ? '#00d4ff' : '#ff00ff';
        board.appendChild(div);
    });

    // Actualizar HUD
    scoreVal.innerText = score;
    shieldVal.innerText = `${lives}/5`;
    renderHUD();
}

function renderHUD() {
    // Muestra la frase con espacios por completar
    missionEl.innerHTML = currentMission.words.map((w, i) => 
        `<span class="slot ${i < currentStep ? 'done' : ''}">${i < currentStep ? w : '____'}</span>`
    ).join(' ');
}

function gameOver(reason) {
    active = false;
    snd.bg.pause();
    snd.lose.play();
    alert(reason + "\n\nMisión fallida. Intenta de nuevo.");
    location.reload();
}

function victory() {
    active = false;
    snd.bg.pause();
    snd.win.play();
    alert("¡FELICIDADES! Has completado todas las misiones gramaticales.");
    location.reload();
}

function gameLoop() {
    if (active) {
        update();
        setTimeout(gameLoop, 180); // Velocidad ajustada para pensar
    }
}
