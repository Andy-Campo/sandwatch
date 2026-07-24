// ===== MENÚ HAMBURGUESA =====
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

// ===== CERRAR MENÚ AL HACER CLICK EN UN ENLACE =====
const navLinks = document.querySelectorAll('.nav_link');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            navList.classList.remove('open');
            menuIcon.src = './icons/menu-open.svg';
            menuIcon.alt = 'Abrir menú';
            menuOpen = false;
        }
    });
});

// ===== CERRAR MENÚ AL HACER CLICK FUERA =====
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

// ===== VERIFICAR SESIÓN =====
function checkSession() {
    let isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    let userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
    
    if (isLoggedIn !== 'true' || !userRole) {
        alert('⚠️ Por favor, inicia sesión para acceder a esta página');
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
// ===== FUNCIONALIDAD DE HIJOS =====
// ============================================

// Elementos del DOM
const openChildFormBtn = document.getElementById('openChildForm');
const childFormContainer = document.getElementById('childFormContainer');
const cancelChildFormBtn = document.getElementById('cancelChildForm');
const childForm = document.getElementById('childForm');
const childrenContainer = document.getElementById('childrenContainer');
const notification = document.getElementById('notification');
const childCounter = document.getElementById('childCounter');

// Array para almacenar los hijos
let children = [];

// ============================================
// ===== PATRONES DE VALIDACIÓN =====
// ============================================
const VALIDATION_PATTERNS = {
    // Solo letras, espacios, puntos, apóstrofes, tildes y ñ
    name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.']*$/,
    // Solo letras, números, espacios, puntos, apóstrofes, tildes y ñ
    school: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.']*$/,
    // Email básico
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};

// ============================================
// ===== FUNCIONES DE VALIDACIÓN =====
// ============================================

function validateField(value, pattern, minLength = 0, maxLength = Infinity) {
    if (value.length < minLength) return { valid: false, message: `Mínimo ${minLength} caracteres` };
    if (value.length > maxLength) return { valid: false, message: `Máximo ${maxLength} caracteres` };
    if (!pattern.test(value) && value.length > 0) {
        return { valid: false, message: 'Caracteres no permitidos' };
    }
    return { valid: true, message: '' };
}

function showValidationMessage(element, message, type = 'error') {
    if (!element) return;
    element.textContent = message;
    element.className = `validation-message show ${type}`;
}

function hideValidationMessage(element) {
    if (!element) return;
    element.className = 'validation-message';
    element.textContent = '';
}

function setInputStatus(input, isValid) {
    if (!input) return;
    input.classList.remove('valid', 'invalid');
    if (isValid && input.value.length > 0) {
        input.classList.add('valid');
    } else if (!isValid && input.value.length > 0) {
        input.classList.add('invalid');
    }
}

function showTemporaryMessage(message, validationId) {
    const validationEl = document.getElementById(validationId);
    if (validationEl) {
        showValidationMessage(validationEl, message, 'error');
        clearTimeout(validationEl._timeout);
        validationEl._timeout = setTimeout(() => {
            hideValidationMessage(validationEl);
        }, 3000);
    }
}

// ============================================
// ===== CONFIGURAR VALIDACIONES EN TIEMPO REAL =====
// ============================================

function setupValidations() {
    const childName = document.getElementById('childName');
    const childEmail = document.getElementById('childEmail');
    const childPassword = document.getElementById('childPassword');
    const childAge = document.getElementById('childAge');
    const childSchool = document.getElementById('childSchool');
    
    const nameValidation = document.getElementById('childNameValidation');
    const emailValidation = document.getElementById('childEmailValidation');
    const passwordValidation = document.getElementById('childPasswordValidation');
    const ageValidation = document.getElementById('childAgeValidation');
    const schoolValidation = document.getElementById('childSchoolValidation');
    
    const nameCounter = document.querySelector('#childName + .char-counter .current');
    const schoolCounter = document.querySelector('#childSchool + .char-counter .current');

    // ===== VALIDACIÓN: NOMBRE =====
    if (childName) {
        childName.addEventListener('input', function() {
            const value = this.value;
            const maxLength = 50;
            
            // Actualizar contador
            if (nameCounter) nameCounter.textContent = value.length;
            
            // Color del contador
            const counter = this.parentElement.querySelector('.char-counter');
            if (counter) {
                counter.classList.remove('warning', 'danger');
                if (value.length > maxLength * 0.8) counter.classList.add('warning');
                if (value.length >= maxLength) counter.classList.add('danger');
            }
            
            if (value.length === 0) {
                hideValidationMessage(nameValidation);
                setInputStatus(this, false);
                return;
            }
            
            const result = validateField(value, VALIDATION_PATTERNS.name, 0, maxLength);
            
            if (!result.valid) {
                showValidationMessage(nameValidation, `⚠️ ${result.message}`, 'error');
                setInputStatus(this, false);
            } else {
                hideValidationMessage(nameValidation);
                setInputStatus(this, true);
            }
        });
    }

    // ===== VALIDACIÓN: EMAIL =====
    if (childEmail) {
        childEmail.addEventListener('input', function() {
            const value = this.value;
            
            if (value.length === 0) {
                hideValidationMessage(emailValidation);
                setInputStatus(this, false);
                return;
            }
            
            if (!VALIDATION_PATTERNS.email.test(value)) {
                showValidationMessage(emailValidation, '⚠️ Ingresa un correo electrónico válido', 'error');
                setInputStatus(this, false);
            } else {
                hideValidationMessage(emailValidation);
                setInputStatus(this, true);
            }
        });
    }

    // ===== VALIDACIÓN: CONTRASEÑA =====
    if (childPassword) {
        childPassword.addEventListener('input', function() {
            const value = this.value;
            const minLength = 6;
            
            if (value.length === 0) {
                hideValidationMessage(passwordValidation);
                setInputStatus(this, false);
                return;
            }
            
            if (value.length < minLength) {
                showValidationMessage(passwordValidation, `⚠️ Mínimo ${minLength} caracteres (${value.length}/${minLength})`, 'error');
                setInputStatus(this, false);
            } else {
                hideValidationMessage(passwordValidation);
                setInputStatus(this, true);
            }
        });
    }

    // ===== VALIDACIÓN: EDAD (SOLO NÚMEROS) =====
    if (childAge) {
        // Bloquear caracteres no numéricos
        childAge.addEventListener('keydown', function(e) {
            const controlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight',
                'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'
            ];
            if (controlKeys.includes(e.key)) return;
            
            if (!/^[0-9]$/.test(e.key)) {
                e.preventDefault();
                this.classList.add('shake');
                setTimeout(() => this.classList.remove('shake'), 300);
                showTemporaryMessage('⚠️ Solo se permiten números', 'childAgeValidation');
            }
        });

        // Validar pegado
        childAge.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const numbersOnly = pastedText.replace(/[^0-9]/g, '');
            if (numbersOnly) {
                this.value = numbersOnly;
                this.dispatchEvent(new Event('input'));
            }
            showTemporaryMessage('⚠️ Solo se permiten números', 'childAgeValidation');
        });

        // Validación en tiempo real
        childAge.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 2) this.value = this.value.slice(0, 2);
            
            const value = parseInt(this.value);
            const min = 1;
            const max = 18;
            
            if (this.value.length === 0) {
                hideValidationMessage(ageValidation);
                setInputStatus(this, false);
                return;
            }
            
            if (isNaN(value) || value < min || value > max) {
                showValidationMessage(ageValidation, `⚠️ La edad debe estar entre ${min} y ${max} años`, 'error');
                setInputStatus(this, false);
            } else {
                hideValidationMessage(ageValidation);
                setInputStatus(this, true);
            }
        });

        // Validar al perder el foco
        childAge.addEventListener('blur', function() {
            if (this.value.length > 0) {
                const value = parseInt(this.value);
                if (value < 1) this.value = '1';
                if (value > 18) this.value = '18';
                this.dispatchEvent(new Event('input'));
            }
        });
    }

    // ===== VALIDACIÓN: COLEGIO =====
    if (childSchool) {
        childSchool.addEventListener('input', function() {
            const value = this.value;
            const maxLength = 100;
            
            // Actualizar contador
            if (schoolCounter) schoolCounter.textContent = value.length;
            
            // Color del contador
            const counter = this.parentElement.querySelector('.char-counter');
            if (counter) {
                counter.classList.remove('warning', 'danger');
                if (value.length > maxLength * 0.8) counter.classList.add('warning');
                if (value.length >= maxLength) counter.classList.add('danger');
            }
            
            if (value.length === 0) {
                hideValidationMessage(schoolValidation);
                setInputStatus(this, false);
                return;
            }
            
            const result = validateField(value, VALIDATION_PATTERNS.school, 0, maxLength);
            
            if (!result.valid) {
                showValidationMessage(schoolValidation, `⚠️ ${result.message}`, 'error');
                setInputStatus(this, false);
            } else {
                hideValidationMessage(schoolValidation);
                setInputStatus(this, true);
            }
        });
    }
}

