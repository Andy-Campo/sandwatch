// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware para proteger rutas mediante JSON Web Tokens (JWT).
 * Valida la autenticidad del token enviado por el frontend en los headers.
 */
const validarJWT = (req, res, next) => {
    // 1. Extraer el encabezado de autorización
    const authHeader = req.header('Authorization');

    // Verificar si el header existe
    if (!authHeader) {
        return res.status(401).json({ 
            error: 'Acceso denegado. No se proporcionó un token de autenticación.' 
        });
    }

    // 2. Validar el formato estándar de la industria: "Bearer <token>"
    const partesToken = authHeader.split(' ');
    if (partesToken.length !== 2 || partesToken[0] !== 'Bearer') {
        return res.status(400).json({ 
            error: 'Formato de token inválido. Debe seguir el estándar "Bearer <TOKEN>".' 
        });
    }

    const token = partesToken[1];

    try {
        // 3. Verificar y decodificar el token usando la firma secreta del servidor
        const decondificado = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Inyectar la carga útil (payload) en el objeto 'req'
        // Esto permite que controladores posteriores tengan acceso inmediato a: req.user.id_padre o req.user.correo
        req.user = decondificado;

        // 5. Ceder el control al siguiente middleware o controlador de la ruta
        next();
        
    } catch (error) {
        // Capturar errores específicos de la librería JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'El token de sesión ha expirado. Por favor, inicia sesión de nuevo.' });
        }
        
        return res.status(403).json({ error: 'Token inválido o alterado. Autenticación fallida.' });
    }
};

module.exports = validarJWT;