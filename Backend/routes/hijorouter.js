// routes/hijoRoutes.js
const express = require('express');
const router = express.Router();
const hijoController = require('../controllers/hijoController');
const validarJWT = require('../middlewares/authMiddleware');

// Ruta protegida: Solo si el token es válido se puede acceder
router.get('/mis-hijos', validarJWT, hijoController.getHijosPorPadre);

module.exports = router;