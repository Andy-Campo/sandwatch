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

// ===== VERIFICAR SESIÓN AL CARGAR =====
function checkSession() {
    // Verificar en localStorage y sessionStorage
    let isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    let userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    
    if (isLoggedIn !== 'true' || !userRole) {
        alert('⚠️ Por favor, inicia sesión para acceder al dashboard');
        window.location.href = 'index.html';
        return false;
    }
    
    // Verificar si es un padre (solo padres pueden acceder a dashboard.html)
    if (userRole !== 'padre') {
        alert('⛔ Acceso denegado. Esta página es solo para padres.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// ===== FUNCIÓN PARA OBTENER EL EMAIL DEL PADRE LOGUEADO =====
function getParentEmail() {
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    return session.email || null;
}

// ===== FUNCIÓN PARA OBTENER HIJOS DEL PADRE LOGUEADO =====
function getMyChildren() {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const parentEmail = getParentEmail();
    
    if (!parentEmail) {
        return [];
    }
    
    // Filtrar solo hijos que pertenecen a este padre
    return users.filter(user => user.role === 'hijo' && user.parentEmail === parentEmail);
}

// ===== FUNCIÓN PARA CARGAR HIJOS EN EL SELECT =====
function loadChildrenSelect() {
    const children = getMyChildren();
    const taskChildSelect = document.getElementById('taskChild');
    const editTaskChildSelect = document.getElementById('editTaskChild');
    
    // Limpiar selects (manteniendo la primera opción)
    taskChildSelect.innerHTML = '<option value="">Selecciona un hijo</option>';
    editTaskChildSelect.innerHTML = '<option value="">Selecciona un hijo</option>';
    
    if (children.length === 0) {
        taskChildSelect.innerHTML = '<option value="">No hay hijos registrados</option>';
        editTaskChildSelect.innerHTML = '<option value="">No hay hijos registrados</option>';
        return;
    }
    
    // Agregar hijos a los selects
    children.forEach(child => {
        const option1 = document.createElement('option');
        option1.value = child.email; // Usamos el email como identificador único
        option1.textContent = `${child.avatar || '👦'} ${child.name}`;
        taskChildSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = child.email;
        option2.textContent = `${child.avatar || '👦'} ${child.name}`;
        editTaskChildSelect.appendChild(option2);
    });
}

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

console.log('Dashboard cargado correctamente');

const openTaskFormBtn = document.getElementById('openTaskForm');
const taskFormContainer = document.getElementById('taskFormContainer');
const cancelTaskBtn = document.getElementById('cancelTask');
const taskForm = document.getElementById('taskForm');
const tasksContainer = document.getElementById('tasksContainer');
const notification = document.getElementById('notification');

// Referencias al formulario de edición
const editTaskFormContainer = document.getElementById('editTaskFormContainer');
const editTaskForm = document.getElementById('editTaskForm');
const cancelEditBtn = document.getElementById('cancelEditTask');

// Variables para el formulario de edición
const editTaskId = document.getElementById('editTaskId');
const editTaskName = document.getElementById('editTaskName');
const editTaskSubject = document.getElementById('editTaskSubject');
const editTaskPriority = document.getElementById('editTaskPriority');
const editTaskDeadline = document.getElementById('editTaskDeadline');
const editTaskChild = document.getElementById('editTaskChild');

/*Almacenar las tareas*/
let tasks = [];

/*Mostrar u ocultar formulario*/
openTaskFormBtn.addEventListener('click', function() {
    taskFormContainer.classList.toggle('active');
    if (taskFormContainer.classList.contains('active')) {
        this.textContent = '✕ Cerrar formulario';
        // Ocultar formulario de edición si está abierto
        if (editTaskFormContainer.classList.contains('active')) {
            editTaskFormContainer.classList.remove('active');
            editTaskForm.reset();
        }
        // Cargar hijos en el select cuando se abre el formulario
        loadChildrenSelect();
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
    const childEmail = document.getElementById('taskChild').value;
    
    // Validar que se haya seleccionado un hijo
    if (!childEmail) {
        showNotification('⚠️ Por favor, selecciona un hijo');
        return;
    }
    
    // Obtener el nombre del hijo desde el select
    const childSelect = document.getElementById('taskChild');
    const childName = childSelect.options[childSelect.selectedIndex].text;
    
    // Verificar que el hijo pertenezca al padre logueado
    const myChildren = getMyChildren();
    const childExists = myChildren.some(child => child.email === childEmail);
    
    if (!childExists) {
        showNotification('❌ No tienes permiso para asignar tareas a este hijo');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        name: taskName,
        subject: taskSubject,
        priority: taskPriority,
        deadline: taskDeadline,
        childName: childName, // Para mostrar en la interfaz
        childEmail: childEmail, // Para filtrar y autenticar
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

// ===== FUNCIÓN PARA EDITAR TAREA =====
function editTask(taskId) {
    // Buscar la tarea por ID
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        showNotification('❌ Error: Tarea no encontrada');
        return;
    }
    
    // Verificar que el hijo de la tarea pertenezca al padre logueado
    const myChildren = getMyChildren();
    const childExists = myChildren.some(child => child.email === task.childEmail);
    
    if (!childExists) {
        showNotification('❌ No tienes permiso para editar esta tarea');
        return;
    }
    
    // Rellenar el formulario de edición con los datos de la tarea
    editTaskId.value = task.id;
    editTaskName.value = task.name;
    editTaskSubject.value = task.subject;
    editTaskPriority.value = task.priority;
    editTaskDeadline.value = task.deadline;
    editTaskChild.value = task.childEmail; // Usamos el email
    
    // Cargar hijos en el select de edición
    loadChildrenSelect();
    
    // Mostrar el formulario de edición
    editTaskFormContainer.classList.add('active');
    
    // Ocultar el formulario de creación si está abierto
    if (taskFormContainer.classList.contains('active')) {
        taskFormContainer.classList.remove('active');
        openTaskFormBtn.textContent = '+ Asignar nueva tarea';
    }
    
    // Scroll al formulario de edición
    editTaskFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ===== MANEJAR ENVÍO DEL FORMULARIO DE EDICIÓN =====
editTaskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtener los datos del formulario
    const taskId = parseInt(editTaskId.value);
    const taskName = editTaskName.value;
    const taskSubject = editTaskSubject.value;
    const taskPriority = editTaskPriority.value;
    const taskDeadline = editTaskDeadline.value;
    const childEmail = editTaskChild.value;
    
    // Validar que se haya seleccionado un hijo
    if (!childEmail) {
        showNotification('⚠️ Por favor, selecciona un hijo');
        return;
    }
    
    // Verificar que el hijo pertenezca al padre logueado
    const myChildren = getMyChildren();
    const childExists = myChildren.some(child => child.email === childEmail);
    
    if (!childExists) {
        showNotification('❌ No tienes permiso para asignar tareas a este hijo');
        return;
    }
    
    // Obtener el nombre del hijo desde el select
    const childSelect = document.getElementById('editTaskChild');
    const childName = childSelect.options[childSelect.selectedIndex].text;
    
    // Buscar y actualizar la tarea
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        showNotification('❌ Error: Tarea no encontrada');
        return;
    }
    
    // Actualizar la tarea (manteniendo la fecha de asignación original)
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        name: taskName,
        subject: taskSubject,
        priority: taskPriority,
        deadline: taskDeadline,
        childName: childName,
        childEmail: childEmail
    };
    
    // Guardar en localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Mostrar notificación
    showNotification('✏️ Tarea actualizada correctamente');
    
    // Cerrar el formulario de edición
    editTaskFormContainer.classList.remove('active');
    editTaskForm.reset();
    
    // Actualizar la vista
    renderTasks();
});

// ===== CANCELAR EDICIÓN =====
cancelEditBtn.addEventListener('click', function() {
    editTaskFormContainer.classList.remove('active');
    editTaskForm.reset();
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

    // Obtener hijos del padre logueado para filtrar
    const myChildren = getMyChildren();
    const myChildrenEmails = myChildren.map(child => child.email);
    
    // Filtrar tareas: solo las que pertenecen a los hijos del padre logueado
    let filteredTasks = tasks.filter(task => myChildrenEmails.includes(task.childEmail));

    // Verificar si hay un filtro de hijo (por email) desde la página de hijos
    const filterChildEmail = localStorage.getItem('filterChildEmail');
    let filterMessage = '';
    
    if (filterChildEmail) {
        // Verificar que el hijo filtrado pertenezca al padre
        if (myChildrenEmails.includes(filterChildEmail)) {
            filteredTasks = filteredTasks.filter(task => task.childEmail === filterChildEmail);
            // Obtener el nombre del hijo para mostrar
            const child = myChildren.find(c => c.email === filterChildEmail);
            filterMessage = `Mostrando tareas de ${child ? child.name : 'hijo'}`;
        } else {
            showNotification('⚠️ No tienes permiso para ver las tareas de este hijo');
        }
        // Limpiar el filtro después de usarlo
        localStorage.removeItem('filterChildEmail');
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
                <p>${filterMessage ? `No hay tareas asignadas a este hijo` : 'No hay tareas asignadas aún'}</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Haz clic en "Asignar nueva tarea" para comenzar</p>
            </div>
        `;
        return;
    }
    
    // Agrupar tareas por hijo (usando childName para mostrar)
    const tasksByChild = {};
    filteredTasks.forEach(task => {
        const childKey = task.childEmail;
        if (!tasksByChild[childKey]) {
            // Buscar el nombre del hijo en la lista de hijos del padre
            const child = myChildren.find(c => c.email === childKey);
            tasksByChild[childKey] = {
                name: child ? child.name : task.childName || 'Sin nombre',
                email: childKey,
                tasks: []
            };
        }
        tasksByChild[childKey].tasks.push(task);
    });
    
    // Generar HTML
    let html = '';
    
    // Botón para eliminar todas las tareas (solo si hay tareas)
    if (filteredTasks.length > 0) {
        html += `
            <div style="display: flex; justify-content: flex-end; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;">
                <button class="btn-danger" onclick="deleteAllTasks()" style="background: #f44336; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.3rem; cursor: pointer; font-size: 0.85rem;">
                    🗑️ Eliminar todas las tareas
                </button>
            </div>
        `;
    }
    
    for (const [childKey, childData] of Object.entries(tasksByChild)) {
        const childName = childData.name;
        const childEmail = childData.email;
        
        html += `
            <div class="child-tasks">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                    <h3 style="margin: 0;">${childName}</h3>
                    ${childEmail ? `<span style="font-size: 0.8rem; color: #999;">${childEmail}</span>` : ''}
                    <button class="btn-danger-small" onclick="deleteAllTasksForChild('${childEmail}')" style="background: #ff6b6b; color: white; border: none; padding: 0.3rem 0.8rem; border-radius: 0.3rem; cursor: pointer; font-size: 0.75rem;">
                        🗑️ Eliminar todas de ${childName}
                    </button>
                </div>
                <div class="tasks-grid">
        `;
        
        childData.tasks.forEach(task => {
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
                        <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                            <button class="edit-task-btn" onclick="editTask(${task.id})" title="Editar tarea" style="background: #4CAF50; color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">
                                ✏️
                            </button>
                            <button class="delete-task-btn" onclick="deleteTask(${task.id})" title="Eliminar tarea">
                                ✕
                            </button>
                        </div>
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
function deleteAllTasksForChild(childEmail) {
    // Verificar que el hijo pertenezca al padre logueado
    const myChildren = getMyChildren();
    const childExists = myChildren.some(child => child.email === childEmail);
    
    if (!childExists) {
        showNotification('❌ No tienes permiso para eliminar tareas de este hijo');
        return;
    }
    
    const child = myChildren.find(c => c.email === childEmail);
    const childName = child ? child.name : 'este hijo';
    
    if (confirm(`¿Estás seguro de que quieres eliminar TODAS las tareas de ${childName}?`)) {
        // Filtrar tareas eliminando las del hijo
        tasks = tasks.filter(task => task.childEmail !== childEmail);
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

// ===== EVENT LISTENER PARA CERRAR SESIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Cargar hijos en los selects al cargar la página
    loadChildrenSelect();
});

// ===== VERIFICAR SESIÓN AL INICIAR =====
if (!checkSession()) {
    // Si la verificación falla, redirige al login
    window.location.href = 'index.html';
}