// ============================================
// ===== FUNCIONES PARA OBTENER USUARIOS REGISTRADOS =====
// ============================================

function getRegisteredUsers() {
    return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
}

function saveRegisteredUsers(users) {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// ===== FUNCIÓN PARA OBTENER HIJOS DE UN PADRE ESPECÍFICO =====
function getChildrenByParent(parentEmail) {
    const users = getRegisteredUsers();
    return users.filter(user => user.role === 'hijo' && user.parentEmail === parentEmail);
}

// ===== FUNCIÓN PARA OBTENER EL EMAIL DEL PADRE LOGUEADO =====
function getParentEmail() {
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    return session.email || null;
}

// ===== CARGAR HIJOS DESDE LOCALSTORAGE =====
function loadChildren() {
    const parentEmail = getParentEmail();
    
    if (!parentEmail) {
        console.error('No se encontró el email del padre en la sesión');
        children = [];
        renderChildren();
        return;
    }
    
    const registeredChildren = getChildrenByParent(parentEmail);
    
    if (registeredChildren.length > 0) {
        children = registeredChildren.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            age: user.age || 0,
            school: user.school || 'No especificado',
            grade: user.grade || 'No especificado',
            avatar: user.avatar || '👦',
            registeredDate: user.registeredDate ? new Date(user.registeredDate).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')
        }));
    } else {
        children = [];
    }
    
    renderChildren();
}

