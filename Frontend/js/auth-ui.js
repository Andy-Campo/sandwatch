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

// --- LÓGICA DE LOGIN ---
document.querySelector('.login button').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/sandwatch/Backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password })
    });

    const result = await response.json();
    if (result.status === 'success') {
        window.location.href = 'dashboard.html';
    } else {
        alert("❌ " + result.message);
    }
});

// --- LÓGICA DE REGISTRO ---
document.querySelector('.register button').addEventListener('click', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('name').value;
    const email = document.getElementById('email-reg').value;
    const password = document.getElementById('password-reg').value;

    const response = await fetch('/sandwatch/Backend/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo: email, contrasena: password })
    });

    const result = await response.json();
    if (result.status === 'success') {
        alert("✅ " + result.message);
    } else {
        alert("❌ " + result.message);
    }
});