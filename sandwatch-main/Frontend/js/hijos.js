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

// ===== FUNCIONES PARA OBTENER USUARIOS REGISTRADOS =====
function getRegisteredUsers() {
    return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
}

function saveRegisteredUsers(users) {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// ===== FUNCIÓN PARA OBTENER HIJOS DE UN PADRE ESPECÍFICO =====
function getChildrenByParent(parentEmail) {
    const users = getRegisteredUsers();
    // Filtrar solo usuarios con rol "hijo" que tengan este parentEmail
    return users.filter(user => user.role === 'hijo' && user.parentEmail === parentEmail);
}

// ===== FUNCIÓN PARA OBTENER TODOS LOS HIJOS REGISTRADOS (SIN FILTRO) =====
function getRegisteredChildren() {
    const users = getRegisteredUsers();
    return users.filter(user => user.role === 'hijo');
}

// ===== FUNCIÓN PARA OBTENER EL EMAIL DEL PADRE LOGUEADO =====
function getParentEmail() {
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    return session.email || null;
}

// ===== CARGAR HIJOS DESDE LOCALSTORAGE (SOLO LOS DEL PADRE ACTUAL) =====
function loadChildren() {
    const parentEmail = getParentEmail();
    
    if (!parentEmail) {
        console.error('No se encontró el email del padre en la sesión');
        children = [];
        renderChildren();
        return;
    }
    
    // Obtener solo los hijos de este padre
    const registeredChildren = getChildrenByParent(parentEmail);
    
    if (registeredChildren.length > 0) {
        // Convertir usuarios a formato de hijos
        children = registeredChildren.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            age: user.age || 0,
            school: user.school || 'No especificado',
            grade: user.grade || 'No especificado',
            avatar: user.avatar || '👦',
            registeredDate: user.registeredDate || new Date().toLocaleDateString('es-ES')
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
        // Limpiar el formulario
        childForm.reset();
        const submitBtn = childForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Registrar hijo';
        delete childForm.dataset.editId;
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
});

// ===== REGISTRAR NUEVO HIJO (CON EMAIL, CONTRASEÑA Y PARENTEMAIL) =====
function registerChild(name, email, password, age, school, grade, avatar, parentEmail) {
    // Validar que el email no esté registrado
    const users = getRegisteredUsers();
    if (users.some(u => u.email === email)) {
        return { success: false, message: '❌ Este email ya está registrado' };
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { success: false, message: '❌ Email inválido' };
    }
    
    // Validar contraseña
    if (password.length < 6) {
        return { success: false, message: '❌ La contraseña debe tener al menos 6 caracteres' };
    }
    
    // Crear usuario hijo con parentEmail
    const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: 'hijo',
        parentEmail: parentEmail, // Asociar al padre
        age: parseInt(age) || 0,
        school: school || 'No especificado',
        grade: grade || 'No especificado',
        avatar: avatar || '👦',
        registeredDate: new Date().toISOString()
    };
    
    // Guardar usuario
    users.push(newUser);
    saveRegisteredUsers(users);
    
    return { success: true, message: `✅ ${name} ha sido registrado correctamente`, user: newUser };
}