// ===== MOSTRAR/OCULTAR FORMULARIO =====
openChildFormBtn.addEventListener('click', function() {
    childFormContainer.classList.toggle('active');
    if (childFormContainer.classList.contains('active')) {
        this.textContent = '✕ Cerrar formulario';
        childForm.reset();
        const submitBtn = childForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Registrar hijo';
        delete childForm.dataset.editId;
        // Resetear validaciones
        document.querySelectorAll('.input-with-validation input').forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        document.querySelectorAll('.validation-message').forEach(el => {
            el.className = 'validation-message';
            el.textContent = '';
        });
        document.querySelectorAll('.char-counter .current').forEach(el => {
            el.textContent = '0';
        });
        document.querySelectorAll('.char-counter').forEach(el => {
            el.classList.remove('warning', 'danger');
        });
        // Eliminar mensaje extra de contraseña
        const extraMessage = document.querySelector('#childPassword + small:not(:first-of-type)');
        if (extraMessage) extraMessage.remove();
    } else {
        this.textContent = '+ Registrar nuevo hijo';
        childForm.reset();
    }
});

cancelChildFormBtn.addEventListener('click', function() {
    childFormContainer.classList.remove('active');
    openChildFormBtn.textContent = '+ Registrar nuevo hijo';
    childForm.reset();
    const submitBtn = childForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Registrar hijo';
    delete childForm.dataset.editId;
    // Resetear validaciones
    document.querySelectorAll('.input-with-validation input').forEach(input => {
        input.classList.remove('valid', 'invalid');
    });
    document.querySelectorAll('.validation-message').forEach(el => {
        el.className = 'validation-message';
        el.textContent = '';
    });
    document.querySelectorAll('.char-counter .current').forEach(el => {
        el.textContent = '0';
    });
    document.querySelectorAll('.char-counter').forEach(el => {
        el.classList.remove('warning', 'danger');
    });
    // Eliminar mensaje extra de contraseña
    const extraMessage = document.querySelector('#childPassword + small:not(:first-of-type)');
    if (extraMessage) extraMessage.remove();
});

