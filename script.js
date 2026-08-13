const STORAGE_KEYS = {
  todo: "focusBoard.todos",
  links: "focusBoard.links",
  timer: "focusBoard.timerDuration",
  attendance: "focusBoard.attendance",
  theme: "focusBoard.theme",
};

const greetingElement = document.getElementById("greeting");
const dateLabel = document.getElementById("dateLabel");
const clockLabel = document.getElementById("clockLabel");
const minutesLabel = document.getElementById("minutes");
const secondsLabel = document.getElementById("seconds");
const durationInput = document.getElementById("durationInput");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const applyDurationBtn = document.getElementById("applyDurationBtn");
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const linkForm = document.getElementById("linkForm");
const linkTitle = document.getElementById("linkTitle");
const linkUrl = document.getElementById("linkUrl");
const linkList = document.getElementById("linkList");
const attendanceForm = document.getElementById("attendanceForm");
const attendanceId = document.getElementById("attendanceId");
const attendanceName = document.getElementById("attendanceName");
const attendanceStatus = document.getElementById("attendanceStatus");
const attendanceCheckIn = document.getElementById("attendanceCheckIn");
const attendanceCheckOut = document.getElementById("attendanceCheckOut");
const attendanceToday = document.getElementById("attendanceToday");
const presentCount = document.getElementById("presentCount");
const permitCount = document.getElementById("permitCount");
const sickCount = document.getElementById("sickCount");
const adminAttendanceList = document.getElementById("adminAttendanceList");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const adminLoginPanel = document.getElementById("adminLoginPanel");
const adminContent = document.getElementById("adminContent");
const themeToggleBtn = document.getElementById("themeToggleBtn");

let timerDuration = Number(localStorage.getItem(STORAGE_KEYS.timer) || 25 * 60);
let timeLeft = timerDuration;
let timerId = null;
let isRunning = false;

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function updateClock() {
  const now = new Date();
  clockLabel.textContent = now.toLocaleTimeString("en-GB", {
    hour12: false,
  });

  dateLabel.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  greetingElement.textContent = getGreeting();
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return {
    minutes: String(mins).padStart(2, "0"),
    seconds: String(secs).padStart(2, "0"),
  };
}

function renderTimer() {
  const { minutes, seconds } = formatTime(timeLeft);
  minutesLabel.textContent = minutes;
  secondsLabel.textContent = seconds;

  const sessionMinutes = Math.floor(timerDuration / 60);
  durationInput.value = sessionMinutes;
  startPauseBtn.textContent = isRunning ? "Pause" : "Start";
}

function saveTimerDuration() {
  localStorage.setItem(STORAGE_KEYS.timer, String(timerDuration));
}

function applyTimerDuration() {
  const value = Number(durationInput.value);
  const safeValue = Math.min(Math.max(value || 25, 1), 90);
  timerDuration = safeValue * 60;
  timeLeft = timerDuration;
  saveTimerDuration();
  renderTimer();
}

function startTimer() {
  if (isRunning) {
    clearInterval(timerId);
    isRunning = false;
    renderTimer();
    return;
  }

  isRunning = true;
  renderTimer();

  timerId = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft -= 1;
      renderTimer();
      return;
    }

    clearInterval(timerId);
    isRunning = false;
    renderTimer();
    alert("Focus session complete. Great job!");
  }, 1000);
}

function resetTimer() {
  clearInterval(timerId);
  isRunning = false;
  timeLeft = timerDuration;
  renderTimer();
}

function readTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.todo) || "[]");
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEYS.todo, JSON.stringify(todos));
}

function renderTodos() {
  const todos = readTodos();
  todoList.innerHTML = "";

  if (!todos.length) {
    const empty = document.createElement("li");
    empty.className = "item";
    empty.innerHTML = '<div class="item-main"><span class="item-text"><strong>No tasks yet.</strong></span></div>';
    todoList.appendChild(empty);
    return;
  }

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "item";

    const isCompleted = todo.completed ? "completed" : "";
    item.innerHTML = `
      <div class="item-main">
        <input class="checkbox" type="checkbox" ${todo.completed ? "checked" : ""} data-action="toggle" data-id="${todo.id}" />
        <span class="item-text">
          <strong class="${isCompleted}">${todo.text}</strong>
        </span>
      </div>
      <div class="item-actions">
        <button type="button" class="icon-button delete" data-action="delete" data-id="${todo.id}" aria-label="Delete task">Delete</button>
      </div>
    `;

    todoList.appendChild(item);
  });
}

function addTodo(event) {
  event.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  const todos = readTodos();
  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });

  saveTodos(todos);
  todoInput.value = "";
  renderTodos();
}

function toggleTodo(id) {
  const todos = readTodos().map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos(todos);
  renderTodos();
}

