// js/auth-ui.js

const signIn = document.getElementById('sign-in');
const signUp = document.getElementById('sign-up');
const form = document.getElementById('form');
const banner = document.getElementById('banner');

// --- LÓGICA DE INTERFAZ ---
signIn.addEventListener('click', (e) => {
    e.preventDefault();
    form.classList.remove('toggle');
    banner.classList.remove('toggle');
});

signUp.addEventListener('click', (e) => {
    e.preventDefault();
    form.classList.add('toggle');
    banner.classList.add('toggle');
});

// ===== FUNCIÓN PARA GUARDAR SESIÓN =====
function saveSession(email, name, role) {
    const sessionData = {
        email: email,
        name: name,
        role: role,
        loginTime: new Date().toISOString()
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
}

// ===== FUNCIÓN PARA REDIRIGIR SEGÚN ROL =====
function redirectBasedOnRole(role) {
    if (role === 'padre') {
        window.location.href = 'dashboard.html';
    } else if (role === 'hijo') {
        window.location.href = 'dashboard2.html';
    } else {
        window.location.href = 'dashboard.html';
    }
}

// ===== FUNCIÓN PARA VALIDAR CREDENCIALES (MODO PRUEBA) =====
function validateCredentials(email, password, role) {
    // Obtener usuarios registrados
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Buscar usuario por email, contraseña y rol
    const user = users.find(u => 
        u.email === email && 
        u.password === password && 
        u.role === role
    );
    
    // Si existe el usuario, devolverlo
    if (user) {
        return user;
    }
    
    // Si no existe, y es modo prueba, crear usuario temporal
    // SOLO para pruebas - permitir cualquier email/contraseña
    const tempUser = {
        id: Date.now(),
        name: email.split('@')[0] || 'Usuario',
        email: email,
        password: password,
        role: role,
        isTemporary: true
    };
    
    return tempUser;
}

// ===== FUNCIÓN PARA REGISTRAR USUARIO =====
function registerUser(name, email, password, role, parentEmail = null) {
    // Obtener usuarios existentes
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Verificar si el email ya está registrado (independientemente del rol)
    if (users.some(u => u.email === email)) {
        return { 
            success: false, 
            message: '❌ Este email ya está registrado. Por favor, usa otro email.' 
        };
    }
    
    // Validar que el email tenga formato válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { 
            success: false, 
            message: '❌ Por favor, ingresa un email válido.' 
        };
    }
    
    // Validar contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
        return { 
            success: false, 
            message: '❌ La contraseña debe tener al menos 6 caracteres.' 
        };
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role,
        registeredDate: new Date().toISOString(),
        // Si es un hijo, guardar el email del padre
        parentEmail: role === 'hijo' ? parentEmail : undefined,
        // Campos adicionales para hijos
        age: role === 'hijo' ? 0 : undefined,
        school: role === 'hijo' ? 'No especificado' : undefined,
        grade: role === 'hijo' ? 'No especificado' : undefined,
        avatar: role === 'hijo' ? '👦' : undefined
    };
    
    // Guardar usuario
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    return { 
        success: true, 
        message: `✅ Registro exitoso como ${role === 'padre' ? 'Padre/Madre' : 'Hijo/Hija'}`,
        user: newUser 
    };
}

// ===== FUNCIÓN PARA OBTENER HIJOS DE UN PADRE ESPECÍFICO =====
function getChildrenByParent(parentEmail) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    // Filtrar solo usuarios con rol "hijo" que tengan este parentEmail
    return users.filter(user => user.role === 'hijo' && user.parentEmail === parentEmail);
}

// ===== FUNCIÓN PARA OBTENER TODOS LOS HIJOS REGISTRADOS (SIN FILTRO) =====
function getRegisteredChildren() {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    // Filtrar solo usuarios con rol "hijo"
    return users.filter(user => user.role === 'hijo');
}

// ===== FUNCIÓN PARA OBTENER HIJOS DEL PADRE ACTUALMENTE LOGUEADO =====
function getMyChildren() {
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    const parentEmail = session.email;
    
    if (!parentEmail) {
        return [];
    }
    
    return getChildrenByParent(parentEmail);
}

// ===== FUNCIÓN PARA OBTENER UN HIJO POR EMAIL =====
function getChildByEmail(email) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return users.find(user => user.email === email && user.role === 'hijo');
}

// ===== FUNCIÓN PARA ELIMINAR UN HIJO =====
function deleteChild(email) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    const parentEmail = session.email;
    
    // Buscar el hijo
    const child = users.find(u => u.email === email && u.role === 'hijo');
    
    // Verificar que el hijo pertenezca al padre actual
    if (!child || child.parentEmail !== parentEmail) {
        return { 
            success: false, 
            message: '❌ No tienes permiso para eliminar este hijo' 
        };
    }
    
    // Filtrar usuarios eliminando el hijo
    const updatedUsers = users.filter(user => user.email !== email);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    // También eliminar sus tareas
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const updatedTasks = tasks.filter(task => task.childEmail !== email);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    return { success: true, message: 'Hijo eliminado correctamente' };
}

