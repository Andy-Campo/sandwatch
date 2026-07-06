// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Se usa un Pool para gestionar eficientemente múltiples conexiones concurrentes
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requerido para conexiones seguras en Render
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};