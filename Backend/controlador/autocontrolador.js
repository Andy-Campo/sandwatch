// controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // La consulta aprovecha el índice idx_padres_correo de forma óptima
        const result = await db.query('SELECT * FROM padres WHERE correo = $1', [correo]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const padre = result.rows[0];

        // Verificación segura del hash de la contraseña
        const match = await bcrypt.compare(contrasena, padre.contrasena);
        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generación del token de sesión (expira en 24 horas)
        const token = jwt.sign(
            { id_padre: padre.id_padre, correo: padre.correo },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Retornamos datos seguros al frontend (sin la contraseña)
        res.json({
            token,
            padre: { id: padre.id_padre, nombre: padre.nombre, correo: padre.correo }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};