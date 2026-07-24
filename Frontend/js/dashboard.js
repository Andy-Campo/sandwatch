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
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userSession');
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userSession');
        alert('🔒 Sesión cerrada correctamente');
        window.location.href = 'index.html';
    }
}

// ===== VERIFICAR SESIÓN AL CARGAR =====
function checkSession() {
    let isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    let userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    
    if (isLoggedIn !== 'true' || !userRole) {
        alert('⚠️ Por favor, inicia sesión para acceder al dashboard');
        window.location.href = 'index.html';
        return false;
    }
    
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
    
    return users.filter(user => user.role === 'hijo' && user.parentEmail === parentEmail);
}

// ===== FUNCIÓN PARA CARGAR HIJOS EN EL SELECT =====
function loadChildrenSelect() {
    const children = getMyChildren();
    const taskChildSelect = document.getElementById('taskChild');
    const editTaskChildSelect = document.getElementById('editTaskChild');
    
    taskChildSelect.innerHTML = '<option value="">Selecciona un hijo</option>';
    editTaskChildSelect.innerHTML = '<option value="">Selecciona un hijo</option>';
    
    if (children.length === 0) {
        taskChildSelect.innerHTML = '<option value="">No hay hijos registrados</option>';
        editTaskChildSelect.innerHTML = '<option value="">No hay hijos registrados</option>';
        return;
    }
    
    children.forEach(child => {
        const option1 = document.createElement('option');
        option1.value = child.email;
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

// ============================================
// ===== PATRONES DE VALIDACIÓN =====
// ============================================
const TASK_VALIDATION_PATTERNS = {
    text: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.']*$/,
};

// ============================================
// ===== FUNCIONES DE VALIDACIÓN =====
// ============================================

function showTaskValidationMessage(element, message, type = 'error') {
    if (!element) return;
    element.textContent = message;
    element.className = `validation-message show ${type}`;
}

function hideTaskValidationMessage(element) {
    if (!element) return;
    element.className = 'validation-message';
    element.textContent = '';
}

function setTaskInputStatus(input, isValid) {
    if (!input) return;
    input.classList.remove('valid', 'invalid');
    if (isValid && input.value.length > 0) {
        input.classList.add('valid');
    } else if (!isValid && input.value.length > 0) {
        input.classList.add('invalid');
    }
}

function validateTaskField(value, pattern, minLength = 0, maxLength = Infinity) {
    if (value.length < minLength) return { valid: false, message: `Mínimo ${minLength} caracteres` };
    if (value.length > maxLength) return { valid: false, message: `Máximo ${maxLength} caracteres` };
    if (!pattern.test(value) && value.length > 0) {
        return { valid: false, message: 'Caracteres no permitidos' };
    }
    return { valid: true, message: '' };
}

// ============================================
// ===== CONFIGURAR VALIDACIONES EN TIEMPO REAL =====
// ============================================

function setupTaskValidations() {
    // ===== VALIDACIÓN: NOMBRE DE TAREA =====
    const taskName = document.getElementById('taskName');
    const taskNameValidation = document.getElementById('taskNameValidation');
    const taskNameCounter = document.querySelector('#taskName + .char-counter .current');

    if (taskName) {
        taskName.addEventListener('input', function() {
            const value = this.value;
            const maxLength = 100;
            
            if (taskNameCounter) taskNameCounter.textContent = value.length;
            
            const counter = this.parentElement.querySelector('.char-counter');
            if (counter) {
                counter.classList.remove('warning', 'danger');
                if (value.length > maxLength * 0.8) counter.classList.add('warning');
                if (value.length >= maxLength) counter.classList.add('danger');
            }
            
            if (value.length === 0) {
                hideTaskValidationMessage(taskNameValidation);
                setTaskInputStatus(this, false);
                return;
            }
            
            const result = validateTaskField(value, TASK_VALIDATION_PATTERNS.text, 0, maxLength);
            
            if (!result.valid) {
                showTaskValidationMessage(taskNameValidation, `⚠️ ${result.message}`, 'error');
                setTaskInputStatus(this, false);
            } else {
                hideTaskValidationMessage(taskNameValidation);
                setTaskInputStatus(this, true);
            }
        });
    }

    // ===== VALIDACIÓN: ASIGNATURA =====
    const taskSubject = document.getElementById('taskSubject');
    const taskSubjectValidation = document.getElementById('taskSubjectValidation');
    const taskSubjectCounter = document.querySelector('#taskSubject + .char-counter .current');

    if (taskSubject) {
        taskSubject.addEventListener('input', function() {
            const value = this.value;
            const maxLength = 50;
            
            if (taskSubjectCounter) taskSubjectCounter.textContent = value.length;
            
            const counter = this.parentElement.querySelector('.char-counter');
            if (counter) {
                counter.classList.remove('warning', 'danger');
                if (value.length > maxLength * 0.8) counter.classList.add('warning');
                if (value.length >= maxLength) counter.classList.add('danger');
            }
            
            if (value.length === 0) {
                hideTaskValidationMessage(taskSubjectValidation);
                setTaskInputStatus(this, false);
                return;
            }
            
            const result = validateTaskField(value, TASK_VALIDATION_PATTERNS.text, 0, maxLength);
            
            if (!result.valid) {
                showTaskValidationMessage(taskSubjectValidation, `⚠️ ${result.message}`, 'error');
                setTaskInputStatus(this, false);
            } else {
                hideTaskValidationMessage(taskSubjectValidation);
                setTaskInputStatus(this, true);
            }
        });
    }

    // ===== VALIDACIÓN: PRIORIDAD =====
    const taskPriority = document.getElementById('taskPriority');
    const taskPriorityValidation = document.getElementById('taskPriorityValidation');

    if (taskPriority) {
        taskPriority.addEventListener('change', function() {
            if (this.value) {
                hideTaskValidationMessage(taskPriorityValidation);
                setTaskInputStatus(this, true);
            } else {
                showTaskValidationMessage(taskPriorityValidation, '⚠️ Por favor, selecciona una prioridad', 'error');
                setTaskInputStatus(this, false);
            }
        });
    }

    // ===== VALIDACIÓN: FECHA LÍMITE =====
    const taskDeadline = document.getElementById('taskDeadline');
    const taskDeadlineValidation = document.getElementById('taskDeadlineValidation');

    if (taskDeadline) {
        taskDeadline.addEventListener('change', function() {
            if (this.value) {
                hideTaskValidationMessage(taskDeadlineValidation);
                setTaskInputStatus(this, true);
            } else {
                showTaskValidationMessage(taskDeadlineValidation, '⚠️ Por favor, selecciona una fecha límite válida', 'error');
                setTaskInputStatus(this, false);
            }
        });
    }

    // ===== VALIDACIÓN: ASIGNAR A =====
    const taskChild = document.getElementById('taskChild');
    const taskChildValidation = document.getElementById('taskChildValidation');

    if (taskChild) {
        taskChild.addEventListener('change', function() {
            if (this.value) {
                hideTaskValidationMessage(taskChildValidation);
                setTaskInputStatus(this, true);
            } else {
                showTaskValidationMessage(taskChildValidation, '⚠️ Por favor, selecciona un hijo', 'error');
                setTaskInputStatus(this, false);
            }
        });
    }

    // ============================================
    // ===== VALIDACIONES PARA EDITAR =====
    // ============================================

    // Editar - Nombre
    const editTaskName = document.getElementById('editTaskName');
    const editTaskNameValidation = document.getElementById('editTaskNameValidation');
    const editTaskNameCounter = document.querySelector('#editTaskName + .char-counter .current');

    if (editTaskName) {
        editTaskName.addEventListener('input', function() {
            const value = this.value;
            const maxLength = 100;
            
            if (editTaskNameCounter) editTaskNameCounter.textContent = value.length;
            
            const counter = this.parentElement.querySelector('.char-counter');
            if (counter) {
                counter.classList.remove('warning', 'danger');
                if (value.length > maxLength * 0.8) counter.classList.add('warning');
                if (value.length >= maxLength) counter.classList.add('danger');
            }
            
            if (value.length === 0) {
                hideTaskValidationMessage(editTaskNameValidation);
                setTaskInputStatus(this, false);
                return;
            }
            
            const result = validateTaskField(value, TASK_VALIDATION_PATTERNS.text, 0, maxLength);
            
            if (!result.valid) {
                showTaskValidationMessage(editTaskNameValidation, `⚠️ ${result.message}`, 'error');
                setTaskInputStatus(this, false);
            } else {
                hideTaskValidationMessage(editTaskNameValidation);
                setTaskInputStatus(this, true);
            }
        });
    }

    // Editar - Asignatura
    const editTaskSubject = document.getElementById('editTaskSubject');
    const editTaskSubjectValidation = document.getElementById('editTaskSubjectValidation');
    const editTaskSubjectCounter = document.querySelector('#editTaskSubject + .char-counter .current');

    if (editTaskSubject) {
        editTaskSubject.addEventListener('input', function() {
            const value = this.value;
            const maxLength = 50;
            
            if (editTaskSubjectCounter) editTaskSubjectCounter.textContent = value.length;
            
            const counter = this.parentElement.querySelector('.char-counter');
            if (counter) {
                counter.classList.remove('warning', 'danger');
                if (value.length > maxLength * 0.8) counter.classList.add('warning');
                if (value.length >= maxLength) counter.classList.add('danger');
            }
            
            if (value.length === 0) {
                hideTaskValidationMessage(editTaskSubjectValidation);
                setTaskInputStatus(this, false);
                return;
            }
            
            const result = validateTaskField(value, TASK_VALIDATION_PATTERNS.text, 0, maxLength);
            
            if (!result.valid) {
                showTaskValidationMessage(editTaskSubjectValidation, `⚠️ ${result.message}`, 'error');
                setTaskInputStatus(this, false);
            } else {
                hideTaskValidationMessage(editTaskSubjectValidation);
                setTaskInputStatus(this, true);
            }
        });
    }

    // Editar - Prioridad
    const editTaskPriority = document.getElementById('editTaskPriority');
    const editTaskPriorityValidation = document.getElementById('editTaskPriorityValidation');

    if (editTaskPriority) {
        editTaskPriority.addEventListener('change', function() {
            if (this.value) {
                hideTaskValidationMessage(editTaskPriorityValidation);
                setTaskInputStatus(this, true);
            } else {
                showTaskValidationMessage(editTaskPriorityValidation, '⚠️ Por favor, selecciona una prioridad', 'error');
                setTaskInputStatus(this, false);
            }
        });
    }

    // Editar - Fecha límite
    const editTaskDeadline = document.getElementById('editTaskDeadline');
    const editTaskDeadlineValidation = document.getElementById('editTaskDeadlineValidation');

    if (editTaskDeadline) {
        editTaskDeadline.addEventListener('change', function() {
            if (this.value) {
                hideTaskValidationMessage(editTaskDeadlineValidation);
                setTaskInputStatus(this, true);
            } else {
                showTaskValidationMessage(editTaskDeadlineValidation, '⚠️ Por favor, selecciona una fecha límite válida', 'error');
                setTaskInputStatus(this, false);
            }
        });
    }

    // Editar - Asignar a
    const editTaskChild = document.getElementById('editTaskChild');
    const editTaskChildValidation = document.getElementById('editTaskChildValidation');

    if (editTaskChild) {
        editTaskChild.addEventListener('change', function() {
            if (this.value) {
                hideTaskValidationMessage(editTaskChildValidation);
                setTaskInputStatus(this, true);
            } else {
                showTaskValidationMessage(editTaskChildValidation, '⚠️ Por favor, selecciona un hijo', 'error');
                setTaskInputStatus(this, false);
            }
        });
    }
}

const openTaskFormBtn = document.getElementById('openTaskForm');
const taskFormContainer = document.getElementById('taskFormContainer');
const cancelTaskBtn = document.getElementById('cancelTask');
const taskForm = document.getElementById('taskForm');
const tasksContainer = document.getElementById('tasksContainer');
const notification = document.getElementById('notification');

const editTaskFormContainer = document.getElementById('editTaskFormContainer');
const editTaskForm = document.getElementById('editTaskForm');
const cancelEditBtn = document.getElementById('cancelEditTask');

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
        if (editTaskFormContainer.classList.contains('active')) {
            editTaskFormContainer.classList.remove('active');
            editTaskForm.reset();
        }
        loadChildrenSelect();
        // Resetear validaciones al abrir
        document.querySelectorAll('#taskForm .input-with-validation input').forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        document.querySelectorAll('#taskForm .validation-message').forEach(el => {
            el.className = 'validation-message';
            el.textContent = '';
        });
        document.querySelectorAll('#taskForm .char-counter .current').forEach(el => {
            el.textContent = '0';
        });
        document.querySelectorAll('#taskForm .char-counter').forEach(el => {
            el.classList.remove('warning', 'danger');
        });
    } else {
        this.textContent = '+ Asignar nueva tarea';
        taskForm.reset();
        // Resetear validaciones al cerrar
        document.querySelectorAll('#taskForm .input-with-validation input').forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        document.querySelectorAll('#taskForm .validation-message').forEach(el => {
            el.className = 'validation-message';
            el.textContent = '';
        });
        document.querySelectorAll('#taskForm .char-counter .current').forEach(el => {
            el.textContent = '0';
        });
        document.querySelectorAll('#taskForm .char-counter').forEach(el => {
            el.classList.remove('warning', 'danger');
        });
    }
});

