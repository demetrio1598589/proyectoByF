const express = require('express');
const router = express.Router();
const controller = require('../controllers/productosController');
const { authMiddleware } = require('../middleware/auth');

// Rutas públicas (sin autenticación)
router.get('/', controller.obtenerProductos);
router.get('/:id', controller.obtenerProductoPorId);

// Rutas protegidas
router.post('/', authMiddleware, controller.crearProducto);
router.put('/:id', authMiddleware, controller.actualizarProducto);
router.delete('/:id', authMiddleware, controller.eliminarProducto);

module.exports = router;