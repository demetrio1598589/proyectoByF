const express = require('express');
const router = express.Router();
const controller = require('../controllers/productosController');

router.get('/', controller.obtenerProductos);
router.get('/:id', controller.obtenerProductoPorId);
router.post('/', controller.crearProducto);
router.put('/:id', controller.actualizarProducto);
router.delete('/:id', controller.eliminarProducto);

module.exports = router;