cancelTaskBtn.addEventListener('click', function() {
    taskFormContainer.classList.remove('active');
    openTaskFormBtn.textContent = '+ Asignar nueva tarea';
    taskForm.reset();
    // Resetear validaciones
    document.querySelectorAll('#taskForm .input-with-validation input').forEach(input => {
        input.classList.remove('valid', 'invalid');
    });
    document.querySelectorAll('#taskForm .validation-message').forEach(el => {
        el.className = 'validation-message';
        el.textContent = '';
    });
    document.querySelectorAll('#taskForm .char-counter .current').forEach(el => {
        el.textContent = '0';
    });
    document.querySelectorAll('#taskForm .char-counter').forEach(el => {
        el.classList.remove('warning', 'danger');
    });
});

/*Guardar tarea*/
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Disparar validaciones
    document.getElementById('taskName').dispatchEvent(new Event('input'));
    document.getElementById('taskSubject').dispatchEvent(new Event('input'));
    document.getElementById('taskPriority').dispatchEvent(new Event('change'));
    document.getElementById('taskDeadline').dispatchEvent(new Event('change'));
    document.getElementById('taskChild').dispatchEvent(new Event('change'));

    // Verificar errores de validación
    const errorMessages = document.querySelectorAll('#taskForm .validation-message.show.error');
    
    if (errorMessages.length > 0) {
        errorMessages[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        showNotification('⚠️ Por favor, corrige los errores en el formulario');
        return;
    }

    // Verificar campos vacíos
    const requiredFields = ['taskName', 'taskSubject', 'taskPriority', 'taskDeadline', 'taskChild'];
    let hasError = false;

    requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (!field.value.trim()) {
            hasError = true;
            field.classList.add('invalid');
            const validationEl = document.getElementById(`${id}Validation`);
            if (validationEl) {
                showTaskValidationMessage(validationEl, `⚠️ Este campo es obligatorio`, 'error');
            }
        }
    });

    if (hasError) {
        showNotification('⚠️ Por favor, completa todos los campos obligatorios');
        return;
    }
    
    // Obtener datos
    const taskName = document.getElementById('taskName').value.trim();
    const taskSubject = document.getElementById('taskSubject').value.trim();
    const taskPriority = document.getElementById('taskPriority').value;
    const taskDeadline = document.getElementById('taskDeadline').value;
    const childEmail = document.getElementById('taskChild').value;
    
    // Validaciones adicionales
    if (!childEmail) {
        showNotification('⚠️ Por favor, selecciona un hijo');
        return;
    }
    
    // Validar caracteres en nombre y asignatura
    if (!TASK_VALIDATION_PATTERNS.text.test(taskName)) {
        showNotification('❌ El nombre contiene caracteres no permitidos');
        return;
    }
    
    if (!TASK_VALIDATION_PATTERNS.text.test(taskSubject)) {
        showNotification('❌ La asignatura contiene caracteres no permitidos');
        return;
    }
    
    const childSelect = document.getElementById('taskChild');
    const childName = childSelect.options[childSelect.selectedIndex].text;
    
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
        childName: childName,
        childEmail: childEmail,
        assignedDate: new Date().toLocaleDateString('es-ES')
    };
    
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    showNotification('✅ Tarea asignada correctamente');
    
    taskForm.reset();
    taskFormContainer.classList.remove('active');
    openTaskFormBtn.textContent = '+ Asignar nueva tarea';
    
    // Resetear validaciones
    document.querySelectorAll('#taskForm .input-with-validation input').forEach(input => {
        input.classList.remove('valid', 'invalid');
    });
    document.querySelectorAll('#taskForm .validation-message').forEach(el => {
        el.className = 'validation-message';
        el.textContent = '';
    });
    document.querySelectorAll('#taskForm .char-counter .current').forEach(el => {
        el.textContent = '0';
    });
    document.querySelectorAll('#taskForm .char-counter').forEach(el => {
        el.classList.remove('warning', 'danger');
    });
    
    renderTasks();
});

