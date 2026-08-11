// --- INITIALISIERUNG / DATEN LADEN ---
let todos = JSON.parse(localStorage.getItem('my_todos')) || [];
let events = JSON.parse(localStorage.getItem('my_events')) || [];
let gymLogs = JSON.parse(localStorage.getItem('my_gymLogs')) || [];
let journalEntries = JSON.parse(localStorage.getItem('my_journalEntries')) || [];

let workoutActive = false;
let workoutTimerInterval = null;
let workoutSeconds = 0;
let selectedMood = "";

// Beim Laden der Seite alle gespeicherten Daten anzeigen
document.addEventListener("DOMContentLoaded", () => {
    renderTodos();
    renderEvents();
    renderGymLogs();
    renderJournalEntries();

    let dateInput = document.getElementById('journal-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
});

// --- TABS WECHSELN ---
function openTab(tabId) {
    let contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    let buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// --- 1. TO-DO LOGIK ---
function addTodo() {
    let input = document.getElementById('todo-input');
    let text = input.value.trim();

    if (text !== "") {
        todos.push({ text: text, completed: false });
        input.value = "";
        saveAndRenderTodos();
    }
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveAndRenderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveAndRenderTodos();
}

function saveAndRenderTodos() {
    localStorage.setItem('my_todos', JSON.stringify(todos));
    renderTodos();
}

function renderTodos() {
    let list = document.getElementById('todo-list');
    if (!list) return;
    list.innerHTML = "";

    todos.forEach((todo, index) => {
        let li = document.createElement('li');
        if (todo.completed) li.classList.add('completed');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.onclick = () => toggleTodo(index);

        let span = document.createElement('span');
        span.textContent = todo.text;

        let delBtn = document.createElement('button');
        delBtn.textContent = '✖';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => deleteTodo(index);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

// --- 2. KALENDER LOGIK ---
function addEvent() {
    let date = document.getElementById('event-date').value;
    let title = document.getElementById('event-title').value.trim();

    if (date === "" || title === "") {
        alert("Bitte Datum und Titel eingeben!");
        return;
    }

    events.push({ date: date, title: title });
    document.getElementById('event-date').value = "";
    document.getElementById('event-title').value = "";

    saveAndRenderEvents();
}

function deleteEvent(index) {
    events.splice(index, 1);
    saveAndRenderEvents();
}

function saveAndRenderEvents() {
    localStorage.setItem('my_events', JSON.stringify(events));
    renderEvents();
}

function renderEvents() {
    let list = document.getElementById('event-list');
    if (!list) return;
    list.innerHTML = "";

    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    events.forEach((eventItem, index) => {
        let li = document.createElement('li');

        let formattedDate = new Date(eventItem.date).toLocaleDateString('de-DE');

        let span = document.createElement('span');
        span.textContent = `${formattedDate}: ${eventItem.title}`;

        let delBtn = document.createElement('button');
        delBtn.textContent = '✖';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => deleteEvent(index);

        li.appendChild(span);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

// --- 3. GYM PLANER LOGIK ---
function toggleWorkout() {
    let btn = document.getElementById('workout-toggle-btn');
    let timerDiv = document.getElementById('workout-timer');

    if (!workoutActive) {
        workoutActive = true;
        btn.textContent = 'Workout Beenden ⏹️';
        btn.className = 'workout-btn stop';
        timerDiv.style.display = 'block';

        workoutSeconds = 0;
        updateTimerDisplay();

        workoutTimerInterval = setInterval(() => {
            workoutSeconds++;
            updateTimerDisplay();
        }, 1000);
    } else {
        workoutActive = false;
        btn.textContent = 'Workout Starten 🏋️';
        btn.className = 'workout-btn start';

        clearInterval(workoutTimerInterval);
        alert(`Klasse Workout! Gesamtzeit: ${formatTime(workoutSeconds)}`);
        timerDiv.style.display = 'none';
    }
}

function updateTimerDisplay() {
    let timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) timerDisplay.textContent = formatTime(workoutSeconds);
}

function formatTime(totalSeconds) {
    let mins = Math.floor(totalSeconds / 60);
    let secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function addGymSet() {
    let exercise = document.getElementById('exercise-select').value;
    let weight = document.getElementById('gym-weight').value;
    let reps = document.getElementById('gym-reps').value;

    if (weight === "" || reps === "") {
        alert("Bitte gib Gewicht und Wiederholungen ein!");
        return;
    }

    let logEntry = {
        exercise: exercise,
        weight: weight,
        reps: reps,
        date: new Date().toLocaleDateString('de-DE')
    };

    gymLogs.unshift(logEntry);

    document.getElementById('gym-weight').value = "";
    document.getElementById('gym-reps').value = "";

    saveAndRenderGymLogs();
}

function deleteGymLog(index) {
    gymLogs.splice(index, 1);
    saveAndRenderGymLogs();
}

function saveAndRenderGymLogs() {
    localStorage.setItem('my_gymLogs', JSON.stringify(gymLogs));
    renderGymLogs();
}

function renderGymLogs() {
    let list = document.getElementById('gym-log-list');
    if (!list) return;
    list.innerHTML = "";

    gymLogs.forEach((log, index) => {
        let li = document.createElement('li');

        let infoDiv = document.createElement('div');
        infoDiv.className = 'gym-log-info';

        let exSpan = document.createElement('span');
        exSpan.className = 'gym-log-exercise';
        exSpan.textContent = log.exercise;

        let detailsSpan = document.createElement('span');
        detailsSpan.className = 'gym-log-details';
        detailsSpan.textContent = `${log.weight} kg  ×  ${log.reps} Wdh. (${log.date})`;

        infoDiv.appendChild(exSpan);
        infoDiv.appendChild(detailsSpan);

        let delBtn = document.createElement('button');
        delBtn.textContent = '✖';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => deleteGymLog(index);

        li.appendChild(infoDiv);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

// --- 4. JOURNAL LOGIK ---
function selectMood(mood, btnElement) {
    selectedMood = mood;
    let buttons = document.querySelectorAll('.mood-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    btnElement.classList.add('selected');
}

function saveJournalEntry() {
    let date = document.getElementById('journal-date').value;
    let notes = document.getElementById('journal-notes').value.trim();
    let grateful = document.getElementById('journal-grateful').value.trim();
    let goals = document.getElementById('journal-goals').value.trim();

    if (!date) {
        alert("Bitte wähle ein Datum aus!");
        return;
    }

    let entry = {
        date: new Date(date).toLocaleDateString('de-DE'),
        notes: notes || "Keine Notizen",
        grateful: grateful || "Nichts eingetragen",
        goals: goals || "Nichts eingetragen",
        mood: selectedMood || "Keine Stimmung"
    };

    journalEntries.unshift(entry);

    document.getElementById('journal-notes').value = "";
    document.getElementById('journal-grateful').value = "";
    document.getElementById('journal-goals').value = "";
    selectedMood = "";
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));

    saveAndRenderJournal();
}

function deleteJournalEntry(index) {
    journalEntries.splice(index, 1);
    saveAndRenderJournal();
}

function saveAndRenderJournal() {
    localStorage.setItem('my_journalEntries', JSON.stringify(journalEntries));
    renderJournalEntries();
}

function renderJournalEntries() {
    let container = document.getElementById('journal-entries-container');
    if (!container) return;
    container.innerHTML = "";

    journalEntries.forEach((entry, index) => {
        let card = document.createElement('div');
        card.className = 'journal-card';

        card.innerHTML = `
            <div class="journal-card-header">
                <span class="journal-card-date">📅 ${entry.date}</span>
                <span class="journal-card-mood">${entry.mood}</span>
            </div>
            <div class="journal-card-section">
                <strong>Gedanken & Notizen:</strong>
                ${entry.notes}
            </div>
            <div class="journal-card-section">
                <strong>Dankbar für:</strong>
                ${entry.grateful}
            </div>
            <div class="journal-card-section">
                <strong>Ziele für morgen:</strong>
                ${entry.goals}
            </div>
        `;

        let delBtn = document.createElement('button');
        delBtn.textContent = 'Eintrag Löschen ✖';
        delBtn.className = 'delete-btn';
        delBtn.style.marginTop = '10px';
        delBtn.onclick = () => deleteJournalEntry(index);

        card.appendChild(delBtn);
        container.appendChild(card);
    });
}
