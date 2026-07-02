const signIn = document.getElementById('sign-in');
const signUp = document.getElementById('sign-up');
const form = document.getElementById('form');
const banner = document.getElementById('banner');
const loginButton = document.querySelector('.login button');

signIn.addEventListener('click', (e) => {
    e.preventDefault();
    form.classList.remove('toggle');
    banner.classList.remove('toggle')
});

signUp.addEventListener('click', (e) => {
    e.preventDefault();
    form.classList.add('toggle');
    banner.classList.add('toggle');
});

loginButton.addEventListener('click', (e) => {
    e.preventDefault(); // Evita que el formulario se envíe
    window.location.href = 'dashboard.html'; // Redirige al dashboard
});