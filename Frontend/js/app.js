// app.js - El punto de entrada de tu aplicación
import { loginUser } from './api.js';

// Cuando el documento esté listo, inicializamos todo
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema SandWatch inicializado");

    // Aquí llamarías a los eventos de UI que definiste en auth-ui.js
    // Si auth-ui.js necesita saber si el login fue exitoso, 
    // puedes usar esta estructura:
    
    const loginButton = document.querySelector('.login button');
    
    loginButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const email = document.querySelector('input[type="email"]').value;
        const password = document.querySelector('input[type="password"]').value;

        // Llamamos a la lógica de red (que estará en api.js)
        const success = await loginUser(email, password);
        
        if (success) {
            window.location.href = 'dashboard.html';
        } else {
            alert("Credenciales incorrectas");
        }
    });
});