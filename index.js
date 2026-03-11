// Clase para las tareas
function Task(id, text, priority, completed, createdAt) {
    this.id = id;
    this.text = text;
    this.priority = priority;
    this.completed = completed;
    this.createdAt = createdAt;
}

// Clase principal de la aplicación
function TaskFlowApp() {
    this.tasks = [];
    this.taskForm = document.getElementById('task-form');
    this.taskInput = document.getElementById('task-input');
    this.taskPriority = document.getElementById('task-priority');
    this.tasksContainer = document.getElementById('tasks-container');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    
    this.initialize();
}

TaskFlowApp.prototype.initialize = function() {
    this.loadTasks();
    this.setupEventListeners();
    this.renderTasks();
};

TaskFlowApp.prototype.setupEventListeners = function() {
    this.taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addTask();
    });

    this.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            this.filterTasks(button.dataset.filter);
        });
    });
};

TaskFlowApp.prototype.addTask = function() {
    const text = this.taskInput.value.trim();
    if (!text) return;

    const newTask = new Task(
        Date.now().toString(),
        text,
        this.taskPriority.value,
        false,
        new Date()
    );

    this.tasks.unshift(newTask);
    this.saveTasks();
    this.renderTasks();
    this.taskInput.value = '';
    this.taskInput.focus();
};

TaskFlowApp.prototype.toggleTask = function(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        this.saveTasks();
        this.renderTasks();
    }
};

TaskFlowApp.prototype.deleteTask = function(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
    this.renderTasks();
};

TaskFlowApp.prototype.filterTasks = function(filter) {
    this.filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    this.renderTasks(filter);
};

TaskFlowApp.prototype.renderTasks = function(filter = 'all') {
    let filteredTasks = this.tasks;

    switch (filter) {
        case 'pending':
            filteredTasks = this.tasks.filter(t => !t.completed);
            break;
        case 'completed':
            filteredTasks = this.tasks.filter(t => t.completed);
            break;
    }

    this.tasksContainer.innerHTML = '';

    if (filteredTasks.length === 0) {
        this.tasksContainer.innerHTML = `
            <div class="empty-state">
                <p>No hay tareas ${filter === 'pending' ? 'pendientes' : filter === 'completed' ? 'completadas' : ''}</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const taskElement = this.createTaskElement(task);
        this.tasksContainer.appendChild(taskElement);
    });
};

TaskFlowApp.prototype.createTaskElement = function(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task ${task.completed ? 'completed' : ''} priority-${task.priority}`;
    
    const priorityColors = {
        'baja': '#10b981',
        'media': '#f59e0b',
        'alta': '#ef4444'
    };

    taskDiv.innerHTML = `
        <div class="task-content">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <span class="task-priority" style="background-color: ${priorityColors[task.priority]}">
                ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
        </div>
        <button class="delete-btn">🗑️</button>
    `;

    const checkbox = taskDiv.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => this.toggleTask(task.id));

    const deleteBtn = taskDiv.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

    return taskDiv;
};

TaskFlowApp.prototype.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

TaskFlowApp.prototype.saveTasks = function() {
    localStorage.setItem('taskflow-tasks', JSON.stringify(this.tasks));
};

TaskFlowApp.prototype.loadTasks = function() {
    const savedTasks = localStorage.getItem('taskflow-tasks');
    if (savedTasks) {
        this.tasks = JSON.parse(savedTasks, (key, value) => {
            if (key === 'createdAt') {
                return new Date(value);
            }
            return value;
        });
    }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new TaskFlowApp();
});
