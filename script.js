const BINGO_SIZE = 25;

let aufgaben = [];
let bingoItems = [];
let timerSeconds = 7 * 24 * 60 * 60;
let timerInterval = null;

function loadState() {
    const data = localStorage.getItem('bingo_data');
    if (data) {
        try {
            const parsed = JSON.parse(data);
            aufgaben = parsed.aufgaben || [];
            bingoItems = parsed.bingoItems || [];
            timerSeconds = parsed.timerSeconds || 7 * 24 * 60 * 60;
        } catch (e) {
            setDefaults();
        }
    } else {
        setDefaults();
    }
}

function setDefaults() {
    aufgaben = [];
    bingoItems = [];
    for (let i = 0; i < BINGO_SIZE; i++) {
        bingoItems.push({ text: '?', completed: false });
    }
    timerSeconds = 7 * 24 * 60 * 60;
}

function saveState() {
    const state = { aufgaben, bingoItems, timerSeconds };
    localStorage.setItem('bingo_data', JSON.stringify(state));
}

function formatTime(seconds) {
    if (seconds <= 0) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h + ':' + (m < 10 ? '0' : '') + m;
}

function buildApp() {
    const main = document.querySelector('main');
    main.innerHTML = '';

    const root = document.createElement('div');
    root.id = 'app-root';

    const taskPanel = document.createElement('div');
    taskPanel.className = 'panel task-panel';

    const header = document.createElement('div');
    header.className = 'panel-header';
    header.textContent = 'Aufgaben';

    const row = document.createElement('div');
    row.className = 'panel-row';

    const input = document.createElement('textarea');
    input.className = 'panel-input';
    input.rows = 1;
    input.placeholder = 'Deine Aufgaben...';

    const addBtn = document.createElement('button');
    addBtn.className = 'add-btn';
    addBtn.textContent = '+';

    row.appendChild(input);
    row.appendChild(addBtn);
    taskPanel.appendChild(header);
    taskPanel.appendChild(row);

    const list = document.createElement('ul');
    list.className = 'item-list';
    taskPanel.appendChild(list);

    const randomBtn = document.createElement('button');
    randomBtn.className = 'random-btn';
    randomBtn.textContent = 'Randomize';
    taskPanel.appendChild(randomBtn);

    const bingoDiv = document.createElement('div');
    bingoDiv.className = 'Bingo';

    const table = document.createElement('table');
    const timerDiv = document.createElement('div');
    timerDiv.className = 'timer';

    const btnGroup = document.createElement('div');
    btnGroup.className = 'button-group';

    const btnDaily = document.createElement('button');
    btnDaily.className = 'BUT';
    btnDaily.textContent = 'Daily';

    const btnWeekly = document.createElement('button');
    btnWeekly.className = 'BUT';
    btnWeekly.textContent = 'Weekly';

    const btnStart = document.createElement('button');
    btnStart.className = 'BUT';
    btnStart.textContent = 'Start';

    const btnReset = document.createElement('button');
    btnReset.className = 'BUT';
    btnReset.textContent = 'Reset';

    btnGroup.appendChild(btnDaily);
    btnGroup.appendChild(btnWeekly);
    btnGroup.appendChild(document.createElement('br'));
    btnGroup.appendChild(btnStart);
    btnGroup.appendChild(btnReset);

    bingoDiv.appendChild(table);
    bingoDiv.appendChild(timerDiv);
    bingoDiv.appendChild(btnGroup);

    root.appendChild(taskPanel);
    root.appendChild(bingoDiv);
    main.appendChild(root);

    addBtn.onclick = function () {
        const text = input.value.trim();
        if (text === '') return;
        aufgaben.push(text);
        input.value = '';
        renderList();
        saveState();
    };

    randomBtn.onclick = function () {
        const tasks = [...aufgaben];
        while (tasks.length < BINGO_SIZE) tasks.push('-');
        for (let i = tasks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tasks[i], tasks[j]] = [tasks[j], tasks[i]];
        }
        bingoItems = tasks.slice(0, BINGO_SIZE).map(text => ({ text, completed: false }));
        renderBoard();
        saveState();
    };

    btnDaily.onclick = function () { setTimerMode(1); };
    btnWeekly.onclick = function () { setTimerMode(7); };
    btnStart.onclick = startTimer;
    btnReset.onclick = resetBoard;

    renderAll();
}

function setTimerMode(days) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = days * 24 * 60 * 60;
    updateTimer();
    saveState();
}

function renderBoard() {
    const table = document.querySelector('.Bingo table');
    table.innerHTML = '';
    for (let r = 0; r < 5; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < 5; c++) {
            const i = r * 5 + c;
            const td = document.createElement('td');
            const item = bingoItems[i];
            td.textContent = item.text;
            if (item.completed) td.className = 'completed';
            td.onclick = function () {
                item.completed = !item.completed;
                renderBoard();
                saveState();
                checkWin();
            };
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}

function renderList() {
    const list = document.querySelector('.item-list');
    list.innerHTML = '';
    for (let i = 0; i < aufgaben.length; i++) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = aufgaben[i];

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-item';
        delBtn.innerHTML = '&times;';
        delBtn.onclick = (function (index) {
            return function (e) {
                e.stopPropagation();
                aufgaben.splice(index, 1);
                renderList();
                saveState();
            };
        })(i);

        li.appendChild(span);
        li.appendChild(delBtn);
        list.appendChild(li);
    }
}

function checkWin() {
    const lines = [
        [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
        [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
        [0,6,12,18,24], [4,8,12,16,20]
    ];
    for (const line of lines) {
        if (line.every(i => bingoItems[i].completed)) {
            clearInterval(timerInterval);
            timerInterval = null;
            alert('Bingo!');
            return;
        }
    }
}

function updateTimer() {
    document.querySelector('.timer').textContent = formatTime(timerSeconds);
}

function startTimer() {
    if (timerInterval) return;
    if (timerSeconds <= 0) {
        timerSeconds = 7 * 24 * 60 * 60;
        updateTimer();
        saveState();
    }
    timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds--;
            updateTimer();
            saveState();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            alert('Zeit abgelaufen!');
        }
    }, 1000);
}

function resetBoard() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = 7 * 24 * 60 * 60;
    bingoItems = Array.from({ length: BINGO_SIZE }, () => ({ text: '?', completed: false }));
    updateTimer();
    renderAll();
    saveState();
}

function renderAll() {
    renderBoard();
    renderList();
    updateTimer();
    const input = document.querySelector('.panel-input');
    if (input) input.value = '';
}

function init() {
    loadState();
    buildApp();
    updateTimer();
}

document.addEventListener('DOMContentLoaded', init);