// ===== FUNCIÓN PARA EDITAR TAREA =====
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        showNotification('❌ Error: Tarea no encontrada');
        return;
    }
    
    const myChildren = getMyChildren();
    const childExists = myChildren.some(child => child.email === task.childEmail);
    
    if (!childExists) {
        showNotification('❌ No tienes permiso para editar esta tarea');
        return;
    }
    
    editTaskId.value = task.id;
    editTaskName.value = task.name;
    editTaskSubject.value = task.subject;
    editTaskPriority.value = task.priority;
    editTaskDeadline.value = task.deadline;
    editTaskChild.value = task.childEmail;
    
    // Actualizar contadores
    const editNameCounter = document.querySelector('#editTaskName + .char-counter .current');
    const editSubjectCounter = document.querySelector('#editTaskSubject + .char-counter .current');
    if (editNameCounter) editNameCounter.textContent = task.name.length;
    if (editSubjectCounter) editSubjectCounter.textContent = task.subject.length;
    
    loadChildrenSelect();
    
    editTaskFormContainer.classList.add('active');
    
    if (taskFormContainer.classList.contains('active')) {
        taskFormContainer.classList.remove('active');
        openTaskFormBtn.textContent = '+ Asignar nueva tarea';
    }
    
    // Resetear validaciones de edición
    document.querySelectorAll('#editTaskForm .input-with-validation input').forEach(input => {
        input.classList.remove('valid', 'invalid');
        // Si tiene valor, marcarlo como válido
        if (input.value) {
            input.classList.add('valid');
        }
    });
    document.querySelectorAll('#editTaskForm .validation-message').forEach(el => {
        el.className = 'validation-message';
        el.textContent = '';
    });
    document.querySelectorAll('#editTaskForm select').forEach(select => {
        select.classList.remove('valid', 'invalid');
        if (select.value) {
            select.classList.add('valid');
        }
    });
    
    editTaskFormContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ===== MANEJAR ENVÍO DEL FORMULARIO DE EDICIÓN =====
editTaskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Disparar validaciones
    document.getElementById('editTaskName').dispatchEvent(new Event('input'));
    document.getElementById('editTaskSubject').dispatchEvent(new Event('input'));
    document.getElementById('editTaskPriority').dispatchEvent(new Event('change'));
    document.getElementById('editTaskDeadline').dispatchEvent(new Event('change'));
    document.getElementById('editTaskChild').dispatchEvent(new Event('change'));

    // Verificar errores de validación
    const errorMessages = document.querySelectorAll('#editTaskForm .validation-message.show.error');
    
    if (errorMessages.length > 0) {
        errorMessages[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        showNotification('⚠️ Por favor, corrige los errores en el formulario');
        return;
    }

    // Verificar campos vacíos
    const requiredFields = ['editTaskName', 'editTaskSubject', 'editTaskPriority', 'editTaskDeadline', 'editTaskChild'];
    let hasError = false;

    requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (!field.value.trim()) {
            hasError = true;
            field.classList.add('invalid');
            const validationEl = document.getElementById(`${id}Validation`);
            if (validationEl) {
                showTaskValidationMessage(validationEl, `⚠️ Este campo es obligatorio`, 'error');
            }
        }
    });

    if (hasError) {
        showNotification('⚠️ Por favor, completa todos los campos obligatorios');
        return;
    }
    
    const taskId = parseInt(editTaskId.value);
    const taskName = editTaskName.value.trim();
    const taskSubject = editTaskSubject.value.trim();
    const taskPriority = editTaskPriority.value;
    const taskDeadline = editTaskDeadline.value;
    const childEmail = editTaskChild.value;
    
    // Validar caracteres en nombre y asignatura
    if (!TASK_VALIDATION_PATTERNS.text.test(taskName)) {
        showNotification('❌ El nombre contiene caracteres no permitidos');
        return;
    }
    
    if (!TASK_VALIDATION_PATTERNS.text.test(taskSubject)) {
        showNotification('❌ La asignatura contiene caracteres no permitidos');
        return;
    }
    
    if (!childEmail) {
        showNotification('⚠️ Por favor, selecciona un hijo');
        return;
    }
    
    const myChildren = getMyChildren();
    const childExists = myChildren.some(child => child.email === childEmail);
    
    if (!childExists) {
        showNotification('❌ No tienes permiso para asignar tareas a este hijo');
        return;
    }
    
    const childSelect = document.getElementById('editTaskChild');
    const childName = childSelect.options[childSelect.selectedIndex].text;
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        showNotification('❌ Error: Tarea no encontrada');
        return;
    }
    
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        name: taskName,
        subject: taskSubject,
        priority: taskPriority,
        deadline: taskDeadline,
        childName: childName,
        childEmail: childEmail
    };
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    showNotification('✏️ Tarea actualizada correctamente');
    
    editTaskFormContainer.classList.remove('active');
    editTaskForm.reset();
    
    // Resetear validaciones de edición
    document.querySelectorAll('#editTaskForm .input-with-validation input').forEach(input => {
        input.classList.remove('valid', 'invalid');
    });
    document.querySelectorAll('#editTaskForm .validation-message').forEach(el => {
        el.className = 'validation-message';
        el.textContent = '';
    });
    document.querySelectorAll('#editTaskForm .char-counter .current').forEach(el => {
        el.textContent = '0';
    });
    document.querySelectorAll('#editTaskForm .char-counter').forEach(el => {
        el.classList.remove('warning', 'danger');
    });
    document.querySelectorAll('#editTaskForm select').forEach(select => {
        select.classList.remove('valid', 'invalid');
    });
    
    renderTasks();
});

