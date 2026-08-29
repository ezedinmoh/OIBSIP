const STORAGE_KEY = "nova-tasks";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const pendingList = document.querySelector("#pending-list");
const completedList = document.querySelector("#completed-list");
const pendingEmpty = document.querySelector("#pending-empty");
const completedEmpty = document.querySelector("#completed-empty");
const totalCount = document.querySelector("#total-count");
const pendingCount = document.querySelector("#pending-count");
const completedCount = document.querySelector("#completed-count");
const pendingHeadingCount = document.querySelector("#pending-heading-count");
const completedHeadingCount = document.querySelector(
  "#completed-heading-count",
);
const currentDate = document.querySelector("#current-date");

let tasks = loadTasks();

initialize();

function initialize() {
  updateDate();
  render();
}

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks.filter(
      (task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.text === "string" &&
        typeof task.completed === "boolean" &&
        typeof task.createdAt === "string",
    );
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateDate() {
  const date = new Date();

  currentDate.textContent = date
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

function createTask(text) {
  return {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}

function render() {
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  renderTaskList(pendingList, pendingTasks);
  renderTaskList(completedList, completedTasks);

  updateCounts(pendingTasks.length, completedTasks.length);

  pendingEmpty.hidden = pendingTasks.length !== 0;
  completedEmpty.hidden = completedTasks.length !== 0;
}

function renderTaskList(list, taskList) {
  list.querySelectorAll(".task-item").forEach((item) => item.remove());

  taskList.forEach((task) => {
    list.appendChild(createTaskElement(task));
  });
}

function updateCounts(pending, completed) {
  const total = pending + completed;

  totalCount.textContent = total;
  pendingCount.textContent = pending;
  completedCount.textContent = completed;
  pendingHeadingCount.textContent = pending;
  completedHeadingCount.textContent = completed;
}

function createTaskElement(task) {
  const article = document.createElement("article");

  article.className = `task-item${task.completed ? " completed" : ""}`;
  article.dataset.taskId = task.id;

  article.innerHTML = `
    <button
      type="button"
      class="task-toggle"
      aria-label="${task.completed ? "Mark task as pending" : "Complete task"}"
    ></button>

    <div class="task-content">
      <p class="task-text"></p>
      <p class="task-meta">
        ${task.completed ? "Completed" : "Created"} ·
        ${formatDate(task.completedAt || task.createdAt)}
      </p>
    </div>

    <div class="task-actions">
      <button
        type="button"
        class="task-menu-button"
        aria-label="Open task actions"
        aria-expanded="false"
      >
        ⋮
      </button>

      <div class="task-menu" hidden>
        ${
          task.completed
            ? ""
            : '<button type="button" data-action="complete">Complete</button>'
        }
        <button type="button" data-action="edit">Edit</button>
        <button
          type="button"
          class="delete-action"
          data-action="delete"
        >
          Delete
        </button>
      </div>
    </div>
  `;

  article.querySelector(".task-text").textContent = task.text;

  return article;
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.unshift(createTask(text));

  saveTasks();
  render();

  taskForm.reset();
  taskInput.focus();
});

document.addEventListener("click", (event) => {
  const menuButton = event.target.closest(".task-menu-button");

  if (menuButton) {
    toggleTaskMenu(menuButton);
    return;
  }

  const actionButton = event.target.closest("[data-action]");

  if (actionButton) {
    handleTaskAction(actionButton);
    return;
  }

  const toggleButton = event.target.closest(".task-toggle");

  if (toggleButton) {
    toggleTask(toggleButton);
    return;
  }

  closeAllMenus();
});

function toggleTaskMenu(button) {
  const menu = button.nextElementSibling;
  const isOpen = !menu.hidden;

  closeAllMenus();

  if (!isOpen) {
    menu.hidden = false;
    button.setAttribute("aria-expanded", "true");
  }
}

function closeAllMenus() {
  document.querySelectorAll(".task-menu").forEach((menu) => {
    menu.hidden = true;
  });

  document.querySelectorAll(".task-menu-button").forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
}

function handleTaskAction(button) {
  const taskItem = button.closest(".task-item");

  if (!taskItem) {
    return;
  }

  const taskId = taskItem.dataset.taskId;
  const action = button.dataset.action;

  closeAllMenus();

  if (action === "complete") {
    completeTask(taskId);
  }

  if (action === "edit") {
    startEditing(taskId);
  }

  if (action === "delete") {
    deleteTask(taskId);
  }
}

function toggleTask(button) {
  const taskItem = button.closest(".task-item");

  if (!taskItem) {
    return;
  }

  const taskId = taskItem.dataset.taskId;
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;

  saveTasks();
  render();
}

function completeTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  task.completed = true;
  task.completedAt = new Date().toISOString();

  saveTasks();
  render();
}

function startEditing(taskId) {
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  closeAllMenus();

  const taskItem = document.querySelector(`[data-task-id="${taskId}"]`);

  if (!taskItem) {
    return;
  }

  const content = taskItem.querySelector(".task-content");
  const actions = taskItem.querySelector(".task-actions");

  actions.hidden = true;

  content.innerHTML = `
    <input
      type="text"
      class="task-edit"
      value=""
      maxlength="200"
      aria-label="Edit task"
    >

    <div class="edit-controls">
      <button type="button" class="save-edit">
        Save
      </button>

      <button type="button" class="cancel-edit">
        Cancel
      </button>
    </div>
  `;

  const input = content.querySelector(".task-edit");

  input.value = task.text;
  input.focus();
  input.select();

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      saveEdit(taskId);
    }

    if (event.key === "Escape") {
      render();
    }
  });

  content.querySelector(".save-edit").addEventListener("click", () => {
    saveEdit(taskId);
  });

  content.querySelector(".cancel-edit").addEventListener("click", () => {
    render();
  });
}

function saveEdit(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  const taskItem = document.querySelector(`[data-task-id="${taskId}"]`);

  if (!task || !taskItem) {
    return;
  }

  const input = taskItem.querySelector(".task-edit");

  if (!input) {
    return;
  }

  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  task.text = text;

  saveTasks();
  render();
}

function deleteTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  const confirmed = window.confirm(`Delete "${task.text}"?`);

  if (!confirmed) {
    return;
  }

  tasks = tasks.filter((item) => item.id !== taskId);

  saveTasks();
  render();
}
