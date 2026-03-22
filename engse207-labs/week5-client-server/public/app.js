// app.js - Frontend Logic
// ENGSE207 Software Architecture - Week 3 Lab
// ========================================
// API CONFIGURATION
// ========================================
const API_BASE = API_CONFIG.BASE_URL;
const API = {
    TASKS: `${API_BASE}${API_CONFIG.ENDPOINTS.TASKS}`,
    STATS: `${API_BASE}${API_CONFIG.ENDPOINTS.STATS}`
};

// ========================================
// PART 1: STATE MANAGEMENT
// ========================================

let allTasks = [];
let currentFilter = 'ALL';

// ========================================
// PART 2: DOM ELEMENTS
// ========================================

const addTaskForm = document.getElementById('addTaskForm');
const statusFilter = document.getElementById('statusFilter');
const loadingOverlay = document.getElementById('loadingOverlay');

// Task list containers
const todoTasks = document.getElementById('todoTasks');
const progressTasks = document.getElementById('progressTasks');
const doneTasks = document.getElementById('doneTasks');

// Task counters
const todoCount = document.getElementById('todoCount');
const progressCount = document.getElementById('progressCount');
const doneCount = document.getElementById('doneCount');

// ========================================
// PART 3: API FUNCTIONS - FETCH TASKS
// ========================================

async function fetchTasks() {
    showLoading();
    try {
        const response = await fetch(API.TASKS);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        allTasks = Array.isArray(result.data) ? result.data : [];
        renderTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        alert('❌ Failed to load tasks');
    } finally {
        hideLoading();
    }
}

// ========================================
// PART 4: API FUNCTIONS - CREATE TASK
// ========================================

async function createTask(taskData) {
    showLoading();
    try {
        const response = await fetch(API.TASKS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error('Failed to create task');
        }

        const result = await response.json();
        allTasks.unshift(result.data);
        renderTasks();
        addTaskForm.reset();
        alert('✅ Task created successfully!');
    } catch (error) {
        console.error('Error creating task:', error);
        alert('❌ Failed to create task');
    } finally {
        hideLoading();
    }
}

// ========================================
// PART 5: API FUNCTIONS - UPDATE STATUS
// ========================================

async function updateTaskStatus(taskId, newStatus) {
    showLoading();
    try {
        const response = await fetch(`${API.TASKS}/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update task');
        }

        const result = await response.json();
        const index = allTasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            allTasks[index] = result.data;
        }
        renderTasks();
    } catch (error) {
        console.error('Error updating task:', error);
        alert('❌ Failed to update task status');
    } finally {
        hideLoading();
    }
}

// ========================================
// PART 6: API FUNCTIONS - DELETE TASK
// ========================================

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    showLoading();
    try {
        const response = await fetch(`${API.TASKS}/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete task');
        }

        allTasks = allTasks.filter(t => t.id !== taskId);
        renderTasks();
        alert('✅ Task deleted');
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('❌ Failed to delete task');
    } finally {
        hideLoading();
    }
}

// ========================================
// PART 7: RENDER FUNCTIONS - MAIN
// ========================================

function renderTasks() {
    todoTasks.innerHTML = '';
    progressTasks.innerHTML = '';
    doneTasks.innerHTML = '';

    let filteredTasks = allTasks;
    if (currentFilter !== 'ALL') {
        filteredTasks = allTasks.filter(t => t.status === currentFilter);
    }

    const todo = filteredTasks.filter(t => t.status === 'TODO');
    const progress = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
    const done = filteredTasks.filter(t => t.status === 'DONE');

    todoCount.textContent = todo.length;
    progressCount.textContent = progress.length;
    doneCount.textContent = done.length;

    renderTaskList(todo, todoTasks, 'TODO');
    renderTaskList(progress, progressTasks, 'IN_PROGRESS');
    renderTaskList(done, doneTasks, 'DONE');
}

// ========================================
// PART 8: RENDER FUNCTIONS - LIST
// ========================================

function renderTaskList(tasks, container, status) {
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state">No tasks</div>';
        return;
    }

    tasks.forEach(task => {
        container.appendChild(createTaskCard(task, status));
    });
}

// ========================================
// PART 9: RENDER FUNCTIONS - CARD
// ========================================

function createTaskCard(task, currentStatus) {
    const card = document.createElement('div');
    card.className = 'task-card';

    card.innerHTML = `
        <div class="task-header">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <span class="priority-badge priority-${task.priority.toLowerCase()}">
                ${task.priority}
            </span>
        </div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-meta">
            Created: ${formatDate(task.created_at)}
        </div>
        <div class="task-actions">
            ${createStatusButtons(task.id, currentStatus)}
            <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">
                🗑️ Delete
            </button>
        </div>
    `;
    return card;
}

// ========================================
// PART 10: STATUS BUTTONS
// ========================================

function createStatusButtons(taskId, status) {
    const btns = [];

    if (status !== 'TODO') {
        btns.push(`<button class="btn btn-warning btn-sm" onclick="updateTaskStatus(${taskId}, 'TODO')">← To Do</button>`);
    }
    if (status !== 'IN_PROGRESS') {
        btns.push(`<button class="btn btn-info btn-sm" onclick="updateTaskStatus(${taskId}, 'IN_PROGRESS')">In Progress</button>`);
    }
    if (status !== 'DONE') {
        btns.push(`<button class="btn btn-success btn-sm" onclick="updateTaskStatus(${taskId}, 'DONE')">Done</button>`);
    }
    return btns.join(' ');
}

// ========================================
// PART 11: UTILITIES
// ========================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-US');
}

function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// ========================================
// PART 12: EVENT LISTENERS
// ========================================

addTaskForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const priority = taskPriority.value;

    if (!title) {
        alert('Please enter task title');
        return;
    }

    createTask({ title, description, priority });
});

statusFilter.addEventListener('change', e => {
    currentFilter = e.target.value;
    renderTasks();
});

// ========================================
// PART 13: INIT
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Task Board Initialized');
    fetchTasks();
});

// ========================================
// PART 14: GLOBAL
// ========================================

window.updateTaskStatus = updateTaskStatus;
window.deleteTask = deleteTask;
