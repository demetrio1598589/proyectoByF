const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Rutas públicas
router.post('/registro', authController.registro);
router.post('/login', authController.login);

// Rutas protegidas
router.get('/perfil', authMiddleware, authController.perfil);

module.exports = router;