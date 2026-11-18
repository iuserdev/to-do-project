
// ========================================
// ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ DOM
// ========================================

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const allCount = document.getElementById("allCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");

const remainingCount = document.getElementById("remainingCount");

const clearCompletedBtn = document.getElementById("clearCompletedBtn");

const sortSelect = document.getElementById("sortSelect");

const errorMessage = document.getElementById("errorMessage");
const charCount = document.getElementById("charCount");

const tabs = document.querySelectorAll(".tab");

// ========================================
// НАСТРОЙКИ
// ========================================

const STORAGE_KEY = "todo_tasks";

const MAX_TASK_LENGTH = 128;

let currentFilter = "all";

// ========================================
// ЗАГРУЗКА ЗАДАЧ
// ========================================

let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    );

    tasks = Array.isArray(savedTasks)
        ? savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        )
        : [];

} catch (error) {
    tasks = [];
}

// ========================================
// СОХРАНЕНИЕ ЗАДАЧ
// ========================================

function saveTasks() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}

// ========================================
// НОРМАЛИЗАЦИЯ НАЗВАНИЯ
// ========================================

function normalizeTaskName(text) {
    return text
        .trim()
        .toLocaleLowerCase("ru-RU");
}

// ========================================
// ОТОБРАЖЕНИЕ ОШИБОК
// ========================================

function showError(message) {
    errorMessage.textContent = message;

    errorMessage.classList.add("visible");
    taskInput.classList.add("error");
}

function hideError() {
    errorMessage.textContent = "";

    errorMessage.classList.remove("visible");
    taskInput.classList.remove("error");
}

// ========================================
// СЧЁТЧИК СИМВОЛОВ
// ========================================

function updateCharCount() {
    charCount.textContent = taskInput.value.length;
}

// ========================================
// ПРОВЕРКА НА ДУБЛИКАТЫ
// ========================================

function isDuplicateTask(text, excludeId = null) {
    const normalizedText = normalizeTaskName(text);

    return tasks.some(task =>
        task.id !== excludeId &&
        normalizeTaskName(task.text) === normalizedText
    );
}

// ========================================
// ДОБАВЛЕНИЕ ЗАДАЧИ
// ========================================

function addTask() {
    const text = taskInput.value.trim();

    hideError();

    // Проверка на пустое название

    if (!text) {
        showError("Введите название задачи.");
        taskInput.focus();
        return;
    }

    // Проверка длины

    if (text.length > MAX_TASK_LENGTH) {
        showError(
            `Название задачи не должно превышать ${MAX_TASK_LENGTH} символов.`
        );

        taskInput.focus();
        return;
    }

    // Проверка дубликатов

    if (isDuplicateTask(text)) {
        showError("Такая задача уже существует!");
        taskInput.focus();
        return;
    }

    // Создание задачи

    const task = {
        id: Date.now().toString() +
            Math.random().toString(36).slice(2),

        text: text,

        completed: false
    };

    // Добавляем задачу в конец списка

    tasks.push(task);

    saveTasks();
    renderTasks();

    // Очистка поля

    taskInput.value = "";

    updateCharCount();
    hideError();

    taskInput.focus();
}

// ========================================
// УДАЛЕНИЕ ЗАДАЧИ
// ========================================

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

// ========================================
// ИЗМЕНЕНИЕ СТАТУСА ЗАДАЧИ
// ========================================

function toggleTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    // Выполнение или отмена выполнения

    task.completed = !task.completed;

    saveTasks();
    renderTasks();
}

// ========================================
// РЕДАКТИРОВАНИЕ ЗАДАЧИ
// ========================================

function editTask(id) {
    const task = tasks.find(task => task.id === id);

    // Выполненные задачи редактировать нельзя

    if (!task || task.completed) {
        return;
    }

    const newText = prompt(
        "Изменить задачу:",
        task.text
    );

    if (newText === null) {
        return;
    }

    const trimmedText = newText.trim();

    // Проверка на пустое название

    if (!trimmedText) {
        alert("Название задачи не может быть пустым.");
        return;
    }

    // Проверка длины

    if (trimmedText.length > MAX_TASK_LENGTH) {
        alert(
            `Название задачи не должно превышать ${MAX_TASK_LENGTH} символов.`
        );

        return;
    }

    // Проверка дубликатов

    if (isDuplicateTask(trimmedText, task.id)) {
        alert("Задача с таким названием уже существует!");
        return;
    }

    task.text = trimmedText;

    saveTasks();
    renderTasks();
}

// ========================================
// ФИЛЬТРАЦИЯ ЗАДАЧ
// ========================================

function getFilteredTasks() {
    switch (currentFilter) {

        case "active":
            return tasks.filter(task => !task.completed);

        case "completed":
            return tasks.filter(task => task.completed);

        default:
            return tasks;
    }
}

