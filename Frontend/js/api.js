/*// js/api.js
export async function loginUser(email, password) {
    try {
        // Esta es la URL que debe coincidir con tu servicio en Render
        const res = await fetch('https://sandwatch-backend.onrender.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: email, contrasena: password })
        });
        
        // Retorna true si el servidor responde con 200 OK
        return res.status === 200;
    } catch (err) {
        console.error("Error de conexión con Render:", err);
        return false;
    }
}

// En js/api.js
export async function registerUser(nombre, email, password) {
    try {
        const res = await fetch('https://sandwatch-backend.onrender.com/api/register', { // ¡Cuidado con el endpoint!
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre, correo: email, contrasena: password })
        });
        return res.status === 201; // El registro suele devolver 201 Created
    } catch (err) {
        console.error("Error al registrar:", err);
        return false;
    }
}*/

// js/api.js
const API_URL = 'http://localhost/backend'; // O la carpeta donde tengas tus archivos PHP

export async function loginUser(email, password) {
    const res = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password })
    });
    return res.status === 200;
}

export async function registerUser(nombre, email, password) {
    const res = await fetch(`${API_URL}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre, correo: email, contrasena: password })
    });
    return res.status === 200 || res.status === 201;
}