// Diese Funktion schaltet zwischen den Räumen um
function openTab(tabId) {
    // 1. Suche alle Räume und nimm ihnen das Wort "active" weg (versteckt sie)
    let contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active');
    });

    // 2. Gib NUR dem angeklickten Raum das Wort "active" (macht ihn sichtbar)
    document.getElementById(tabId).classList.add('active');
}
// Funktion zum Hinzufügen einer Aufgabe
function addTodo() {
    let input = document.getElementById('todo-input');
    let text = input.value.trim();

    if (text !== "") {
        let ul = document.getElementById('todo-list');
        let li = document.createElement('li');
        
        // 1. Die Checkbox erstellen
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        
        // 2. Der Text der Aufgabe
        let span = document.createElement('span');
        span.textContent = text;
        
        // Wenn man die Checkbox anklickt -> Text durchstreichen/normal machen
        checkbox.onchange = function() {
            if (checkbox.checked) {
                span.classList.add('completed');
            } else {
                span.classList.remove('completed');
            }
        };

        // 3. Löschen-Button (X)
        let deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✖';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = function() {
            li.remove();
        };

        // Einen kleinen Kasten für Checkbox + Text zusammen bauen
        let leftContainer = document.createElement('div');
        leftContainer.className = 'todo-left';
        leftContainer.appendChild(checkbox);
        leftContainer.appendChild(span);

        // Alles ins Li-Element packen
        li.appendChild(leftContainer);
        li.appendChild(deleteBtn);
        ul.appendChild(li);

        // Eingabefeld leeren
        input.value = "";
    }
}
// --- KALENDER LOGIK ---
let currentDate = new Date(); // Speichert das aktuelle Datum
let selectedDateKey = "";     // Speichert den aktuell geklickten Tag (z.B. "2026-8-11")
let events = {};              // Speichert alle Termine im Speicher

function renderCalendar() {
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();

    // Namen der Monate auf Deutsch
    let monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni",
                      "Juli", "August", "September", "Oktober", "November", "Dezember"];

    // Monat und Jahr oben anzeigen
    document.getElementById('month-year-display').textContent = `${monthNames[month]} ${year}`;

    let daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = ""; // Vorherige Tage löschen

    // Erster Tag des Monats & Anzahl der Tage herausfinden
    let firstDay = new Date(year, month, 1).getDay();
    let totalDays = new Date(year, month + 1, 0).getDate();

    // In JS startet der Sonntag bei 0. Umrechnen für Mo-So (Mo = 0, So = 6)
    let startDay = firstDay === 0 ? 6 : firstDay - 1;

    // Leere Felder am Anfang auffüllen
    for (let i = 0; i < startDay; i++) {
        let emptyDiv = document.createElement('div');
        emptyDiv.className = 'day empty';
        daysContainer.appendChild(emptyDiv);
    }

    let today = new Date();

    // Alle Tage des Monats erstellen
    for (let day = 1; day <= totalDays; day++) {
        let dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.textContent = day;

        let dateKey = `${year}-${month}-${day}`;

        // Heutigen Tag markieren
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today');
        }

        // Wenn dieser Tag ausgewählt ist
        if (selectedDateKey === dateKey) {
            dayDiv.classList.add('selected');
        }

        // Klick auf ein Datum
        dayDiv.onclick = function() {
            selectDate(year, month, day, dateKey);
        };

        daysContainer.appendChild(dayDiv);
    }
}

// Tag auswählen
function selectDate(year, month, day, dateKey) {
    selectedDateKey = dateKey;
    let monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni",
                      "Juli", "August", "September", "Oktober", "November", "Dezember"];

    document.getElementById('selected-date-text').textContent = `Termine am ${day}. ${monthNames[month]} ${year}`;
    renderCalendar();
    showEvents();
}

// Termin hinzufügen
function addEvent() {
    let input = document.getElementById('event-input');
    let text = input.value.trim();

    if (text !== "" && selectedDateKey !== "") {
        if (!events[selectedDateKey]) {
            events[selectedDateKey] = [];
        }
        events[selectedDateKey].push(text);
        input.value = "";
        showEvents();
    }
}

// Termine des Tages anzeigen
function showEvents() {
    let list = document.getElementById('event-list');
    list.innerHTML = "";

    if (events[selectedDateKey]) {
        events[selectedDateKey].forEach((evt, index) => {
            let li = document.createElement('li');
            li.textContent = evt;

            let delBtn = document.createElement('button');
            delBtn.textContent = 'X';
            delBtn.className = 'delete-btn';
            delBtn.onclick = function() {
                events[selectedDateKey].splice(index, 1);
                showEvents();
            };

            li.appendChild(delBtn);
            list.appendChild(li);
        });
    }
}

// Monate vor und zurück schalten
function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

// Kalender direkt beim Laden der Seite aufbauen
renderCalendar();
// --- GYM PLANER LOGIK ---
let workoutActive = false;
let workoutTimerInterval = null;
let workoutSeconds = 0;
let gymLogs = [];

// Workout Starten / Stoppen
function toggleWorkout() {
    let btn = document.getElementById('workout-toggle-btn');
    let timerDiv = document.getElementById('workout-timer');

    if (!workoutActive) {
        // Starten
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
        // Stoppen
        workoutActive = false;
        btn.textContent = 'Workout Starten 🏋️';
        btn.className = 'workout-btn start';

        clearInterval(workoutTimerInterval);
        alert(`Klasse Workout! Gesamtzeit: ${formatTime(workoutSeconds)}`);
        timerDiv.style.display = 'none';
    }
}

function updateTimerDisplay() {
    document.getElementById('timer-display').textContent = formatTime(workoutSeconds);
}

function formatTime(totalSeconds) {
    let mins = Math.floor(totalSeconds / 60);
    let secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Satz hinzufügen
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

    gymLogs.unshift(logEntry); // Neueste Einträge nach oben

    // Eingabefelder leeren
    document.getElementById('gym-weight').value = "";
    document.getElementById('gym-reps').value = "";

    renderGymLogs();
}

// Verlauf anzeigen
function renderGymLogs() {
    let list = document.getElementById('gym-log-list');
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
        delBtn.onclick = function() {
            gymLogs.splice(index, 1);
            renderGymLogs();
        };

        li.appendChild(infoDiv);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

// --- JOURNAL LOGIK ---
let selectedMood = "";
let journalEntries = [];

// Heutiges Datum automatisch im Datumsfeld eintragen
document.addEventListener("DOMContentLoaded", () => {
    let dateInput = document.getElementById('journal-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
});

// Stimmung auswählen
function selectMood(mood, btnElement) {
    selectedMood = mood;
    let buttons = document.querySelectorAll('.mood-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    btnElement.classList.add('selected');
}

// Eintrag speichern
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

    journalEntries.unshift(entry); // Neuesten Eintrag oben anzeigen

    // Felder leeren
    document.getElementById('journal-notes').value = "";
    document.getElementById('journal-grateful').value = "";
    document.getElementById('journal-goals').value = "";
    selectedMood = "";
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));

    renderJournalEntries();
}

// Sammlung anzeigen
function renderJournalEntries() {
    let container = document.getElementById('journal-entries-container');
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

        // Löschen-Button für die Karte
        let delBtn = document.createElement('button');
        delBtn.textContent = 'Eintrag Löschen ✖';
        delBtn.className = 'delete-btn';
        delBtn.style.marginTop = '10px';
        delBtn.onclick = function() {
            journalEntries.splice(index, 1);
            renderJournalEntries();
        };

        card.appendChild(delBtn);
        container.appendChild(card);
    });
}