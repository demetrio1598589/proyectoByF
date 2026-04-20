const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuariosController');
const { authMiddleware, verificarRol } = require('../middleware/auth');

// Solo administradores pueden acceder
router.use(authMiddleware);
router.use(verificarRol(['admin']));

router.get('/', controller.obtenerUsuarios);
router.post('/', controller.crearUsuario);

module.exports = router;