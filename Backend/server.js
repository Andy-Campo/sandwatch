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

const { Pool } = require('pg');

// Configuración de la conexión usando la variable de entorno
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requerido para conexiones externas seguras en Render
  }
});

// Endpoint para verificar la Base de Datos
app.get('/api/test-db', async (req, res) => {
    try {
        // Hace una consulta simple de la hora actual en PostgreSQL
        const result = await pool.query('SELECT NOW();');
        res.status(200).json({
            database: 'CONECTADA',
            timestamp: result.rows[0].now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ database: 'ERROR', error: err.message });
    }
});