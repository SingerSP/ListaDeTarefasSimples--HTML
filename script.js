// script.js - Versão Otimizada

class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.render();
    }

    cacheDOM() {
        // Elementos principais
        this.taskInput = document.getElementById('taskInput');
        this.addButton = document.getElementById('addButton');
        this.taskList = document.getElementById('taskList');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // Elementos de estatísticas
        this.totalTasks = document.getElementById('totalTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.completedTasks = document.getElementById('completedTasks');
    }

    bindEvents() {
        // Event delegation para a lista de tarefas
        this.taskList.addEventListener('click', (e) => this.handleTaskClick(e));
        this.taskList.addEventListener('change', (e) => this.handleTaskChange(e));

        // Eventos de entrada
        this.addButton.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filtros
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Botão limpar concluídas
        document.getElementById('clearCompleted')?.addEventListener('click', () => this.clearCompleted());
    }

    // === FUNÇÕES PRINCIPAIS ===

    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (!taskText) {
            this.showAlert('Por favor, digite uma tarefa!');
            return;
        }

        const newTask = {
            id: Date.now() + Math.random(), // ID mais único
            text: taskText,
            completed: false,
            createdAt: new Date().toLocaleString('pt-BR')
        };

        this.tasks.push(newTask);
        this.taskInput.value = '';
        this.taskInput.focus();
        
        this.saveAndUpdate();
    }

    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveAndUpdate();
        }
    }

    deleteTask(taskId) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveAndUpdate();
        }
    }

    editTask(taskId, currentText) {
        const newText = prompt('Edite sua tarefa:', currentText);
        
        if (newText?.trim()) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.text = newText.trim();
                this.saveAndUpdate();
            }
        }
    }

    // === RENDERIZAÇÃO ===

    render() {
        this.renderTasks();
        this.updateStats();
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        this.taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-content">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                    >
                    <span class="task-text">${this.escapeHTML(task.text)}</span>
                    <small class="task-date">${task.createdAt}</small>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" title="Editar tarefa">✏️</button>
                    <button class="delete-btn" title="Excluir tarefa">×</button>
                </div>
            </li>
        `).join('');
    }

    // === FILTROS E ESTATÍSTICAS ===

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Atualiza estado visual dos botões
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTasks();
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
        this.pendingTasks.textContent = pending;
    }

    // === GERENCIAMENTO DE DADOS ===

    clearCompleted() {
        const hasCompleted = this.tasks.some(task => task.completed);
        
        if (!hasCompleted) {
            this.showAlert('Não há tarefas concluídas para limpar!');
            return;
        }

        if (confirm('Deseja limpar todas as tarefas concluídas?')) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveAndUpdate();
        }
    }

    saveAndUpdate() {
        this.saveToStorage();
        this.render();
    }

    saveToStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // === HANDLERS DE EVENTOS ===

    handleTaskClick(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        const taskId = parseFloat(taskItem.dataset.id);

        if (e.target.classList.contains('delete-btn')) {
            this.deleteTask(taskId);
        } else if (e.target.classList.contains('edit-btn')) {
            const taskText = taskItem.querySelector('.task-text').textContent;
            this.editTask(taskId, taskText);
        }
    }

    handleTaskChange(e) {
        if (e.target.classList.contains('task-checkbox')) {
            const taskId = parseFloat(e.target.closest('.task-item').dataset.id);
            this.toggleTaskCompletion(taskId);
        }
    }

    // === UTILITÁRIOS ===

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showAlert(message) {
        alert(message);
    }

    // Métodos úteis para debug/expansão
    getTaskCount() {
        return this.tasks.length;
    }

    getCompletedCount() {
        return this.tasks.filter(task => task.completed).length;
    }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});

// Adiciona botão de limpar concluídas dinamicamente se não existir
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('clearCompleted')) {
        const statsDiv = document.querySelector('.stats');
        if (statsDiv) {
            const clearButton = document.createElement('button');
            clearButton.id = 'clearCompleted';
            clearButton.textContent = 'Limpar Concluídas';
            clearButton.className = 'clear-btn';
            statsDiv.appendChild(clearButton);
        }
    }
});