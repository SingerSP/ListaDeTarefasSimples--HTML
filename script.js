// script.js - Kanban Board Otimizado

class KanbanManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentPriorityFilter = 'todas';
        this.draggedElement = null;
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.render();
    }

    cacheDOM() {
        // Inputs
        this.taskInput = document.getElementById('taskInput');
        this.taskDescription = document.getElementById('taskDescription');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.addButton = document.getElementById('addButton');

        // Colunas
        this.todoColumn = document.getElementById('todoTasks');
        this.inProgressColumn = document.getElementById('inProgressTasks');
        this.doneColumn = document.getElementById('doneTasks');

        // Estatísticas
        this.todoCount = document.getElementById('todoCount');
        this.inProgressCount = document.getElementById('inProgressCount');
        this.doneCount = document.getElementById('doneCount');
        this.totalCount = document.getElementById('totalCount');

        // Contadores das colunas
        this.todoColumnCount = document.getElementById('todoColumnCount');
        this.inProgressColumnCount = document.getElementById('inProgressColumnCount');
        this.doneColumnCount = document.getElementById('doneColumnCount');

        // Filtros de prioridade
        this.priorityFilterButtons = document.querySelectorAll('.priority-filter-btn');

        // Template
        this.taskTemplate = document.getElementById('taskCardTemplate');
    }

    bindEvents() {
        // Adicionar tarefa
        this.addButton.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Event delegation para todas as colunas
        [this.todoColumn, this.inProgressColumn, this.doneColumn].forEach(column => {
            column.addEventListener('click', (e) => this.handleCardClick(e));
            
            // Drag and Drop
            column.addEventListener('dragover', (e) => this.handleDragOver(e));
            column.addEventListener('drop', (e) => this.handleDrop(e));
        });

        // Filtros de prioridade
        this.priorityFilterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setPriorityFilter(e.target.dataset.priority));
        });
    }

    // === FUNÇÕES PRINCIPAIS ===

    addTask() {
        const taskText = this.taskInput.value.trim();
        const taskDesc = this.taskDescription.value.trim();
        const priority = this.prioritySelect.value;

        if (!taskText) {
            this.showAlert('Por favor, digite o título da tarefa!');
            return;
        }

        const newTask = {
            id: Date.now() + Math.random(),
            title: taskText,
            description: taskDesc,
            priority: priority,
            status: 'todo',
            createdAt: new Date().toLocaleString('pt-BR')
        };

        this.tasks.push(newTask);
        
        // Limpar inputs
        this.taskInput.value = '';
        this.taskDescription.value = '';
        this.prioritySelect.value = 'media';
        this.taskInput.focus();

        this.saveAndUpdate();
    }

    moveTask(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            this.saveAndUpdate();
        }
    }

    deleteTask(taskId) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveAndUpdate();
        }
    }

    // === RENDERIZAÇÃO ===

    render() {
        this.renderAllColumns();
        this.updateStats();
    }

    renderAllColumns() {
        this.renderColumn('todo', this.todoColumn);
        this.renderColumn('inprogress', this.inProgressColumn);
        this.renderColumn('done', this.doneColumn);
    }

    renderColumn(status, columnElement) {
        const filteredTasks = this.getFilteredTasksByStatus(status);
        
        columnElement.innerHTML = '';

        if (filteredTasks.length === 0) {
            columnElement.innerHTML = '<div class="empty-column">Nenhuma tarefa</div>';
            return;
        }

        filteredTasks.forEach(task => {
            const taskCard = this.createTaskCard(task);
            columnElement.appendChild(taskCard);
        });
    }

    createTaskCard(task) {
        const template = this.taskTemplate.content.cloneNode(true);
        const card = template.querySelector('.task-card');

        // Configurar card
        card.dataset.id = task.id;
        card.dataset.priority = task.priority;

        // Título e descrição
        card.querySelector('.task-title').textContent = task.title;
        const descElement = card.querySelector('.task-description');
        if (task.description) {
            descElement.textContent = task.description;
        } else {
            descElement.style.display = 'none';
        }

        // Badge de prioridade
        const badge = card.querySelector('.priority-badge');
        badge.textContent = this.getPriorityLabel(task.priority);
        badge.classList.add(`priority-${task.priority}`);

        // Data
        card.querySelector('.task-date').textContent = task.createdAt;

        // Configurar botões de movimento
        const moveLeft = card.querySelector('.move-left');
        const moveRight = card.querySelector('.move-right');

        if (task.status === 'todo') {
            moveLeft.style.display = 'none';
        } else if (task.status === 'done') {
            moveRight.style.display = 'none';
        }

        // Eventos de drag
        card.addEventListener('dragstart', (e) => this.handleDragStart(e));
        card.addEventListener('dragend', (e) => this.handleDragEnd(e));

        return card;
    }

    // === FILTROS ===

    getFilteredTasksByStatus(status) {
        let filteredTasks = this.tasks.filter(task => task.status === status);

        if (this.currentPriorityFilter !== 'todas') {
            filteredTasks = filteredTasks.filter(task => 
                task.priority === this.currentPriorityFilter
            );
        }

        return filteredTasks;
    }

    setPriorityFilter(priority) {
        this.currentPriorityFilter = priority;

        // Atualizar estado visual dos botões
        this.priorityFilterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.priority === priority);
        });

        this.render();
    }

    // === ESTATÍSTICAS ===

    updateStats() {
        const todoTasks = this.tasks.filter(t => t.status === 'todo').length;
        const inProgressTasks = this.tasks.filter(t => t.status === 'inprogress').length;
        const doneTasks = this.tasks.filter(t => t.status === 'done').length;
        const total = this.tasks.length;

        // Estatísticas principais
        this.todoCount.textContent = todoTasks;
        this.inProgressCount.textContent = inProgressTasks;
        this.doneCount.textContent = doneTasks;
        this.totalCount.textContent = total;

        // Contadores das colunas
        this.todoColumnCount.textContent = todoTasks;
        this.inProgressColumnCount.textContent = inProgressTasks;
        this.doneColumnCount.textContent = doneTasks;
    }

    // === DRAG AND DROP ===

    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragEnd(e) {
        e.target.style.opacity = '1';
    }

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        const column = e.target.closest('.tasks-container');
        if (column && this.draggedElement) {
            const taskId = parseFloat(this.draggedElement.dataset.id);
            const newStatus = column.dataset.column;
            this.moveTask(taskId, newStatus);
        }

        return false;
    }

    // === HANDLERS DE EVENTOS ===

    handleCardClick(e) {
        const card = e.target.closest('.task-card');
        if (!card) return;

        const taskId = parseFloat(card.dataset.id);
        const task = this.tasks.find(t => t.id === taskId);

        if (e.target.classList.contains('delete-btn')) {
            this.deleteTask(taskId);
        } else if (e.target.classList.contains('move-left')) {
            this.moveTaskLeft(task);
        } else if (e.target.classList.contains('move-right')) {
            this.moveTaskRight(task);
        }
    }

    moveTaskLeft(task) {
        if (task.status === 'inprogress') {
            this.moveTask(task.id, 'todo');
        } else if (task.status === 'done') {
            this.moveTask(task.id, 'inprogress');
        }
    }

    moveTaskRight(task) {
        if (task.status === 'todo') {
            this.moveTask(task.id, 'inprogress');
        } else if (task.status === 'inprogress') {
            this.moveTask(task.id, 'done');
        }
    }

    // === GERENCIAMENTO DE DADOS ===

    saveAndUpdate() {
        this.saveTasks();
        this.render();
    }

    loadTasks() {
        const stored = localStorage.getItem('kanbanTasks');
        return stored ? JSON.parse(stored) : [];
    }

    saveTasks() {
        localStorage.setItem('kanbanTasks', JSON.stringify(this.tasks));
    }

    // === UTILITÁRIOS ===

    getPriorityLabel(priority) {
        const labels = {
            'baixa': 'Baixa',
            'media': 'Média',
            'alta': 'Alta'
        };
        return labels[priority] || priority;
    }

    showAlert(message) {
        alert(message);
    }

    // Métodos públicos para exportação/importação
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kanban-backup-${Date.now()}.json`;
        link.click();
    }

    clearAllTasks() {
        if (confirm('Tem certeza que deseja limpar TODAS as tarefas? Esta ação não pode ser desfeita!')) {
            this.tasks = [];
            this.saveAndUpdate();
        }
    }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    const kanban = new KanbanManager();
    
    // Expor globalmente para debug/console
    window.kanban = kanban;
    
    console.log('✅ Kanban Board carregado com sucesso!');
    console.log('💡 Use window.kanban para acessar funcionalidades via console');
});