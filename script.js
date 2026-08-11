// --- DATEN AUS LOCALSTORAGE LADEN ---
let todos = JSON.parse(localStorage.getItem('my_todos')) || [];
let events = JSON.parse(localStorage.getItem('my_events')) || [];
let gymLogs = JSON.parse(localStorage.getItem('my_gymLogs')) || [];
let journalEntries = JSON.parse(localStorage.getItem('my_journalEntries')) || [];

let currentCalendarDate = new Date();
let selectedDateStr = "";

let workoutActive = false;
let workoutTimerInterval = null;
let workoutSeconds = 0;
let selectedMood = "";

// Beim Start ausführen
document.addEventListener("DOMContentLoaded", () => {
    renderTodos();
    renderCalendar();
    renderGymLogs();
    renderJournalEntries();

    let dateInput = document.getElementById('journal-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
});

// --- TAB WECHSELN ---
function openTab(tabId, btnElement) {
    let contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    let buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    if (btnElement) btnElement.classList.add('active');

    // Falls Kalender geöffnet wird, Raster neu zeichnen
    if (tabId === 'kalender-tab' || tabId === 'kalender') {
        renderCalendar();
    }
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
function renderCalendar() {
    let monthYearDisplay = document.getElementById('month-year-display');
    let daysContainer = document.getElementById('calendar-days');
    
    if (!monthYearDisplay || !daysContainer) return;

    daysContainer.innerHTML = "";

    let year = currentCalendarDate.getFullYear();
    let month = currentCalendarDate.getMonth();

    let monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    let firstDayIndex = new Date(year, month, 1).getDay();
    let adjustedFirstDay = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
    let totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < adjustedFirstDay; i++) {
        let emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        daysContainer.appendChild(emptyDiv);
    }

    for (let day = 1; day <= totalDays; day++) {
        let dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;

        let formattedDay = String(day).padStart(2, '0');
        let formattedMonth = String(month + 1).padStart(2, '0');
        let dateString = `${year}-${formattedMonth}-${formattedDay}`;

        if (events.some(e => e.date === dateString)) {
            dayDiv.classList.add('has-event');
        }

        if (selectedDateStr === dateString) {
            dayDiv.classList.add('selected');
        }

        dayDiv.onclick = () => selectCalendarDay(dateString, dayDiv);

        daysContainer.appendChild(dayDiv);
    }

    renderEvents();
}

function prevMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
}

function selectCalendarDay(dateString, element) {
    selectedDateStr = dateString;
    
    document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');

    let titleLabel = document.getElementById('selected-day-label');
    if (titleLabel) {
        let parts = dateString.split('-');
        titleLabel.textContent = `Termine am ${parts[2]}.${parts[1]}.${parts[0]}:`;
    }

    renderEvents();
}

function addEvent() {
    let input = document.getElementById('event-title');
    let title = input ? input.value.trim() : "";

    if (!selectedDateStr) {
        alert("Bitte zuerst einen Tag im Kalender anklicken!");
        return;
    }

    if (title === "") {
        alert("Bitte einen Titel für den Termin eingeben!");
        return;
    }

    events.push({ date: selectedDateStr, title: title });
    if (input) input.value = "";

    saveAndRenderEvents();
}

function deleteEvent(index) {
    events.splice(index, 1);
    saveAndRenderEvents();
}

function saveAndRenderEvents() {
    localStorage.setItem('my_events', JSON.stringify(events));
    renderCalendar();
}

function renderEvents() {
    let list = document.getElementById('event-list');
    if (!list) return;
    list.innerHTML = "";

    let filteredEvents = selectedDateStr 
        ? events.filter(e => e.date === selectedDateStr) 
        : events;

    filteredEvents.forEach((eventItem) => {
        let originalIndex = events.indexOf(eventItem);
        let li = document.createElement('li');

        let parts = eventItem.date.split('-');
        let formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;

        let span = document.createElement('span');
        span.textContent = `${eventItem.title} (${formattedDate})`;

        let delBtn = document.createElement('button');
        delBtn.textContent = '✖';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => deleteEvent(originalIndex);

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
        if (btn) {
            btn.textContent = 'Workout Beenden ⏹️';
            btn.className = 'workout-btn stop';
        }
        if (timerDiv) timerDiv.style.display = 'block';

        workoutSeconds = 0;
        updateTimerDisplay();

        workoutTimerInterval = setInterval(() => {
            workoutSeconds++;
            updateTimerDisplay();
        }, 1000);
    } else {
        workoutActive = false;
        if (btn) {
            btn.textContent = 'Workout Starten 🏋️';
            btn.className = 'workout-btn start';
        }

        clearInterval(workoutTimerInterval);
        alert(`Klasse Workout! Gesamtzeit: ${formatTime(workoutSeconds)}`);
        if (timerDiv) timerDiv.style.display = 'none';
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
    let exerciseEl = document.getElementById('exercise-select');
    let weightEl = document.getElementById('gym-weight');
    let repsEl = document.getElementById('gym-reps');

    if (!exerciseEl || !weightEl || !repsEl) return;

    let exercise = exerciseEl.value;
    let weight = weightEl.value;
    let reps = repsEl.value;

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

    weightEl.value = "";
    repsEl.value = "";

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
    let dateInput = document.getElementById('journal-date');
    let notesInput = document.getElementById('journal-notes');
    let gratefulInput = document.getElementById('journal-grateful');
    let goalsInput = document.getElementById('journal-goals');

    if (!dateInput || !dateInput.value) {
        alert("Bitte wähle ein Datum aus!");
        return;
    }

    let entry = {
        date: new Date(dateInput.value).toLocaleDateString('de-DE'),
        notes: notesInput ? notesInput.value.trim() || "Keine Notizen" : "Keine Notizen",
        grateful: gratefulInput ? gratefulInput.value.trim() || "Nichts eingetragen" : "Nichts eingetragen",
        goals: goalsInput ? goalsInput.value.trim() || "Nichts eingetragen" : "Nichts eingetragen",
        mood: selectedMood || "Keine Stimmung"
    };

    journalEntries.unshift(entry);

    if (notesInput) notesInput.value = "";
    if (gratefulInput) gratefulInput.value = "";
    if (goalsInput) goalsInput.value = "";
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