// ===== FUNCIÓN PARA ACTUALIZAR UN HIJO =====
function updateChild(oldEmail, newData) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    const parentEmail = session.email;
    
    const userIndex = users.findIndex(u => u.email === oldEmail && u.role === 'hijo');
    
    if (userIndex === -1) {
        return { success: false, message: 'Hijo no encontrado' };
    }
    
    // Verificar que el hijo pertenezca al padre actual
    if (users[userIndex].parentEmail !== parentEmail) {
        return { 
            success: false, 
            message: '❌ No tienes permiso para modificar este hijo' 
        };
    }
    
    // Verificar si el nuevo email ya está en uso (excepto el del mismo usuario)
    if (newData.email && newData.email !== oldEmail) {
        if (users.some(u => u.email === newData.email && u.role === 'hijo')) {
            return { 
                success: false, 
                message: '❌ Este email ya está registrado por otro hijo' 
            };
        }
    }
    
    // Actualizar datos
    users[userIndex] = {
        ...users[userIndex],
        name: newData.name || users[userIndex].name,
        email: newData.email || users[userIndex].email,
        password: newData.password || users[userIndex].password,
        age: newData.age !== undefined ? newData.age : users[userIndex].age,
        school: newData.school || users[userIndex].school,
        grade: newData.grade || users[userIndex].grade,
        avatar: newData.avatar || users[userIndex].avatar,
        // Mantener el parentEmail original
        parentEmail: users[userIndex].parentEmail
    };
    
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Si el email cambió, actualizar las tareas
    if (newData.email && newData.email !== oldEmail) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const updatedTasks = tasks.map(task => {
            if (task.childEmail === oldEmail) {
                return {
                    ...task,
                    childEmail: newData.email,
                    childName: newData.name || task.childName
                };
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }
    
    return { success: true, message: 'Hijo actualizado correctamente' };
}

// ===== FUNCIÓN PARA REGISTRAR UN HIJO DESDE EL PANEL DE PADRES =====
function registerChildFromParent(name, email, password, age, school, grade, avatar, parentEmail) {
    // Validar que el email no esté registrado
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
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
        parentEmail: parentEmail,
        age: parseInt(age) || 0,
        school: school || 'No especificado',
        grade: grade || 'No especificado',
        avatar: avatar || '👦',
        registeredDate: new Date().toISOString()
    };
    
    // Guardar usuario
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    return { success: true, message: `✅ ${name} ha sido registrado correctamente`, user: newUser };
}

// --- LÓGICA DE LOGIN ---
document.querySelector('.login button').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const role = document.getElementById('loginRole').value;
    
    // Validar campos
    if (!email || !password) {
        alert('❌ Por favor, completa todos los campos');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Por favor, ingresa un email válido');
        return;
    }
    
    // Obtener usuario (válido o temporal en modo prueba)
    const user = validateCredentials(email, password, role);
    
    if (user) {
        // Guardar sesión
        saveSession(email, user.name, role);
        
        // Mostrar mensaje de bienvenida
        if (user.isTemporary) {
            alert(`✅ ¡Bienvenid@ ${user.name}! (Modo prueba - Sesión temporal)`);
        } else {
            alert(`✅ ¡Bienvenid@ ${user.name}!`);
        }
        
        // Redirigir según rol
        redirectBasedOnRole(role);
    } else {
        alert('❌ Error al iniciar sesión. Por favor, intenta nuevamente.');
    }
    
    /* ===== CÓDIGO ORIGINAL COMENTADO PARA BACKEND ===== */
    /*
    const response = await fetch('/sandwatch/Backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password, rol: role })
    });

    const result = await response.json();
    if (result.status === 'success') {
        saveSession(email, result.name, role);
        redirectBasedOnRole(role);
    } else {
        alert("❌ " + result.message);
    }
    */
});

// --- LÓGICA DE REGISTRO ---
document.querySelector('.register button').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email-reg').value.trim().toLowerCase();
    const password = document.getElementById('password-reg').value;
    const role = document.getElementById('registerRole').value;
    
    // Validar campos
    if (!name || !email || !password) {
        alert('❌ Por favor, completa todos los campos');
        return;
    }
    
    // Registrar usuario (sin parentEmail porque es registro desde el login)
    const result = registerUser(name, email, password, role);
    
    if (result.success) {
        alert(result.message);
        
        // Limpiar formulario
        document.getElementById('name').value = '';
        document.getElementById('email-reg').value = '';
        document.getElementById('password-reg').value = '';
        
        // Cambiar a login automáticamente
        form.classList.remove('toggle');
        banner.classList.remove('toggle');
        
        // Pre-llenar email en login
        document.getElementById('email').value = email;
        document.getElementById('loginRole').value = role;
    } else {
        alert(result.message);
    }
    
    /* ===== CÓDIGO ORIGINAL COMENTADO PARA BACKEND ===== */
    /*
    const response = await fetch('/sandwatch/Backend/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: name, correo: email, contrasena: password, rol: role })
    });

    const result = await response.json();
    if (result.status === 'success') {
        alert("✅ " + result.message);
        form.classList.remove('toggle');
        banner.classList.remove('toggle');
        document.getElementById('email').value = email;
        document.getElementById('loginRole').value = role;
    } else {
        alert("❌ " + result.message);
    }
    */
});

// ===== VERIFICAR SESIÓN AL CARGAR LA PÁGINA =====
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya hay una sesión activa
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    
    if (isLoggedIn === 'true' && userRole) {
        // Redirigir automáticamente según el rol
        redirectBasedOnRole(userRole);
    }
});

// Exportar funciones para usar en otros archivos
window.registerUser = registerUser;
window.getRegisteredChildren = getRegisteredChildren;
window.getChildrenByParent = getChildrenByParent;
window.getMyChildren = getMyChildren;
window.getChildByEmail = getChildByEmail;
window.deleteChild = deleteChild;
window.updateChild = updateChild;
window.registerChildFromParent = registerChildFromParent;

console.log('Auth UI con roles cargado correctamente (Modo Prueba)');