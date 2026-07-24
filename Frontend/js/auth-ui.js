// js/auth-ui.js[cite: 16]

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
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = users.find(u => 
        u.email === email && 
        u.password === password && 
        u.role === role
    );
    
    if (user) {
        return user;
    }
    
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
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    if (users.some(u => u.email === email)) {
        return { 
            success: false, 
            message: '❌ Este email ya está registrado. Por favor, usa otro email.' 
        };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { 
            success: false, 
            message: '❌ Por favor, ingresa un email válido.' 
        };
    }
    
    if (password.length < 6) {
        return { 
            success: false, 
            message: '❌ La contraseña debe tener al menos 6 caracteres.' 
        };
    }
    
    const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role,
        registeredDate: new Date().toISOString(),
        parentEmail: role === 'hijo' ? parentEmail : undefined,
        age: role === 'hijo' ? 0 : undefined,
        school: role === 'hijo' ? 'No especificado' : undefined,
        grade: role === 'hijo' ? 'No especificado' : undefined,
        avatar: role === 'hijo' ? '👦' : undefined
    };
    
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    return { 
        success: true, 
        message: `✅ Registro exitoso como ${role === 'padre' ? 'Padre/Madre' : 'Hijo/Hija'}`,
        user: newUser 
    };
}

// ===== FUNCIONES DE GESTIÓN DE HIJOS =====
function getChildrenByParent(parentEmail) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return users.filter(user => user.role === 'hijo' && user.parentEmail === parentEmail);
}

function getRegisteredChildren() {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return users.filter(user => user.role === 'hijo');
}

function getMyChildren() {
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    const parentEmail = session.email;
    if (!parentEmail) return [];
    return getChildrenByParent(parentEmail);
}

function getChildByEmail(email) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return users.find(user => user.email === email && user.role === 'hijo');
}

function deleteChild(email) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    const parentEmail = session.email;
    
    const child = users.find(u => u.email === email && u.role === 'hijo');
    if (!child || child.parentEmail !== parentEmail) {
        return { success: false, message: '❌ No tienes permiso para eliminar este hijo' };
    }
    
    const updatedUsers = users.filter(user => user.email !== email);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const updatedTasks = tasks.filter(task => task.childEmail !== email);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    return { success: true, message: 'Hijo eliminado correctamente' };
}

function updateChild(oldEmail, newData) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    const parentEmail = session.email;
    
    const userIndex = users.findIndex(u => u.email === oldEmail && u.role === 'hijo');
    if (userIndex === -1) return { success: false, message: 'Hijo no encontrado' };
    
    if (users[userIndex].parentEmail !== parentEmail) {
        return { success: false, message: '❌ No tienes permiso para modificar este hijo' };
    }
    
    if (newData.email && newData.email !== oldEmail) {
        if (users.some(u => u.email === newData.email && u.role === 'hijo')) {
            return { success: false, message: '❌ Este email ya está registrado por otro hijo' };
        }
    }
    
    users[userIndex] = {
        ...users[userIndex],
        name: newData.name || users[userIndex].name,
        email: newData.email || users[userIndex].email,
        password: newData.password || users[userIndex].password,
        age: newData.age !== undefined ? newData.age : users[userIndex].age,
        school: newData.school || users[userIndex].school,
        grade: newData.grade || users[userIndex].grade,
        avatar: newData.avatar || users[userIndex].avatar,
        parentEmail: users[userIndex].parentEmail
    };
    
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    if (newData.email && newData.email !== oldEmail) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const updatedTasks = tasks.map(task => {
            if (task.childEmail === oldEmail) {
                return { ...task, childEmail: newData.email, childName: newData.name || task.childName };
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    }
    
    return { success: true, message: 'Hijo actualizado correctamente' };
}

function registerChildFromParent(name, email, password, age, school, grade, avatar, parentEmail) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (users.some(u => u.email === email)) {
        return { success: false, message: '❌ Este email ya está registrado' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { success: false, message: '❌ Email inválido' };
    if (password.length < 6) return { success: false, message: '❌ La contraseña debe tener al menos 6 caracteres' };
    
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
    
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    return { success: true, message: `✅ ${name} ha sido registrado correctamente`, user: newUser };
}

// --- LÓGICA DE LOGIN ---
const loginBtnElement = document.getElementById('loginBtn');
if (loginBtnElement) {
    loginBtnElement.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const role = document.getElementById('loginRole').value;
        
        if (!email || !password) {
            alert('❌ Por favor, completa todos los campos');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('❌ Por favor, ingresa un email válido');
            return;
        }
        
        const user = validateCredentials(email, password, role);
        if (user) {
            saveSession(email, user.name, role);
            if (user.isTemporary) {
                alert(`✅ ¡Bienvenid@ ${user.name}! (Modo prueba - Sesión temporal)`);
            } else {
                alert(`✅ ¡Bienvenid@ ${user.name}!`);
            }
            redirectBasedOnRole(role);
        } else {
            alert('❌ Error al iniciar sesión. Por favor, intenta nuevamente.');
        }
    });
}

