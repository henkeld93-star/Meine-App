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

function openTab(tabId, btnElement) {
    let contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    let buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    if (btnElement) btnElement.classList.add('active');

    if (tabId === 'kalender-tab') {
        renderCalendar();
    }
}

// TO-DO
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
        li.innerHTML = `
            <span onclick="toggleTodo(${index})" style="cursor:pointer;">${todo.completed ? '☑' : '☐'} ${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${index})">✖</button>
        `;
        list.appendChild(li);
    });
}

// KALENDER
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

        dayDiv.onclick = () => selectCalendarDay(dateString);

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

function selectCalendarDay(dateString) {
    selectedDateStr = dateString;
    let titleLabel = document.getElementById('selected-day-label');
    if (titleLabel) {
        let parts = dateString.split('-');
        titleLabel.textContent = `Termine am ${parts[2]}.${parts[1]}.${parts[0]}:`;
    }
    renderCalendar();
}

function addEvent() {
    let input = document.getElementById('event-title');
    let title = input ? input.value.trim() : "";

    if (!selectedDateStr) {
        alert("Bitte klicke zuerst einen Tag im Kalender an!");
        return;
    }

    if (title === "") {
        alert("Bitte einen Namen für den Termin eingeben!");
        return;
    }

    events.push({ date: selectedDateStr, title: title });
    if (input) input.value = "";

    localStorage.setItem('my_events', JSON.stringify(events));
    renderCalendar();
}

function deleteEvent(index) {
    events.splice(index, 1);
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
        li.innerHTML = `
            <span>${eventItem.title} (${parts[2]}.${parts[1]}.${parts[0]})</span>
            <button class="delete-btn" onclick="deleteEvent(${originalIndex})">✖</button>
        `;
        list.appendChild(li);
    });
}

// GYM
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
        alert(`Workout beendet! Zeit: ${formatTime(workoutSeconds)}`);
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

    if (!weight || !reps) {
        alert("Bitte Gewicht und Wiederholungen eingeben!");
        return;
    }

    gymLogs.unshift({ exercise, weight, reps, date: new Date().toLocaleDateString('de-DE') });
    document.getElementById('gym-weight').value = "";
    document.getElementById('gym-reps').value = "";

    localStorage.setItem('my_gymLogs', JSON.stringify(gymLogs));
    renderGymLogs();
}

function deleteGymLog(index) {
    gymLogs.splice(index, 1);
    localStorage.setItem('my_gymLogs', JSON.stringify(gymLogs));
    renderGymLogs();
}

function renderGymLogs() {
    let list = document.getElementById('gym-log-list');
    if (!list) return;
    list.innerHTML = "";
    gymLogs.forEach((log, index) => {
        let li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${log.exercise}</strong>: ${log.weight}kg × ${log.reps} Wdh.</span>
            <button class="delete-btn" onclick="deleteGymLog(${index})">✖</button>
        `;
        list.appendChild(li);
    });
}

// JOURNAL
function selectMood(mood, btnElement) {
    selectedMood = mood;
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
    btnElement.classList.add('selected');
}

function saveJournalEntry() {
    let date = document.getElementById('journal-date').value;
    let notes = document.getElementById('journal-notes').value.trim();
    let grateful = document.getElementById('journal-grateful').value.trim();
    let goals = document.getElementById('journal-goals').value.trim();

    if (!date) {
        alert("Bitte Datum wählen!");
        return;
    }

    journalEntries.unshift({
        date: new Date(date).toLocaleDateString('de-DE'),
        notes: notes || "Keine Notizen",
        grateful: grateful || "-",
        goals: goals || "-",
        mood: selectedMood || "😐"
    });

    document.getElementById('journal-notes').value = "";
    document.getElementById('journal-grateful').value = "";
    document.getElementById('journal-goals').value = "";
    selectedMood = "";
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));

    localStorage.setItem('my_journalEntries', JSON.stringify(journalEntries));
    renderJournalEntries();
}

function deleteJournalEntry(index) {
    journalEntries.splice(index, 1);
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
                <span>📅 ${entry.date}</span>
                <span>${entry.mood}</span>
            </div>
            <p><strong>Notizen:</strong> ${entry.notes}</p>
            <p><strong>Dankbar für:</strong> ${entry.grateful}</p>
            <p><strong>Ziele:</strong> ${entry.goals}</p>
            <button class="delete-btn" style="margin-top:8px;" onclick="deleteJournalEntry(${index})">Eintrag löschen ✖</button>
        `;
        container.appendChild(card);
    });
}