// ===== REGISTRAR NUEVO HIJO =====
function registerChild(name, email, password, age, school, grade, avatar, parentEmail) {
    // Validar formato de nombre (solo letras, espacios, puntos y apóstrofes)
    if (!VALIDATION_PATTERNS.name.test(name)) {
        return { success: false, message: '❌ El nombre contiene caracteres no permitidos' };
    }
    
    // Validar que el email no esté registrado
    const users = getRegisteredUsers();
    if (users.some(u => u.email === email)) {
        return { success: false, message: '❌ Este email ya está registrado' };
    }
    
    // Validar formato de email
    if (!VALIDATION_PATTERNS.email.test(email)) {
        return { success: false, message: '❌ Email inválido' };
    }
    
    // Validar contraseña
    if (password.length < 6) {
        return { success: false, message: '❌ La contraseña debe tener al menos 6 caracteres' };
    }
    
    // Validar edad
    if (isNaN(age) || age < 1 || age > 18) {
        return { success: false, message: '❌ La edad debe estar entre 1 y 18 años' };
    }
    
    // Validar colegio
    if (school && !VALIDATION_PATTERNS.school.test(school)) {
        return { success: false, message: '❌ El colegio contiene caracteres no permitidos' };
    }
    
    // Crear usuario hijo
    const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: 'hijo',
        parentEmail: parentEmail,
        age: parseInt(age),
        school: school || 'No especificado',
        grade: grade || 'No especificado',
        avatar: avatar || '👦',
        registeredDate: new Date().toISOString()
    };
    
    users.push(newUser);
    saveRegisteredUsers(users);
    
    return { success: true, message: `✅ ${name} ha sido registrado correctamente`, user: newUser };
}

