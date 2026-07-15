// Importamos la función de login desde el archivo donde tienes el fetch
import { loginUser } from './api.js'; 

const signIn = document.getElementById('sign-in');
const signUp = document.getElementById('sign-up');
const form = document.getElementById('form');
const banner = document.getElementById('banner');
const loginButton = document.querySelector('.login button');

// --- LÓGICA DE INTERFAZ (NO TOCAR) ---
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

// --- LÓGICA DE LOGIN (MODIFICADA PARA RENDER) ---
loginButton.addEventListener('click', async (e) => {
    e.preventDefault(); 
    
    // Obtenemos los valores de los inputs del login
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log("📍 Conectando con Render...");

    // Llamamos a la función importada que apunta a Render
    const esExitoso = await loginUser(email, password);
    
    if (esExitoso) {
        console.log("✅ Acceso concedido por Render.");
        window.location.href = 'dashboard.html';
    } else {
        console.error("❌ Credenciales incorrectas.");
        alert("Usuario o contraseña incorrectos.");
    }
});