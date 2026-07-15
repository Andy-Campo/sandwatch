// js/api.js
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