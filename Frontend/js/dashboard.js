/*Menú Hamburguesa*/
const menuToggle = document.getElementById('menuToggle');
const navList = document.getElementById('navList');
const menuIcon = document.getElementById('menuIcon');

let menuOpen = false;

menuToggle.addEventListener('click', function() {
    menuOpen = !menuOpen;
    
    if (menuOpen) {
        navList.classList.add('open');
        menuIcon.src = './icons/menu-close.svg';
        menuIcon.alt = 'Cerrar menú';
    } else {
        navList.classList.remove('open');
        menuIcon.src = './icons/menu-open.svg';
        menuIcon.alt = 'Abrir menú';
    }
});

/*Cerrar Menú - Enlace*/
const navLinks = document.querySelectorAll('.nav_link');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            navList.classList.remove('open');
            menuIcon.src = './icons/menu-open.svg';
            menuIcon.alt = 'Abrir menú';
            menuOpen = false;
        }
        
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

/*Cerrar Menú - Espacio en blanco*/
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
        const nav = document.querySelector('.nav');
        if (!nav.contains(e.target)) {
            navList.classList.remove('open');
            menuIcon.src = './icons/menu-open.svg';
            menuIcon.alt = 'Abrir menú';
            menuOpen = false;
        }
    }
});

/*Validación de sesión*/
/*if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
}
*/
console.log('Dashboard cargado correctamente');

const openTaskFormBtn = document.getElementById('openTaskForm');
const taskFormContainer = document.getElementById('taskFormContainer');
const cancelTaskBtn = document.getElementById('cancelTask');
const taskForm = document.getElementById('taskForm');
const tasksContainer = document.getElementById('tasksContainer');
const notification = document.getElementById('notification');

/*Almacenar las tareas*/
let tasks = [];

/*Mostrar u ocultar formulario*/
openTaskFormBtn.addEventListener('click', function() {
    taskFormContainer.classList.toggle('active');
    if (taskFormContainer.classList.contains('active')) {
        this.textContent = '✕ Cerrar formulario';
    } else {
        this.textContent = '+ Asignar nueva tarea';
        taskForm.reset();
    }
});

cancelTaskBtn.addEventListener('click', function() {
    taskFormContainer.classList.remove('active');
    openTaskFormBtn.textContent = '+ Asignar nueva tarea';
    taskForm.reset();
});

/*Guardar tarea*/
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const taskName = document.getElementById('taskName').value;
    const taskSubject = document.getElementById('taskSubject').value;
    const taskPriority = document.getElementById('taskPriority').value;
    const taskDeadline = document.getElementById('taskDeadline').value;
    const taskChild = document.getElementById('taskChild').value;
    
    const newTask = {
        id: Date.now(),
        name: taskName,
        subject: taskSubject,
        priority: taskPriority,
        deadline: taskDeadline,
        child: taskChild,
        assignedDate: new Date().toLocaleDateString('es-ES')
    };
    
    tasks.push(newTask);
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    showNotification('✅ Tarea asignada correctamente');
    
    taskForm.reset();
    taskFormContainer.classList.remove('active');
    openTaskFormBtn.textContent = '+ Asignar nueva tarea';
    
    renderTasks();
});

/*Notificación*/
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/*Mostrar Tareas*/
function renderTasks() {
    // Cargar tareas desde localStorage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

     // Verificar si hay un filtro de hijo
    const filterChild = localStorage.getItem('filterChild');
    let filteredTasks = tasks;
    let filterMessage = '';
    
    if (filterChild) {
        filteredTasks = tasks.filter(task => task.child === filterChild);
        filterMessage = `Mostrando tareas de ${filterChild}`;
        // Limpiar el filtro después de usarlo
        localStorage.removeItem('filterChild');
    }

    // Actualizar contador
    const taskCounter = document.getElementById('taskCounter');
    if (taskCounter) {
        taskCounter.textContent = `Total: ${filteredTasks.length} tareas ${filterMessage ? '- ' + filterMessage : ''}`;
    }
    
    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>${filterMessage ? `No hay tareas asignadas a ${filterChild}` : 'No hay tareas asignadas aún'}</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Haz clic en "Asignar nueva tarea" para comenzar</p>
            </div>
        `;
        return;
    }
    
     // Agrupar tareas por hijo (solo con las tareas filtradas)
    const tasksByChild = {};
    filteredTasks.forEach(task => {
        if (!tasksByChild[task.child]) {
            tasksByChild[task.child] = [];
        }
        tasksByChild[task.child].push(task);
    });
    
    // Generar HTML
    let html = '';
    
    // Botón para eliminar todas las tareas
    html += `
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;">
            <button class="btn-danger" onclick="deleteAllTasks()" style="background: #f44336; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.3rem; cursor: pointer; font-size: 0.85rem;">
                🗑️ Eliminar todas las tareas
            </button>
        </div>
    `;
    
    for (const [child, childTasks] of Object.entries(tasksByChild)) {
        html += `
            <div class="child-tasks">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                    <h3 style="margin: 0;">${child}</h3>
                    <button class="btn-danger-small" onclick="deleteAllTasksForChild('${child}')" style="background: #ff6b6b; color: white; border: none; padding: 0.3rem 0.8rem; border-radius: 0.3rem; cursor: pointer; font-size: 0.75rem;">
                        🗑️ Eliminar todas de ${child}
                    </button>
                </div>
                <div class="tasks-grid">
        `;
        
        childTasks.forEach(task => {
            const priorityClass = `priority-${task.priority}`;
            
            const deadlineDate = new Date(task.deadline + 'T00:00:00');
            const formattedDate = deadlineDate.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            const priorityLabels = {
                'baja': '🟢 Baja',
                'media': '🟡 Media',
                'alta': '🔴 Alta'
            };
            
            html += `
                <div class="task-card ${priorityClass}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <h4>${task.name}</h4>
                            <div class="task-subject">📚 ${task.subject}</div>
                            <div class="task-priority">${priorityLabels[task.priority] || task.priority}</div>
                            <div class="task-deadline">${formattedDate}</div>
                            <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #999;">
                                Asignada: ${task.assignedDate}
                            </div>
                        </div>
                        <button class="delete-task-btn" onclick="deleteTask(${task.id})" title="Eliminar tarea">
                            ✕
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    tasksContainer.innerHTML = html;
}

renderTasks();

/*Eliminar tarea*/
function deleteTask(taskId) {
    // Mostrar confirmación antes de eliminar
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        // Filtrar la tarea a eliminar
        tasks = tasks.filter(task => task.id !== taskId);
        
        // Guardar en localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Actualizar la vista
        renderTasks();
        
        // Mostrar notificación
        showNotification('🗑️ Tarea eliminada correctamente');
    }
}

// ===== ELIMINAR TODAS LAS TAREAS DE UN HIJO =====
function deleteAllTasksForChild(childName) {
    if (confirm(`¿Estás seguro de que quieres eliminar TODAS las tareas de ${childName}?`)) {
        tasks = tasks.filter(task => task.child !== childName);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        showNotification(`🗑️ Todas las tareas de ${childName} han sido eliminadas`);
    }
}

// ===== ELIMINAR TODAS LAS TAREAS =====
function deleteAllTasks() {
    if (confirm('¿Estás seguro de que quieres eliminar TODAS las tareas?')) {
        tasks = [];
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        showNotification('🗑️ Todas las tareas han sido eliminadas');
    }
}

console.log('Dashboard cargado correctamente');
console.log('Tareas:', tasks);
