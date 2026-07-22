// fix.js
document.addEventListener('click', function(e) {
    // Si el elemento clicado es el botón de login
    if (e.target && e.target.id === 'loginBtn') {
        // Detiene la propagación del evento para que el <form> no se entere
        e.preventDefault();
        e.stopPropagation();
        
        console.log("📍 Evento de formulario bloqueado por fix.js");
        
        // Aquí llamamos a la función de login manualmente
        // Asegúrate de que esto llame a tu función de api.js
        window.ejecutarLogin(); 
    }
}, true); // El 'true' es vital: captura el evento antes de que el formulario lo reciba