const express = require('express');
const router = express.Router();
const controller = require('../controllers/ventasController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.post('/', controller.crearVenta);

module.exports = router;