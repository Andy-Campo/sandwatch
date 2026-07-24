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
    let sessionData = JSON.parse(localStorage.getItem('userSession') || '{}');
    
    // Si no hay sesión en localStorage, buscar en sessionStorage
    if (!sessionData.email) {
        sessionData = JSON.parse(sessionStorage.getItem('userSession') || '{}');
    }
    
    if (isLoggedIn !== 'true' || userRole !== 'hijo') {
        alert('⚠️ Por favor, inicia sesión como hijo para acceder a tu calendario');
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

/* ===== CALENDARIO ===== */
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const calendarGrid = document.getElementById('calendarGrid');
const currentMonthYear = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

// Referencias al modal
const taskModal = document.getElementById('taskModal');
const modalDate = document.getElementById('modalDate');
const modalTasksContainer = document.getElementById('modalTasksContainer');
const closeModalBtn = document.getElementById('closeModal');

// Notificación
const notification = document.getElementById('notification');

/* ===== FUNCIÓN PARA OBTENER TAREAS COMPLETADAS ===== */
function getCompletedTasks() {
    const completed = localStorage.getItem('completedTasks');
    if (completed) {
        return JSON.parse(completed);
    }
    return [];
}

/* ===== FUNCIÓN PARA OBTENER TAREAS ===== */
function getTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        return JSON.parse(savedTasks);
    }
    return [];
}

/* ===== FUNCIÓN PARA OBTENER TAREAS DEL HIJO POR FECHA ===== */
function getChildTasksByDate(dateStr, childEmail) {
    const tasks = getTasks();
    // Filtrar tareas del hijo por email y por fecha
    return tasks.filter(task => task.childEmail === childEmail && task.deadline === dateStr);
}

/* ===== FUNCIÓN PARA MOSTRAR NOTIFICACIÓN ===== */
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/* ===== FUNCIÓN PARA GENERAR EL CALENDARIO ===== */
function generateCalendar(month, year) {
    const session = checkSession();
    if (!session) return;
    
    const childEmail = session.email;
    const childName = session.name;
    const tasks = getTasks();
    const completedTasks = getCompletedTasks();
    
    // Filtrar solo tareas del hijo por email
    const childTasks = tasks.filter(task => task.childEmail === childEmail);
    
    // Crear un objeto para agrupar tareas por fecha
    const tasksByDate = {};
    childTasks.forEach(task => {
        if (!tasksByDate[task.deadline]) {
            tasksByDate[task.deadline] = [];
        }
        tasksByDate[task.deadline].push(task);
    });

    // Actualizar el título del mes
    currentMonthYear.textContent = `${monthNames[month]} ${year}`;

    // Obtener el primer día del mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
    let startDay = firstDay.getDay();
    // Ajustar para que la semana empiece en Lunes (0 = Lunes, 6 = Domingo)
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    const totalDays = lastDay.getDate();

    // Limpiar el grid
    calendarGrid.innerHTML = '';

    // Agregar los encabezados de los días
    const dayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    dayHeaders.forEach(day => {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'calendar-day-header';
        headerDiv.textContent = day;
        calendarGrid.appendChild(headerDiv);
    });

    // Agregar días vacíos al inicio
    for (let i = 0; i < startDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDiv);
    }

    // Obtener la fecha de hoy sin problemas de zona horaria
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    // Generar los días del mes
    for (let day = 1; day <= totalDays; day++) {
        const dateObj = new Date(year, month, day);
        const dateStr = dateObj.toISOString().split('T')[0];
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        // Verificar si es hoy
        if (dateStr === todayStr) {
            dayDiv.classList.add('today');
        }
        
        // Verificar si tiene tareas
        if (tasksByDate[dateStr] && tasksByDate[dateStr].length > 0) {
            dayDiv.classList.add('has-tasks');
        }
        
        // Número del día
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayDiv.appendChild(dayNumber);
        
        // Indicador de tareas
        if (tasksByDate[dateStr] && tasksByDate[dateStr].length > 0) {
            const count = tasksByDate[dateStr].length;
            const indicator = document.createElement('div');
            indicator.className = 'task-indicator';
            indicator.textContent = `📝 ${count}`;
            dayDiv.appendChild(indicator);
        }
        
        // Evento click para mostrar tareas del día
        dayDiv.addEventListener('click', function() {
            if (tasksByDate[dateStr] && tasksByDate[dateStr].length > 0) {
                showTasksForDate(dateStr, tasksByDate[dateStr], completedTasks);
            }
        });
        
        calendarGrid.appendChild(dayDiv);
    }

    // Agregar días vacíos al final para completar la última semana
    const totalCells = startDay + totalDays;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remainingCells; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDiv);
    }
}