// ===== ACTUALIZAR HIJO =====
function updateChild(childId, name, email, password, age, school, grade, avatar, parentEmail) {
    const users = getRegisteredUsers();
    const userIndex = users.findIndex(u => u.id === childId && u.role === 'hijo');
    
    if (userIndex === -1) {
        return { success: false, message: '❌ Hijo no encontrado' };
    }
    
    // Verificar que el hijo pertenezca al padre actual
    if (users[userIndex].parentEmail !== parentEmail) {
        return { 
            success: false, 
            message: '❌ No tienes permiso para modificar este hijo' 
        };
    }
    
    // Verificar si el nuevo email ya está en uso (excepto el del mismo usuario)
    if (users.some(u => u.email === email && u.id !== childId && u.role === 'hijo')) {
        return { success: false, message: '❌ Este email ya está registrado por otro hijo' };
    }
    
    // Guardar el email antiguo para actualizar tareas
    const oldEmail = users[userIndex].email;
    
    // Actualizar datos
    users[userIndex] = {
        ...users[userIndex],
        name: name.trim(),
        email: email.trim().toLowerCase(),
        age: parseInt(age) || 0,
        school: school || 'No especificado',
        grade: grade || 'No especificado',
        avatar: avatar || '👦',
        parentEmail: parentEmail // Mantener el parentEmail
    };
    
    // Si se proporcionó nueva contraseña, actualizarla
    if (password && password.length >= 6) {
        users[userIndex].password = password;
    }
    
    saveRegisteredUsers(users);
    
    // Actualizar las tareas si el email cambió
    if (oldEmail !== email) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const updatedTasks = tasks.map(task => {
            if (task.childEmail === oldEmail) {
                return {
                    ...task,
                    childEmail: email,
                    childName: name
                };
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
    
    // Verificar que el hijo pertenezca al padre actual
    if (!childUser || childUser.parentEmail !== parentEmail) {
        showNotification('❌ No tienes permiso para eliminar este hijo');
        return;
    }
    
    if (confirm(`¿Estás seguro de que quieres eliminar a ${child.name}?\n\nSe eliminarán todas sus tareas y su cuenta de acceso.`)) {
        // Eliminar de usuarios registrados
        const updatedUsers = users.filter(u => u.id !== childId);
        saveRegisteredUsers(updatedUsers);
        
        // Eliminar sus tareas
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const updatedTasks = tasks.filter(task => task.childEmail !== child.email);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        
        // Recargar lista
        loadChildren();
        showNotification(`🗑️ ${child.name} ha sido eliminado junto con sus tareas`);
    }
}

// ===== RENDERIZAR HIJOS =====
function renderChildren() {
    // Actualizar contador
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
    // Guardar el email del hijo para filtrar en el dashboard
    localStorage.setItem('filterChildEmail', childEmail);
    window.location.href = 'dashboard.html';
}

// ===== EDITAR HIJO =====
function editChild(childId) {
    const child = children.find(c => c.id === childId);
    if (!child) return;
    
    // Llenar el formulario con los datos del hijo
    document.getElementById('childName').value = child.name;
    document.getElementById('childEmail').value = child.email;
    document.getElementById('childPassword').value = '';
    document.getElementById('childAge').value = child.age;
    document.getElementById('childSchool').value = child.school;
    document.getElementById('childGrade').value = child.grade;
    document.getElementById('childAvatar').value = child.avatar;
    
    // Mostrar mensaje sobre la contraseña
    document.querySelector('#childPassword + small')?.remove();
    const passwordInput = document.getElementById('childPassword');
    const small = document.createElement('small');
    small.textContent = 'Dejar en blanco para mantener la contraseña actual';
    small.style.fontSize = '0.7rem';
    small.style.color = '#666';
    small.style.marginTop = '0.2rem';
    passwordInput.parentNode.appendChild(small);
    
    // Abrir el formulario
    childFormContainer.classList.add('active');
    openChildFormBtn.textContent = '✕ Cerrar formulario';
    
    // Cambiar el texto del botón de submit
    const submitBtn = childForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Actualizar hijo';
    
    // Guardar el ID para actualizar
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
    
    // Obtener el email del padre desde la sesión
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
    
    if (editId) {
        // ===== MODO EDICIÓN =====
        const result = updateChild(parseInt(editId), name, email, password, age, school, grade, avatar, parentEmail);
        
        if (result.success) {
            showNotification(result.message);
            // Limpiar y cerrar
            delete this.dataset.editId;
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Registrar hijo';
            childForm.reset();
            childFormContainer.classList.remove('active');
            openChildFormBtn.textContent = '+ Registrar nuevo hijo';
            // Recargar lista
            loadChildren();
        } else {
            showNotification(result.message);
        }
    } else {
        // ===== MODO REGISTRO =====
        // Validar que la contraseña tenga al menos 6 caracteres
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
            // Recargar lista
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

// ===== INICIALIZAR =====
// Verificar sesión
if (!checkSession()) {
    window.location.href = 'index.html';
}

// Cargar hijos
loadChildren();

console.log('Página de hijos cargada correctamente');
console.log('Hijos:', children);