// ===== CANCELAR EDICIÓN =====
cancelEditBtn.addEventListener('click', function() {
    editTaskFormContainer.classList.remove('active');
    editTaskForm.reset();
    // Resetear validaciones de edición
    document.querySelectorAll('#editTaskForm .input-with-validation input').forEach(input => {
        input.classList.remove('valid', 'invalid');
    });
    document.querySelectorAll('#editTaskForm .validation-message').forEach(el => {
        el.className = 'validation-message';
        el.textContent = '';
    });
    document.querySelectorAll('#editTaskForm .char-counter .current').forEach(el => {
        el.textContent = '0';
    });
    document.querySelectorAll('#editTaskForm .char-counter').forEach(el => {
        el.classList.remove('warning', 'danger');
    });
    document.querySelectorAll('#editTaskForm select').forEach(select => {
        select.classList.remove('valid', 'invalid');
    });
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
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    const myChildren = getMyChildren();
    const myChildrenEmails = myChildren.map(child => child.email);
    
    let filteredTasks = tasks.filter(task => myChildrenEmails.includes(task.childEmail));

    const filterChildEmail = localStorage.getItem('filterChildEmail');
    let filterMessage = '';
    
    if (filterChildEmail) {
        if (myChildrenEmails.includes(filterChildEmail)) {
            filteredTasks = filteredTasks.filter(task => task.childEmail === filterChildEmail);
            const child = myChildren.find(c => c.email === filterChildEmail);
            filterMessage = `Mostrando tareas de ${child ? child.name : 'hijo'}`;
        } else {
            showNotification('⚠️ No tienes permiso para ver las tareas de este hijo');
        }
        localStorage.removeItem('filterChildEmail');
    }

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
    
    const tasksByChild = {};
    filteredTasks.forEach(task => {
        const childKey = task.childEmail;
        if (!tasksByChild[childKey]) {
            const child = myChildren.find(c => c.email === childKey);
            tasksByChild[childKey] = {
                name: child ? child.name : task.childName || 'Sin nombre',
                email: childKey,
                tasks: []
            };
        }
        tasksByChild[childKey].tasks.push(task);
    });
    
    let html = '';
    
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
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        showNotification('🗑️ Tarea eliminada correctamente');
    }
}

// ===== ELIMINAR TODAS LAS TAREAS DE UN HIJO =====
function deleteAllTasksForChild(childEmail) {
    const myChildren = getMyChildren();
    const childExists = myChildren.some(child => child.email === childEmail);
    
    if (!childExists) {
        showNotification('❌ No tienes permiso para eliminar tareas de este hijo');
        return;
    }
    
    const child = myChildren.find(c => c.email === childEmail);
    const childName = child ? child.name : 'este hijo';
    
    if (confirm(`¿Estás seguro de que quieres eliminar TODAS las tareas de ${childName}?`)) {
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
    
    loadChildrenSelect();
    
    // Inicializar validaciones
    setupTaskValidations();
    console.log('✅ Validaciones de tareas activadas');
});

// ===== VERIFICAR SESIÓN AL INICIAR =====
if (!checkSession()) {
    window.location.href = 'index.html';
}