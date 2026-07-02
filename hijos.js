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

// ===== VERIFICAR SESIÓN =====
/*
if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
}
*/

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

// ===== CARGAR HIJOS DESDE LOCALSTORAGE =====
function loadChildren() {
    const savedChildren = localStorage.getItem('children');
    if (savedChildren) {
        children = JSON.parse(savedChildren);
    } else {
        // Si no hay hijos guardados, agregar los de ejemplo
        children = [
            {
                id: Date.now() + 1,
                name: 'Carlos Pérez',
                age: 10,
                school: 'Colegio San José',
                grade: '5° Primaria',
                avatar: '👦',
                registeredDate: new Date().toLocaleDateString('es-ES')
            },
            {
                id: Date.now() + 2,
                name: 'Martha Gómez',
                age: 12,
                school: 'Colegio San José',
                grade: '1° Secundaria',
                avatar: '👧',
                registeredDate: new Date().toLocaleDateString('es-ES')
            }
        ];
        localStorage.setItem('children', JSON.stringify(children));
    }
    renderChildren();
}

// ===== MOSTRAR/OCULTAR FORMULARIO =====
openChildFormBtn.addEventListener('click', function() {
    childFormContainer.classList.toggle('active');
    if (childFormContainer.classList.contains('active')) {
        this.textContent = '✕ Cerrar formulario';
    } else {
        this.textContent = '+ Registrar nuevo hijo';
        childForm.reset();
    }
});

cancelChildFormBtn.addEventListener('click', function() {
    childFormContainer.classList.remove('active');
    openChildFormBtn.textContent = '+ Registrar nuevo hijo';
    childForm.reset();
});

// ===== REGISTRAR NUEVO HIJO =====
childForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtener valores del formulario
    const name = document.getElementById('childName').value.trim();
    const age = parseInt(document.getElementById('childAge').value);
    const school = document.getElementById('childSchool').value.trim();
    const grade = document.getElementById('childGrade').value;
    const avatar = document.getElementById('childAvatar').value;
    
    // Validar que los campos obligatorios estén llenos
    if (!name || !age) {
        showNotification('⚠️ Por favor, completa todos los campos obligatorios');
        return;
    }
    
    // Verificar si el hijo ya existe
    if (children.some(child => child.name.toLowerCase() === name.toLowerCase())) {
        showNotification('⚠️ Ya existe un hijo con ese nombre');
        return;
    }
    
    // Crear objeto de hijo
    const newChild = {
        id: Date.now(),
        name: name,
        age: age,
        school: school || 'No especificado',
        grade: grade || 'No especificado',
        avatar: avatar || '👦',
        registeredDate: new Date().toLocaleDateString('es-ES')
    };
    
    // Agregar al array
    children.push(newChild);
    
    // Guardar en localStorage
    localStorage.setItem('children', JSON.stringify(children));
    
    // Mostrar notificación
    showNotification(`✅ ${name} ha sido registrado correctamente`);
    
    // Limpiar formulario y cerrar
    childForm.reset();
    childFormContainer.classList.remove('active');
    openChildFormBtn.textContent = '+ Registrar nuevo hijo';
    
    // Actualizar la lista
    renderChildren();
});

