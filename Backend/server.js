// Backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Asegúrate de tener esta línea

const app = express();

// Middlewares globales
app.use(cors()); // <-- ESTO PERMITE QUE TU FRONTEND SE CONECTE SIN BLOQUEOS
app.use(express.json()); 

// Tus rutas...
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Servidor SandWatch operando correctamente' });
});