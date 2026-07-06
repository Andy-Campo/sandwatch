// frontend/script.js o dashboard.js
const API_URL = 'http://localhost:5000/api';
// Asegúrate de usar la URL de tu Web Service de Render con el prefijo /api
const BACKEND_URL = 'https://sandwatch-backend.onrender.com/api';

// Ejemplo de petición Fetch para registrar o validar
async function obtenerHijos() {
    try {
        const response = await fetch(`${API_URL}/health`); // Reemplaza /health por tus rutas reales
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error conectando al backend:", error);
    }
}