// ===== ELIMINAR HIJO =====
function deleteChild(childId) {
    const child = children.find(c => c.id === childId);
    if (!child) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar a ${child.name}?`)) {
        children = children.filter(c => c.id !== childId);
        localStorage.setItem('children', JSON.stringify(children));
        renderChildren();
        showNotification(`🗑️ ${child.name} ha sido eliminado`);
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
                    <span><span class="label">Edad:</span> ${child.age} años</span>
                    <span><span class="label">Colegio:</span> ${child.school}</span>
                    <span><span class="label">Grado:</span> ${child.grade}</span>
                    <span style="font-size: 0.75rem; color: #999; margin-top: 0.5rem;">
                        Registrado: ${child.registeredDate}
                    </span>
                </div>
                <div class="card-actions">
                    <button class="btn-tasks" onclick="viewChildTasks('${child.name}')">📋 Tareas</button>
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
function viewChildTasks(childName) {
    // Redirigir al dashboard con el filtro del hijo
    localStorage.setItem('filterChild', childName);
    window.location.href = 'dashboard.html';
}

// ===== EDITAR HIJO =====
function editChild(childId) {
    const child = children.find(c => c.id === childId);
    if (!child) return;
    
    // Llenar el formulario con los datos del hijo
    document.getElementById('childName').value = child.name;
    document.getElementById('childAge').value = child.age;
    document.getElementById('childSchool').value = child.school;
    document.getElementById('childGrade').value = child.grade;
    document.getElementById('childAvatar').value = child.avatar;
    
    // Abrir el formulario
    childFormContainer.classList.add('active');
    openChildFormBtn.textContent = '✕ Cerrar formulario';
    
    // Cambiar el texto del botón de submit
    const submitBtn = childForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Actualizar hijo';
    
    // Eliminar el hijo actual para actualizarlo
    children = children.filter(c => c.id !== childId);
    
    // Guardar el ID para actualizar
    childForm.dataset.editId = childId;
    
    // Mostrar notificación
    showNotification(`✏️ Editando a ${child.name}`);
}

// ===== SOBRESCRIBIR EL SUBMIT PARA EDITAR =====
// Modificamos el event listener del formulario para manejar edición
const originalSubmit = childForm.addEventListener;
childForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editId = this.dataset.editId;
    
    if (editId) {
        // Estamos editando
        const name = document.getElementById('childName').value.trim();
        const age = parseInt(document.getElementById('childAge').value);
        const school = document.getElementById('childSchool').value.trim();
        const grade = document.getElementById('childGrade').value;
        const avatar = document.getElementById('childAvatar').value;
        
        if (!name || !age) {
            showNotification('⚠️ Por favor, completa todos los campos obligatorios');
            return;
        }
        
        const updatedChild = {
            id: parseInt(editId),
            name: name,
            age: age,
            school: school || 'No especificado',
            grade: grade || 'No especificado',
            avatar: avatar || '👦',
            registeredDate: new Date().toLocaleDateString('es-ES')
        };
        
        children.push(updatedChild);
        localStorage.setItem('children', JSON.stringify(children));
        
        showNotification(`✅ ${name} ha sido actualizado correctamente`);
        
        // Limpiar
        delete this.dataset.editId;
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Registrar hijo';
        childForm.reset();
        childFormContainer.classList.remove('active');
        openChildFormBtn.textContent = '+ Registrar nuevo hijo';
        renderChildren();
    } else {
        // Es un registro nuevo (el código anterior)
        const name = document.getElementById('childName').value.trim();
        const age = parseInt(document.getElementById('childAge').value);
        const school = document.getElementById('childSchool').value.trim();
        const grade = document.getElementById('childGrade').value;
        const avatar = document.getElementById('childAvatar').value;
        
        if (!name || !age) {
            showNotification('⚠️ Por favor, completa todos los campos obligatorios');
            return;
        }
        
        if (children.some(child => child.name.toLowerCase() === name.toLowerCase())) {
            showNotification('⚠️ Ya existe un hijo con ese nombre');
            return;
        }
        
        const newChild = {
            id: Date.now(),
            name: name,
            age: age,
            school: school || 'No especificado',
            grade: grade || 'No especificado',
            avatar: avatar || '👦',
            registeredDate: new Date().toLocaleDateString('es-ES')
        };
        
        children.push(newChild);
        localStorage.setItem('children', JSON.stringify(children));
        showNotification(`✅ ${name} ha sido registrado correctamente`);
        childForm.reset();
        childFormContainer.classList.remove('active');
        openChildFormBtn.textContent = '+ Registrar nuevo hijo';
        renderChildren();
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
loadChildren();

console.log('Página de hijos cargada correctamente');
console.log('Hijos:', children);