// ========================================
// СОРТИРОВКА ЗАДАЧ
// ========================================

function sortTasks(taskArray) {
    const sorted = [...taskArray];

    switch (sortSelect.value) {

        // Сначала старые

        case "oldest":
            return sorted;

        // Сначала новые

        case "newest":
            return sorted.reverse();

        // Алфавит А-Я

        case "az":
            return sorted.sort((a, b) =>
                a.text.localeCompare(b.text, "ru")
            );

        // Алфавит Я-А

        case "za":
            return sorted.sort((a, b) =>
                b.text.localeCompare(a.text, "ru")
            );

        default:
            return sorted;
    }
}

// ========================================
// ОТОБРАЖЕНИЕ ЗАДАЧ
// ========================================

function renderTasks() {
    taskList.innerHTML = "";

    // Фильтрация и сортировка

    const filteredTasks = sortTasks(
        getFilteredTasks()
    );

    filteredTasks.forEach(task => {

        const li = document.createElement("li");

        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        // Чекбокс

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";

        checkbox.checked = task.completed;

        // Чекбокс доступен всегда:
        // можно отменить выполнение задачи

        checkbox.disabled = false;

        checkbox.setAttribute(
            "aria-label",
            task.completed
                ? "Отменить выполнение задачи"
                : "Отметить задачу выполненной"
        );

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        // Название задачи

        const span = document.createElement("span");

        span.className = "task-text";
        span.textContent = task.text;

        li.appendChild(checkbox);
        li.appendChild(span);

        // Контейнер кнопок

        const actions = document.createElement("div");

        actions.className = "task-actions";

        // Редактирование только активных задач

        if (!task.completed) {

            const editBtn = document.createElement("button");

            editBtn.className = "action-btn edit-btn";

            editBtn.textContent = "✎";
            editBtn.title = "Редактировать";

            editBtn.setAttribute(
                "aria-label",
                "Редактировать задачу"
            );

            editBtn.addEventListener("click", () => {
                editTask(task.id);
            });

            actions.appendChild(editBtn);
        }

        // Удаление любой задачи

        const deleteBtn = document.createElement("button");

        deleteBtn.className = "action-btn delete-btn";

        deleteBtn.textContent = "×";
        deleteBtn.title = "Удалить";

        deleteBtn.setAttribute(
            "aria-label",
            "Удалить задачу"
        );

        deleteBtn.addEventListener("click", () => {
            deleteTask(task.id);
        });

        actions.appendChild(deleteBtn);

        li.appendChild(actions);

        taskList.appendChild(li);
    });

    // ========================================
    // ПУСТОЕ СОСТОЯНИЕ
    // ========================================

    emptyState.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    if (filteredTasks.length === 0) {

        const emptyTitle = emptyState.querySelector("h3");
        const emptyText = emptyState.querySelector("p");

        if (tasks.length === 0) {

            emptyTitle.textContent = "Пока здесь пусто";
            emptyText.textContent = "Добавь свою первую задачу!";

        } else if (currentFilter === "active") {

            emptyTitle.textContent = "Нет активных задач";
            emptyText.textContent = "Все задачи уже выполнены!";

        } else if (currentFilter === "completed") {

            emptyTitle.textContent = "Нет выполненных задач";
            emptyText.textContent =
                "Здесь появятся завершённые задачи.";
        }
    }

    // ========================================
    // СЧЁТЧИКИ
    // ========================================

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const active = tasks.length - completed;

    allCount.textContent = tasks.length;
    activeCount.textContent = active;
    completedCount.textContent = completed;

    remainingCount.textContent =
        `Осталось задач: ${active}`;

    // ========================================
    // КНОПКА ОЧИСТКИ
    // ========================================

    clearCompletedBtn.style.display =
        completed > 0 ? "block" : "none";
}

// ========================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ========================================

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(item => {
            item.classList.remove("active");
        });

        tab.classList.add("active");

        currentFilter = tab.dataset.filter;

        renderTasks();
    });
});

// ========================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ========================================

// Добавление по кнопке

addTaskBtn.addEventListener("click", addTask);

// Добавление по Enter

taskInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        addTask();
    }
});

// Обновление счётчика символов

taskInput.addEventListener("input", () => {

    updateCharCount();

    if (errorMessage.classList.contains("visible")) {
        hideError();
    }
});

// Сортировка

sortSelect.addEventListener("change", () => {
    renderTasks();
});

// Очистка выполненных задач

clearCompletedBtn.addEventListener("click", () => {

    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
});

// ========================================
// ПЕРВОНАЧАЛЬНЫЙ ЗАПУСК
// ========================================

updateCharCount();
renderTasks();
