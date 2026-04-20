const express = require('express');
const router = express.Router();
const controller = require('../controllers/ventasController');

router.post('/', controller.crearVenta);

module.exports = router;