// ===== ACTUALIZAR HIJO =====
function updateChild(childId, name, email, password, age, school, grade, avatar, parentEmail) {
    // Validar formato de nombre
    if (!VALIDATION_PATTERNS.name.test(name)) {
        return { success: false, message: '❌ El nombre contiene caracteres no permitidos' };
    }
    
    const users = getRegisteredUsers();
    const userIndex = users.findIndex(u => u.id === childId && u.role === 'hijo');
    
    if (userIndex === -1) {
        return { success: false, message: '❌ Hijo no encontrado' };
    }
    
    if (users[userIndex].parentEmail !== parentEmail) {
        return { success: false, message: '❌ No tienes permiso para modificar este hijo' };
    }
    
    if (users.some(u => u.email === email && u.id !== childId && u.role === 'hijo')) {
        return { success: false, message: '❌ Este email ya está registrado por otro hijo' };
    }
    
    // Validar email
    if (!VALIDATION_PATTERNS.email.test(email)) {
        return { success: false, message: '❌ Email inválido' };
    }
    
    // Validar edad
    if (isNaN(age) || age < 1 || age > 18) {
        return { success: false, message: '❌ La edad debe estar entre 1 y 18 años' };
    }
    
    // Validar colegio
    if (school && !VALIDATION_PATTERNS.school.test(school)) {
        return { success: false, message: '❌ El colegio contiene caracteres no permitidos' };
    }
    
    const oldEmail = users[userIndex].email;
    
    users[userIndex] = {
        ...users[userIndex],
        name: name.trim(),
        email: email.trim().toLowerCase(),
        age: parseInt(age),
        school: school || 'No especificado',
        grade: grade || 'No especificado',
        avatar: avatar || '👦',
        parentEmail: parentEmail
    };
    
    if (password && password.length >= 6) {
        users[userIndex].password = password;
    }
    
    saveRegisteredUsers(users);
    
    if (oldEmail !== email) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const updatedTasks = tasks.map(task => {
            if (task.childEmail === oldEmail) {
                return { ...task, childEmail: email, childName: name };
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }
    
    return { success: true, message: `✅ ${name} ha sido actualizado correctamente` };
}

// ===== ELIMINAR HIJO =====
function deleteChild(childId) {
    const child = children.find(c => c.id === childId);
    if (!child) return;
    
    const parentEmail = getParentEmail();
    const users = getRegisteredUsers();
    const childUser = users.find(u => u.id === childId && u.role === 'hijo');
    
    if (!childUser || childUser.parentEmail !== parentEmail) {
        showNotification('❌ No tienes permiso para eliminar este hijo');
        return;
    }
    
    if (confirm(`¿Estás seguro de que quieres eliminar a ${child.name}?\n\nSe eliminarán todas sus tareas y su cuenta de acceso.`)) {
        const updatedUsers = users.filter(u => u.id !== childId);
        saveRegisteredUsers(updatedUsers);
        
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const updatedTasks = tasks.filter(task => task.childEmail !== child.email);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        
        loadChildren();
        showNotification(`🗑️ ${child.name} ha sido eliminado junto con sus tareas`);
    }
}

// ===== RENDERIZAR HIJOS =====
function renderChildren() {
    childCounter.textContent = `Total: ${children.length} hijos`;
    
    if (children.length === 0) {
        childrenContainer.innerHTML = `
            <div class="empty-state-child">
                <div class="empty-icon">👶</div>
                <h3>No hay hijos registrados</h3>
                <p>Haz clic en "Registrar nuevo hijo" para comenzar</p>
                <p style="font-size: 0.9rem; color: #999; margin-top: 0.5rem;">
                    Cada hijo tendrá su propio email y contraseña para iniciar sesión
                </p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="children-grid">';
    
    children.forEach(child => {
        html += `
            <div class="child-card">
                <div class="avatar">${child.avatar}</div>
                <div class="child-name">${child.name}</div>
                <div class="child-info">
                    <span><span class="label">Email:</span> ${child.email}</span>
                    <span><span class="label">Edad:</span> ${child.age} años</span>
                    <span><span class="label">Colegio:</span> ${child.school}</span>
                    <span><span class="label">Grado:</span> ${child.grade}</span>
                    <span style="font-size: 0.75rem; color: #999; margin-top: 0.5rem;">
                        Registrado: ${child.registeredDate}
                    </span>
                </div>
                <div class="card-actions">
                    <button class="btn-tasks" onclick="viewChildTasks('${child.email}')">📋 Tareas</button>
                    <button class="btn-edit" onclick="editChild(${child.id})">✏️ Editar</button>
                    <button class="btn-delete" onclick="deleteChild(${child.id})">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    childrenContainer.innerHTML = html;
}

// ===== VER TAREAS DEL HIJO =====
function viewChildTasks(childEmail) {
    localStorage.setItem('filterChildEmail', childEmail);
    window.location.href = 'dashboard.html';
}

// ===== EDITAR HIJO =====
function editChild(childId) {
    const child = children.find(c => c.id === childId);
    if (!child) return;
    
    document.getElementById('childName').value = child.name;
    document.getElementById('childEmail').value = child.email;
    document.getElementById('childPassword').value = '';
    document.getElementById('childAge').value = child.age;
    document.getElementById('childSchool').value = child.school;
    document.getElementById('childGrade').value = child.grade;
    document.getElementById('childAvatar').value = child.avatar;
    
    // Agregar mensaje sobre la contraseña
    const extraMessage = document.querySelector('#childPassword + small:not(:first-of-type)');
    if (!extraMessage) {
        const passwordInput = document.getElementById('childPassword');
        const small = document.createElement('small');
        small.textContent = 'Dejar en blanco para mantener la contraseña actual';
        small.style.fontSize = '0.7rem';
        small.style.color = '#666';
        small.style.marginTop = '0.2rem';
        passwordInput.parentNode.appendChild(small);
    }
    
    childFormContainer.classList.add('active');
    openChildFormBtn.textContent = '✕ Cerrar formulario';
    
    const submitBtn = childForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Actualizar hijo';
    
    childForm.dataset.editId = childId;
}

// ===== MANEJAR ENVÍO DEL FORMULARIO =====
childForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editId = this.dataset.editId;
    const name = document.getElementById('childName').value.trim();
    const email = document.getElementById('childEmail').value.trim().toLowerCase();
    const password = document.getElementById('childPassword').value;
    const age = parseInt(document.getElementById('childAge').value);
    const school = document.getElementById('childSchool').value.trim();
    const grade = document.getElementById('childGrade').value;
    const avatar = document.getElementById('childAvatar').value;
    
    const parentEmail = getParentEmail();
    
    if (!parentEmail) {
        showNotification('❌ Error: No se encontró la sesión del padre');
        return;
    }
    
    // Validar campos obligatorios
    if (!name || !email || !age) {
        showNotification('⚠️ Por favor, completa todos los campos obligatorios');
        return;
    }
    
    // Validar nombre
    if (!VALIDATION_PATTERNS.name.test(name)) {
        showNotification('❌ El nombre contiene caracteres no permitidos');
        return;
    }
    
    // Validar email
    if (!VALIDATION_PATTERNS.email.test(email)) {
        showNotification('❌ Email inválido');
        return;
    }
    
    // Validar edad
    if (isNaN(age) || age < 1 || age > 18) {
        showNotification('❌ La edad debe estar entre 1 y 18 años');
        return;
    }
    
    // Validar colegio
    if (school && !VALIDATION_PATTERNS.school.test(school)) {
        showNotification('❌ El colegio contiene caracteres no permitidos');
        return;
    }
    
    if (editId) {
        // ===== MODO EDICIÓN =====
        const result = updateChild(parseInt(editId), name, email, password, age, school, grade, avatar, parentEmail);
        
        if (result.success) {
            showNotification(result.message);
            delete this.dataset.editId;
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Registrar hijo';
            childForm.reset();
            childFormContainer.classList.remove('active');
            openChildFormBtn.textContent = '+ Registrar nuevo hijo';
            // Resetear validaciones
            document.querySelectorAll('.input-with-validation input').forEach(input => {
                input.classList.remove('valid', 'invalid');
            });
            document.querySelectorAll('.validation-message').forEach(el => {
                el.className = 'validation-message';
                el.textContent = '';
            });
            document.querySelectorAll('.char-counter .current').forEach(el => {
                el.textContent = '0';
            });
            document.querySelectorAll('.char-counter').forEach(el => {
                el.classList.remove('warning', 'danger');
            });
            const extraMessage = document.querySelector('#childPassword + small:not(:first-of-type)');
            if (extraMessage) extraMessage.remove();
            loadChildren();
        } else {
            showNotification(result.message);
        }
    } else {
        // ===== MODO REGISTRO =====
        if (password.length < 6) {
            showNotification('❌ La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        const result = registerChild(name, email, password, age, school, grade, avatar, parentEmail);
        
        if (result.success) {
            showNotification(result.message);
            childForm.reset();
            childFormContainer.classList.remove('active');
            openChildFormBtn.textContent = '+ Registrar nuevo hijo';
            // Resetear validaciones
            document.querySelectorAll('.input-with-validation input').forEach(input => {
                input.classList.remove('valid', 'invalid');
            });
            document.querySelectorAll('.validation-message').forEach(el => {
                el.className = 'validation-message';
                el.textContent = '';
            });
            document.querySelectorAll('.char-counter .current').forEach(el => {
                el.textContent = '0';
            });
            document.querySelectorAll('.char-counter').forEach(el => {
                el.classList.remove('warning', 'danger');
            });
            loadChildren();
        } else {
            showNotification(result.message);
        }
    }
});

// ===== MOSTRAR NOTIFICACIÓN =====
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ============================================
// ===== INICIALIZAR =====
// ============================================

// Verificar sesión
if (!checkSession()) {
    window.location.href = 'index.html';
}

// Configurar validaciones
setupValidations();

// Cargar hijos
loadChildren();

console.log('✅ Página de hijos cargada correctamente');
console.log('📋 Validaciones de caracteres activadas');
console.log('👨‍👩‍👧‍👦 Hijos:', children);