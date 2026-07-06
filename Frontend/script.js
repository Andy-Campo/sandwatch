// Frontend/script.js

// 1. Configuración de la URL del Backend en Render
const API_BASE_URL = 'https://sandwatch-backend.onrender.com/api';

/**
 * Función genérica y optimizada para probar la salud del servidor
 */
async function verificarConexionConBackend() {
    try {
        console.log("⏳ Conectando con el servidor en Render...");
        
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Validar si la respuesta HTTP es exitosa (códigos 200-299)
        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log("%c✅ SandWatch Backend Conectado Exitosamente", "color: #00ff00; font-size: 12px; font-weight: bold;");
        console.log("Datos del servidor:", data);
        
        return true;
    } catch (error) {
        console.error("%c❌ Error Crítico de Conexión:", "color: #ff0000; font-size: 12px; font-weight: bold;");
        console.error("Detalles del fallo:", error.message);
        return false;
    }
}

// Ejecutar la verificación automáticamente cuando cargue la página
document.addEventListener('DOMContentLoaded', verificarConexionConBackend);