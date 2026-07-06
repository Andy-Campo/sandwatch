// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales optimizados
app.use(cors());
app.use(express.json()); // Parsing estricto de JSON

// Ruta de prueba de salud de la API (Health Check)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Servidor SandWatch operando correctamente' });
});

// Mapeo futuro de rutas (Arquitectura MVC)
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/hijos', require('./routes/hijoRoutes'));

// Manejador global de errores para evitar caídas del servidor
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor en SandWatch' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor senior corriendo de forma óptima en el puerto ${PORT}`);
});