function deleteTodo(id) {
  const todos = readTodos().filter((todo) => todo.id !== id);
  saveTodos(todos);
  renderTodos();
}

function readLinks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.links) || "[]");
  } catch {
    return [];
  }
}

function saveLinks(links) {
  localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(links));
}

function renderLinks() {
  const links = readLinks();
  linkList.innerHTML = "";

  if (!links.length) {
    const empty = document.createElement("li");
    empty.className = "item link-item";
    empty.innerHTML = '<div class="item-main"><span class="item-text"><strong>No links yet.</strong></span></div>';
    linkList.appendChild(empty);
    return;
  }

  links.forEach((link) => {
    const item = document.createElement("li");
    item.className = "link-item";
    item.innerHTML = `
      <a href="${link.url}" target="_blank" rel="noreferrer">${link.title}</a>
      <div class="item-actions">
        <button type="button" class="icon-button delete" data-action="delete-link" data-id="${link.id}" aria-label="Delete link">×</button>
      </div>
    `;

    linkList.appendChild(item);
  });
}

function addLink(event) {
  event.preventDefault();
  const title = linkTitle.value.trim();
  const url = linkUrl.value.trim();

  if (!title || !url) return;

  const formattedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const links = readLinks();
  links.unshift({
    id: crypto.randomUUID(),
    title,
    url: formattedUrl,
  });

  saveLinks(links);
  linkForm.reset();
  renderLinks();
}

function deleteLink(id) {
  const links = readLinks().filter((link) => link.id !== id);
  saveLinks(links);
  renderLinks();
}

function readAttendance() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.attendance) || "[]");
  } catch {
    return [];
  }
}

function saveAttendance(records) {
  localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(records));
}

function getTodayDateKey() {
  return new Date().toISOString().split("T")[0];
}

let isAdminLoggedIn = false;
const ADMIN_PASSWORD = "admin123";

function renderAttendanceAdmin() {
  const records = readAttendance();
  const todayKey = getTodayDateKey();
  const todayRecords = records.filter((record) => record.date === todayKey);

  const counts = {
    Hadir: 0,
    Izin: 0,
    Sakit: 0,
  };

  todayRecords.forEach((record) => {
    if (counts[record.status] !== undefined) {
      counts[record.status] += 1;
    }
  });

  attendanceToday.textContent = String(todayRecords.length);
  presentCount.textContent = String(counts.Hadir);
  permitCount.textContent = String(counts.Izin);
  sickCount.textContent = String(counts.Sakit);

  if (!isAdminLoggedIn) {
    adminLoginPanel.classList.remove("hidden");
    adminContent.classList.add("hidden");
    adminLogoutBtn.classList.add("hidden");
    adminAttendanceList.innerHTML = "";
    return;
  }

  adminLoginPanel.classList.add("hidden");
  adminContent.classList.remove("hidden");
  adminLogoutBtn.classList.remove("hidden");

  adminAttendanceList.innerHTML = "";

  if (!todayRecords.length) {
    const empty = document.createElement("li");
    empty.className = "admin-entry";
    empty.innerHTML = '<div><div class="meta">Belum ada data absen</div></div>';
    adminAttendanceList.appendChild(empty);
    return;
  }

  todayRecords
    .slice()
    .reverse()
    .forEach((record) => {
      const item = document.createElement("li");
      item.className = "admin-entry";
      item.innerHTML = `
        <div>
          <div class="name">${record.name}</div>
          <div class="meta">${record.checkIn || "-"} - ${record.checkOut || "-"}</div>
        </div>
        <div class="admin-actions">
          <button type="button" class="edit-btn" data-action="edit-attendance" data-id="${record.id}">Edit</button>
          <button type="button" class="delete-btn" data-action="delete-attendance" data-id="${record.id}">Hapus</button>
          <span class="status status-${record.status.toLowerCase()}">${record.status}</span>
        </div>
      `;
      adminAttendanceList.appendChild(item);
    });
}

function resetAttendanceForm() {
  attendanceForm.reset();
  attendanceId.value = "";
  attendanceStatus.value = "Hadir";
}

