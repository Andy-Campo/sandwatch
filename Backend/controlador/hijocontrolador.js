// controllers/hijoController.js
const db = require('../config/db');

exports.getHijosPorPadre = async (req, res) => {
    // req.user viene cargado desde el middleware de autenticación por JWT
    const id_padre = req.user.id_padre; 

    try {
        // Esta consulta usa de inmediato el índice idx_hijos_padre reduciendo el costo O(N) a O(log N)
        const result = await db.query(
            'SELECT id_hijo, nombre, codigo_acceso, avatar, puntos_acumulados FROM hijos WHERE id_padre = $1',
            [id_padre]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los perfiles de los hijos' });
    }
};