// ===== FUNCIÓN PARA CERRAR SESIÓN =====
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Eliminar datos de sesión
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userSession');
        
        // También limpiar sessionStorage por si acaso
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userSession');
        
        // Mostrar mensaje de cierre de sesión
        alert('🔒 Sesión cerrada correctamente');
        
        // Redirigir al login
        window.location.href = 'index.html';
    }
}

// ===== VERIFICAR SESIÓN =====
function checkSession() {
    // Verificar en localStorage y sessionStorage
    let isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    let userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    
    if (isLoggedIn !== 'true' || !userRole) {
        alert('⚠️ Por favor, inicia sesión para acceder al reporte');
        window.location.href = 'index.html';
        return false;
    }
    
    // Verificar que sea un padre
    if (userRole !== 'padre') {
        alert('⛔ Acceso denegado. Esta página es solo para padres.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

/* Menú Hamburguesa */
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

/* Cerrar Menú - Enlace */
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

/* Cerrar Menú - Espacio en blanco */
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

// ===== EVENT LISTENER PARA CERRAR SESIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// ============================================
// ===== FUNCIONALIDAD DE REPORTE =====
// ============================================

/* ===== REFERENCIAS DEL DOM ===== */
const filterChild = document.getElementById('filterChild');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const tasksReportContainer = document.getElementById('tasksReportContainer');
const notification = document.getElementById('notification');

// Estadísticas
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const overdueTasksEl = document.getElementById('overdueTasks');
const taskCountEl = document.getElementById('taskCount');

/* ===== FUNCIÓN PARA OBTENER TAREAS ===== */
function getTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        return JSON.parse(savedTasks);
    }
    return [];
}

/* ===== FUNCIÓN PARA OBTENER TAREAS COMPLETADAS ===== */
function getCompletedTasks() {
    const completed = localStorage.getItem('completedTasks');
    if (completed) {
        return JSON.parse(completed);
    }
    return [];
}

/* ===== FUNCIÓN PARA OBTENER EL EMAIL DEL PADRE LOGUEADO ===== */
function getParentEmail() {
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    return session.email || null;
}

/* ===== FUNCIÓN PARA OBTENER HIJOS DEL PADRE LOGUEADO ===== */
function getMyChildren() {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const parentEmail = getParentEmail();
    
    if (!parentEmail) {
        return [];
    }
    
    // Filtrar solo hijos que pertenecen a este padre
    return users.filter(user => user.role === 'hijo' && user.parentEmail === parentEmail);
}

/* ===== FUNCIÓN PARA CARGAR HIJOS EN EL SELECT ===== */
function loadChildrenSelect() {
    const children = getMyChildren();
    
    // Limpiar select (manteniendo la primera opción)
    filterChild.innerHTML = '<option value="todos">Todos los hijos</option>';
    
    if (children.length === 0) {
        filterChild.innerHTML = '<option value="todos">No hay hijos registrados</option>';
        return;
    }
    
    // Agregar hijos al select
    children.forEach(child => {
        const option = document.createElement('option');
        option.value = child.email;
        option.textContent = `${child.avatar || '👦'} ${child.name}`;
        filterChild.appendChild(option);
    });
}

/* ===== FUNCIÓN PARA VERIFICAR SI UNA TAREA ESTÁ VENCIDA ===== */
function isTaskOverdue(task, completedTasks) {
    if (completedTasks.includes(task.id)) return false;
    
    const today = new Date();
    const deadline = new Date(task.deadline + 'T00:00:00');
    // Comparar solo fechas, sin tiempo
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    
    return deadline < today;
}

/* ===== FUNCIÓN PARA OBTENER EL ESTADO DE UNA TAREA ===== */
function getTaskStatus(task, completedTasks) {
    if (completedTasks.includes(task.id)) {
        return 'completada';
    }
    if (isTaskOverdue(task, completedTasks)) {
        return 'vencida';
    }
    return 'pendiente';
}

/* ===== FUNCIÓN PARA MOSTRAR NOTIFICACIÓN ===== */
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/* ===== FUNCIÓN PARA GENERAR EL REPORTE ===== */
function generateReport() {
    const tasks = getTasks();
    const completedTasks = getCompletedTasks();
    const selectedChild = filterChild.value;
    const selectedStatus = filterStatus.value;
    const selectedPriority = filterPriority.value;
    
    // Filtrar por hijo (solo los del padre logueado)
    let filteredTasks = tasks;
    
    // Si se selecciona un hijo específico, filtrar por su email
    if (selectedChild !== 'todos') {
        filteredTasks = filteredTasks.filter(task => task.childEmail === selectedChild);
    } else {
        // Si selecciona "Todos los hijos", filtrar solo los hijos del padre logueado
        const myChildren = getMyChildren();
        const myChildrenEmails = myChildren.map(child => child.email);
        filteredTasks = filteredTasks.filter(task => myChildrenEmails.includes(task.childEmail));
    }
    
    // Filtrar por prioridad
    if (selectedPriority !== 'todas') {
        filteredTasks = filteredTasks.filter(task => task.priority === selectedPriority);
    }
    
    // Filtrar por estado
    if (selectedStatus !== 'todas') {
        filteredTasks = filteredTasks.filter(task => {
            const status = getTaskStatus(task, completedTasks);
            return status === selectedStatus;
        });
    }
    
    // Actualizar estadísticas
    updateStats(filteredTasks, completedTasks);
    
    // Renderizar tareas
    renderTasksReport(filteredTasks, completedTasks);
}

/* ===== FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS ===== */
function updateStats(tasks, completedTasks) {
    const total = tasks.length;
    const completed = tasks.filter(task => completedTasks.includes(task.id)).length;
    const pending = tasks.filter(task => !completedTasks.includes(task.id) && !isTaskOverdue(task, completedTasks)).length;
    const overdue = tasks.filter(task => isTaskOverdue(task, completedTasks)).length;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
    overdueTasksEl.textContent = overdue;
    
    taskCountEl.textContent = `Mostrando ${total} tareas`;
}

/* ===== FUNCIÓN PARA RENDERIZAR LAS TAREAS ===== */
function renderTasksReport(tasks, completedTasks) {
    if (tasks.length === 0) {
        tasksReportContainer.innerHTML = `
            <div class="empty-report">
                <div class="empty-icon">📭</div>
                <p>No hay tareas que coincidan con los filtros seleccionados</p>
                <p style="font-size: 0.9rem; color: #999; margin-top: 0.5rem;">
                    Intenta cambiar los filtros para ver más tareas
                </p>
            </div>
        `;
        return;
    }
    
    // Ordenar tareas: vencidas primero, luego pendientes, luego completadas
    tasks.sort((a, b) => {
        const aCompleted = completedTasks.includes(a.id);
        const bCompleted = completedTasks.includes(b.id);
        const aOverdue = isTaskOverdue(a, completedTasks);
        const bOverdue = isTaskOverdue(b, completedTasks);
        
        // Vencidas primero
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        
        // Luego pendientes
        if (!aCompleted && bCompleted) return -1;
        if (aCompleted && !bCompleted) return 1;
        
        // Luego por fecha límite
        return new Date(a.deadline) - new Date(b.deadline);
    });
    
    let html = '';
    
    tasks.forEach(task => {
        const status = getTaskStatus(task, completedTasks);
        const priorityClass = `priority-${task.priority}`;
        const childName = task.childName || task.child || 'Sin asignar';
        
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
        
        const statusLabels = {
            'completada': '✅ Completada',
            'pendiente': '⏳ Pendiente',
            'vencida': '🔴 Vencida'
        };
        
        const statusClass = status === 'completada' ? 'completed' : status === 'vencida' ? 'overdue' : 'pending';
        
        html += `
            <div class="task-report-item ${priorityClass}">
                <div class="task-info">
                    <h4>${task.name}</h4>
                    <div class="task-meta">
                        <span>📚 ${task.subject}</span>
                        <span>${priorityLabels[task.priority] || task.priority}</span>
                        <span>📅 ${formattedDate}</span>
                        <span>📋 ${task.assignedDate}</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                    <span class="task-child">👤 ${childName}</span>
                    <span class="task-status ${statusClass}">${statusLabels[status]}</span>
                </div>
            </div>
        `;
    });
    
    tasksReportContainer.innerHTML = html;
}

/* ===== EVENT LISTENERS PARA FILTROS ===== */
filterChild.addEventListener('change', generateReport);
filterStatus.addEventListener('change', generateReport);
filterPriority.addEventListener('change', generateReport);

/* ===== ESCUCHAR CAMBIOS EN LAS TAREAS ===== */
window.addEventListener('storage', function(e) {
    if (e.key === 'tasks' || e.key === 'completedTasks') {
        generateReport();
        showNotification('📊 Reporte actualizado');
    }
});

/* ===== INICIALIZAR ===== */
// Verificar sesión
if (!checkSession()) {
    window.location.href = 'index.html';
}

// Cargar hijos en el select (solo los del padre logueado)
loadChildrenSelect();

// Generar reporte inicial
generateReport();

console.log('Reporte cargado correctamente');
console.log('Padre logueado:', getParentEmail());