function addAttendance(event) {
  event.preventDefault();
  const name = attendanceName.value.trim();
  const status = attendanceStatus.value;
  const checkIn = attendanceCheckIn.value || "-";
  const checkOut = attendanceCheckOut.value || "-";

  if (!name) return;

  const records = readAttendance();
  const existingId = attendanceId.value;

  if (existingId) {
    const recordIndex = records.findIndex((record) => record.id === existingId);
    if (recordIndex !== -1) {
      records[recordIndex] = {
        ...records[recordIndex],
        name,
        status,
        checkIn,
        checkOut,
      };
    }
  } else {
    records.push({
      id: crypto.randomUUID(),
      name,
      status,
      date: getTodayDateKey(),
      checkIn,
      checkOut,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  }

  saveAttendance(records);
  resetAttendanceForm();
  renderAttendanceAdmin();
}

function handleAdminLogin() {
  const password = adminPasswordInput.value.trim();

  if (password === ADMIN_PASSWORD) {
    isAdminLoggedIn = true;
    adminPasswordInput.value = "";
    renderAttendanceAdmin();
    return;
  }

  alert("Password admin salah.");
}

function logoutAdmin() {
  isAdminLoggedIn = false;
  adminPasswordInput.value = "";
  renderAttendanceAdmin();
}

function editAttendance(id) {
  const records = readAttendance();
  const record = records.find((item) => item.id === id);
  if (!record) return;

  attendanceId.value = record.id;
  attendanceName.value = record.name;
  attendanceStatus.value = record.status;
  attendanceCheckIn.value = record.checkIn === "-" ? "" : record.checkIn;
  attendanceCheckOut.value = record.checkOut === "-" ? "" : record.checkOut;
  attendanceName.focus();
}

function deleteAttendance(id) {
  const records = readAttendance().filter((record) => record.id !== id);
  saveAttendance(records);
  renderAttendanceAdmin();
}

function applyTheme(theme) {
  const selectedTheme = theme === "light" ? "light" : "dark";
  document.body.dataset.theme = selectedTheme;
  localStorage.setItem(STORAGE_KEYS.theme, selectedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.textContent = selectedTheme === "dark" ? "Light mode" : "Dark mode";
    themeToggleBtn.setAttribute("aria-label", `Switch to ${selectedTheme === "dark" ? "light" : "dark"} mode`);
  }
}

function initDefaultData() {
  if (!localStorage.getItem(STORAGE_KEYS.todo)) {
    localStorage.setItem(
      STORAGE_KEYS.todo,
      JSON.stringify([
        { id: "todo-1", text: "belanja", completed: false },
        { id: "todo-2", text: "belajar", completed: false },
      ])
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.links)) {
    localStorage.setItem(
      STORAGE_KEYS.links,
      JSON.stringify([
        { id: "link-1", title: "Google", url: "https://www.google.com" },
        { id: "link-2", title: "Gmail", url: "https://mail.google.com" },
        { id: "link-3", title: "Calendar", url: "https://calendar.google.com" },
      ])
    );
  }

  if (!localStorage.getItem(STORAGE_KEYS.attendance)) {
    const today = getTodayDateKey();
    localStorage.setItem(
      STORAGE_KEYS.attendance,
      JSON.stringify([
        { id: "absen-1", name: "Bagas", status: "Hadir", date: today, time: "08:15" },
        { id: "absen-2", name: "Rina", status: "Izin", date: today, time: "08:20" },
      ])
    );
  }
}

function initEventListeners() {
  startPauseBtn.addEventListener("click", startTimer);
  resetBtn.addEventListener("click", resetTimer);
  applyDurationBtn.addEventListener("click", applyTimerDuration);
  durationInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyTimerDuration();
    }
  });

  todoForm.addEventListener("submit", addTodo);
  todoList.addEventListener("click", (event) => {
    const target = event.target;
    const id = target.dataset.id;
    const action = target.dataset.action;

    if (!id) return;

    if (action === "toggle") {
      toggleTodo(id);
      return;
    }

    if (action === "delete") {
      deleteTodo(id);
    }
  });

  todoList.addEventListener("change", (event) => {
    const target = event.target;
    if (target.matches("input[type='checkbox']")) {
      toggleTodo(target.dataset.id);
    }
  });

  linkForm.addEventListener("submit", addLink);
  linkList.addEventListener("click", (event) => {
    const target = event.target;
    const id = target.dataset.id;
    if (target.dataset.action === "delete-link") {
      deleteLink(id);
    }
  });

  attendanceForm.addEventListener("submit", addAttendance);
  adminLoginBtn.addEventListener("click", handleAdminLogin);
  adminPasswordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleAdminLogin();
    }
  });
  adminLogoutBtn.addEventListener("click", logoutAdmin);

  adminAttendanceList.addEventListener("click", (event) => {
    const target = event.target;
    const id = target.dataset.id;
    const action = target.dataset.action;

    if (!id) return;

    if (action === "edit-attendance") {
      editAttendance(id);
    }

    if (action === "delete-attendance") {
      deleteAttendance(id);
    }
  });

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.body.dataset.theme === "light" ? "light" : "dark";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

function init() {
  initDefaultData();
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "dark";
  applyTheme(savedTheme);
  updateClock();
  setInterval(updateClock, 1000);
  renderTimer();
  renderTodos();
  renderLinks();
  renderAttendanceAdmin();
  initEventListeners();
}

init();