/* ===== FUNCIÓN PARA MOSTRAR TAREAS DE UNA FECHA EN EL MODAL ===== */
function showTasksForDate(dateStr, tasks, completedTasks) {
    // Formatear la fecha para mostrarla bonito
    const dateObj = new Date(dateStr + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    
    // Capitalizar el día de la semana
    const formattedDateCapitalized = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    modalDate.textContent = `📋 Mis tareas del ${formattedDateCapitalized}`;
    
    // Limpiar el contenedor
    modalTasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        modalTasksContainer.innerHTML = `
            <div class="no-tasks">
                <div class="empty-icon">📅</div>
                <p>No tienes tareas para esta fecha</p>
            </div>
        `;
    } else {
        // Ordenar tareas por prioridad (alta, media, baja)
        const priorityOrder = { 'alta': 0, 'media': 1, 'baja': 2 };
        tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        
        tasks.forEach(task => {
            const isCompleted = completedTasks.includes(task.id);
            const taskDiv = document.createElement('div');
            taskDiv.className = `modal-task priority-${task.priority}`;
            
            const priorityLabels = {
                'baja': '🟢 Baja',
                'media': '🟡 Media',
                'alta': '🔴 Alta'
            };
            
            const statusText = isCompleted ? '✅ Completada' : '⏳ Pendiente';
            const statusClass = isCompleted ? 'completed' : 'pending';
            
            taskDiv.innerHTML = `
                <div class="task-info">
                    <h4>${task.name}</h4>
                    <div class="task-details">
                        <span>📚 ${task.subject}</span>
                        <span>${priorityLabels[task.priority] || task.priority}</span>
                        <span>📅 ${task.assignedDate}</span>
                    </div>
                </div>
                <div>
                    <span class="task-status-badge ${statusClass}">${statusText}</span>
                </div>
            `;
            
            modalTasksContainer.appendChild(taskDiv);
        });
    }
    
    // Mostrar el modal
    taskModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/* ===== CERRAR MODAL ===== */
function closeModal() {
    taskModal.classList.remove('active');
    document.body.style.overflow = '';
}

closeModalBtn.addEventListener('click', closeModal);

// Cerrar modal al hacer clic fuera del contenido
taskModal.addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Cerrar modal con la tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && taskModal.classList.contains('active')) {
        closeModal();
    }
});

/* ===== NAVEGACIÓN DEL CALENDARIO ===== */
prevMonthBtn.addEventListener('click', function() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener('click', function() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
});

/* ===== INICIALIZAR CALENDARIO ===== */
// Verificar sesión antes de inicializar
const session = checkSession();
if (session) {
    // Mostrar nombre del hijo
    document.getElementById('childName').textContent = `👋 ¡Hola, ${session.name}!`;
    generateCalendar(currentMonth, currentYear);
    console.log('Calendario del hijo cargado correctamente');
    console.log('Email del hijo:', session.email);
} else {
    window.location.href = 'index.html';
}

// Escuchar cambios en las tareas (cuando se agregan o eliminan desde otra pestaña)
window.addEventListener('storage', function(e) {
    if (e.key === 'tasks' || e.key === 'completedTasks') {
        generateCalendar(currentMonth, currentYear);
    }
});