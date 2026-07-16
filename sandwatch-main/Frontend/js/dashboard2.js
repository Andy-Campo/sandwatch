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

/* ===== VERIFICAR SESIÓN ===== */
function checkSession() {
    // Verificar en localStorage y sessionStorage
    let isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    let userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    let sessionData = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    // Si no hay sesión en localStorage, buscar en sessionStorage
    if (!sessionData.email) {
        sessionData = JSON.parse(sessionStorage.getItem('userSession') || '{}');
    }
    
    if (isLoggedIn !== 'true' || userRole !== 'hijo') {
        alert('❌ Acceso no autorizado. Por favor, inicia sesión como hijo.');
        window.location.href = 'index.html';
        return null;
    }
    
    // Verificar que el email esté en la sesión
    if (!sessionData.email) {
        alert('❌ Error: No se encontró el email del usuario.');
        window.location.href = 'index.html';
        return null;
    }
    
    // Verificar que el usuario exista en la base de datos de usuarios registrados
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = users.some(u => u.email === sessionData.email && u.role === 'hijo');
    
    if (!userExists) {
        alert('❌ Error: Usuario no encontrado en el sistema.');
        window.location.href = 'index.html';
        return null;
    }
    
    return sessionData;
}

/* ===== EVENT LISTENER PARA CERRAR SESIÓN ===== */
document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

/* ===== OBTENER TAREAS ===== */
function getTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        return JSON.parse(savedTasks);
    }
    return [];
}

/* ===== OBTENER TAREAS DEL HIJO (POR EMAIL) ===== */
function getChildTasks(childEmail) {
    const allTasks = getTasks();
    // Filtrar por childEmail (el identificador único)
    return allTasks.filter(task => task.childEmail === childEmail);
}

/* ===== OBTENER ESTADO DE COMPLETADO ===== */
function getCompletedTasks() {
    const completed = localStorage.getItem('completedTasks');
    if (completed) {
        return JSON.parse(completed);
    }
    return [];
}

/* ===== GUARDAR ESTADO DE COMPLETADO ===== */
function saveCompletedTasks(completedTasks) {
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
}

/* ===== MARCAR TAREA COMO COMPLETADA ===== */
function completeTask(taskId) {
    const completedTasks = getCompletedTasks();
    
    if (completedTasks.includes(taskId)) {
        showNotification('⚠️ Esta tarea ya está completada');
        return;
    }
    
    // Verificar que la tarea pertenezca al hijo logueado
    const session = checkSession();
    if (!session) return;
    
    const allTasks = getTasks();
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task) {
        showNotification('❌ Error: Tarea no encontrada');
        return;
    }
    
    if (task.childEmail !== session.email) {
        showNotification('❌ No tienes permiso para completar esta tarea');
        return;
    }
    
    // Confirmar
    if (!confirm('¿Completaste esta tarea? ¡Buen trabajo! 🎉')) {
        return;
    }
    
    // Agregar a completadas
    completedTasks.push(taskId);
    saveCompletedTasks(completedTasks);
    
    showNotification('✅ ¡Tarea completada! Excelente trabajo');
    
    // Actualizar vista
    renderTasks();
}

/* ===== MOSTRAR NOTIFICACIÓN ===== */
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/* ===== RENDERIZAR TAREAS ===== */
function renderTasks() {
    const session = checkSession();
    if (!session) return;
    
    // Obtener email del hijo desde la sesión
    const childEmail = session.email;
    
    // Mostrar nombre del hijo
    document.getElementById('childName').textContent = `👋 ¡Hola, ${session.name}!`;
    
    // Obtener tareas del hijo por email
    const childTasks = getChildTasks(childEmail);
    const completedTasks = getCompletedTasks();
    const filterStatus = document.getElementById('filterStatus').value;
    
    // Filtrar por estado
    let filteredTasks = childTasks;
    if (filterStatus === 'pendiente') {
        filteredTasks = childTasks.filter(task => !completedTasks.includes(task.id));
    } else if (filterStatus === 'completada') {
        filteredTasks = childTasks.filter(task => completedTasks.includes(task.id));
    }
    
    // Actualizar contador
    document.getElementById('taskCount').textContent = 
        `Total: ${filteredTasks.length} tareas ${filterStatus !== 'todas' ? 'filtradas' : ''}`;
    
    // Contenedor
    const container = document.getElementById('tasksContainer');
    
    if (filteredTasks.length === 0) {
        let message = '';
        if (filterStatus === 'pendiente') {
            message = '🎉 ¡No tienes tareas pendientes! Todas están completadas.';
        } else if (filterStatus === 'completada') {
            message = '📝 Aún no has completado ninguna tarea. ¡Ánimo!';
        } else {
            message = '📋 No tienes tareas asignadas todavía.';
        }
        
        container.innerHTML = `
            <div class="no-tasks-message">
                <div class="empty-icon">${filterStatus === 'pendiente' ? '🎉' : filterStatus === 'completada' ? '📝' : '📋'}</div>
                <p>${message}</p>
                ${filterStatus === 'todas' ? '<p style="font-size: 0.9rem; color: #999;">Tus padres te asignarán tareas pronto</p>' : ''}
            </div>
        `;
        return;
    }
    
    // Ordenar tareas: pendientes primero, luego por prioridad y fecha
    filteredTasks.sort((a, b) => {
        const aCompleted = completedTasks.includes(a.id);
        const bCompleted = completedTasks.includes(b.id);
        
        // Pendientes primero
        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;
        
        // Por prioridad (alta > media > baja)
        const priorityOrder = { 'alta': 0, 'media': 1, 'baja': 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        
        // Por fecha límite
        return new Date(a.deadline) - new Date(b.deadline);
    });
    
    // Generar HTML
    let html = '';
    
    filteredTasks.forEach(task => {
        const isCompleted = completedTasks.includes(task.id);
        const priorityClass = `priority-${task.priority}`;
        const statusClass = isCompleted ? 'completed' : 'pending';
        const statusText = isCompleted ? '✅ Completada' : '⏳ Pendiente';
        
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
            <div class="task-card ${priorityClass} task-card-child">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                    <div style="flex: 1;">
                        <h4>${task.name}</h4>
                        <div class="task-subject">📚 ${task.subject}</div>
                        <div class="task-priority">${priorityLabels[task.priority] || task.priority}</div>
                        <div class="task-deadline">📅 ${formattedDate}</div>
                        <div style="margin-top: 0.5rem;">
                            <span class="task-status ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end; min-width: 100px;">
                        ${!isCompleted ? `
                            <button class="complete-btn" onclick="completeTask(${task.id})">
                                ✅ Marcar como completada
                            </button>
                        ` : `
                            <button class="complete-btn completed" disabled>
                                ✅ Tarea completada
                            </button>
                        `}
                        <div style="font-size: 0.7rem; color: #999;">
                            Asignada: ${task.assignedDate}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/* ===== EVENTO DE FILTRO ===== */
document.getElementById('filterStatus').addEventListener('change', renderTasks);

/* ===== ESCUCHAR CAMBIOS EN LAS TAREAS ===== */
window.addEventListener('storage', function(e) {
    if (e.key === 'tasks' || e.key === 'completedTasks') {
        renderTasks();
    }
});

/* ===== INICIALIZAR ===== */
// Verificar sesión antes de renderizar
const session = checkSession();
if (session) {
    renderTasks();
    console.log('Dashboard hijo cargado correctamente');
    console.log('Sesión:', session);
    console.log('Email del hijo:', session.email);
} else {
    window.location.href = 'index.html';
}