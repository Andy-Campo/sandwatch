// api.js - Maneja solo la comunicación con el servidor

const API_BASE_URL = 'https://sandwatch-backend.onrender.com/api';

/**
 * Función para autenticar al usuario
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<boolean>}
 */
export async function loginUser(email, password) {
    try {
        console.log("⏳ Intentando conectar con el servidor...");

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Verificamos si la respuesta es exitosa
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Login exitoso:", data);
            return true;
        } else {
            console.error("❌ Error en el login:", response.statusText);
            return false;
        }
    } catch (error) {
        console.error("❌ Error de red al conectar con el servidor:", error);
        return false;
    }
}