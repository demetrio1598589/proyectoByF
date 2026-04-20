const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuariosController');

router.get('/', controller.obtenerUsuarios);
router.post('/', controller.crearUsuario);

module.exports = router;