// --- LÓGICA DE REGISTRO Y VALIDACIÓN EN TIEMPO REAL ---
document.addEventListener('DOMContentLoaded', function() {
    const passwordRegInput = document.getElementById('password-reg');
    const passwordConfirmInput = document.getElementById('password-confirm');
    
    const reqLength = document.getElementById('req-length');
    const reqLower = document.getElementById('req-lower');
    const reqUpper = document.getElementById('req-upper');
    const reqNumber = document.getElementById('req-number');
    const reqSymbol = document.getElementById('req-symbol');
    const matchStatus = document.getElementById('match-status');
    const nameInput = document.getElementById('name');

    let isPasswordValid = false;
    let doPasswordsMatch = false;

    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            // Reemplaza cualquier número que el usuario escriba de forma instantánea
            nameInput.value = nameInput.value.replace(/[0-9]/g, '');
        });
    }

    function validatePasswordRealTime() {
        if (!passwordRegInput) return;
        const val = passwordRegInput.value;
        
        const hasLength = val.length >= 6;
        const hasLower = /[a-z]/.test(val);
        const hasUpper = /[A-Z]/.test(val);
        const hasNumber = /[0-9]/.test(val);
        const hasSymbol = /[^A-Za-z0-9]/.test(val);

        if (reqLength) {
            reqLength.style.color = hasLength ? 'green' : 'red';
            reqLength.textContent = (hasLength ? '✅' : '❌') + ' Mínimo 6 caracteres';
        }
        if (reqLower) {
            reqLower.style.color = hasLower ? 'green' : 'red';
            reqLower.textContent = (hasLower ? '✅' : '❌') + ' Una letra minúscula';
        }
        if (reqUpper) {
            reqUpper.style.color = hasUpper ? 'green' : 'red';
            reqUpper.textContent = (hasUpper ? '✅' : '❌') + ' Una letra mayúscula';
        }
        if (reqNumber) {
            reqNumber.style.color = hasNumber ? 'green' : 'red';
            reqNumber.textContent = (hasNumber ? '✅' : '❌') + ' Un número';
        }
        if (reqSymbol) {
            reqSymbol.style.color = hasSymbol ? 'green' : 'red';
            reqSymbol.textContent = (hasSymbol ? '✅' : '❌') + ' Un carácter especial/símbolo';
        }

        isPasswordValid = hasLength && hasLower && hasUpper && hasNumber && hasSymbol;
        validateMatchRealTime();

    }

    function validateMatchRealTime() {
        if (!passwordConfirmInput || !passwordRegInput || !matchStatus) return;
        const val = passwordRegInput.value;
        const confirmVal = passwordConfirmInput.value;

        if (confirmVal === '') {
            matchStatus.style.color = 'gray';
            matchStatus.textContent = '';
            doPasswordsMatch = false;
        } else if (val === confirmVal) {
            matchStatus.style.color = 'green';
            matchStatus.textContent = '✅ Las contraseñas coinciden';
            doPasswordsMatch = true;
        } else {
            matchStatus.style.color = 'red';
            matchStatus.textContent = '❌ Las contraseñas no coinciden';
            doPasswordsMatch = false;
        }
    }

    if (passwordRegInput) {
        passwordRegInput.addEventListener('input', validatePasswordRealTime);
    }
    if (passwordConfirmInput) {
        passwordConfirmInput.addEventListener('input', validateMatchRealTime);
    }

    // Botón de registro con validación estricta previa
    const registerBtnElement = document.getElementById('registerBtn');
    if (registerBtnElement) {
        registerBtnElement.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email-reg').value.trim().toLowerCase();
            const password = passwordRegInput ? passwordRegInput.value : '';
            const role = document.getElementById('registerRole').value;
            const confirmPass = passwordConfirmInput ? passwordConfirmInput.value : '';
            
            if (!name || !email || !password || !confirmPass) {
                alert('❌ Por favor, completa todos los campos');
                return;
            }

            if (!isPasswordValid) {
                alert('❌ La contraseña no cumple con todos los requisitos de seguridad obligatorios.');
                return;
            }

            if (!doPasswordsMatch) {
                alert('❌ Las contraseñas no coinciden.');
                return;
            }
            
            const result = registerUser(name, email, password, role);
            
            if (result.success) {
                alert(result.message);
                
                document.getElementById('name').value = '';
                document.getElementById('email-reg').value = '';
                if (passwordRegInput) passwordRegInput.value = '';
                if (passwordConfirmInput) passwordConfirmInput.value = '';
                if (matchStatus) matchStatus.textContent = '';
                
                form.classList.remove('toggle');
                banner.classList.remove('toggle');
                
                document.getElementById('email').value = email;
                document.getElementById('loginRole').value = role;
            } else {
                alert(result.message);
            }
        });
    }

    // Verificar si ya hay una sesión activa al cargar
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    
    if (isLoggedIn === 'true' && userRole) {
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

console.log('Auth UI con roles y validaciones de contraseña cargado correctamente');