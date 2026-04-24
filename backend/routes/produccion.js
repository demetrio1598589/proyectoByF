const express = require('express');
const router = express.Router();
const produccionController = require('../controllers/produccionController');
const { authMiddleware, verificarRol } = require('../middleware/auth');

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

// ==========================================
// Rutas para Panaderos
// ==========================================

// Ver mis producciones (panadero autenticado)
router.get('/mis-producciones', 
  verificarRol(['panadero', 'admin']), 
  produccionController.obtenerMisProducciones
);

// Crear nueva producción
router.post('/', 
  verificarRol(['panadero', 'admin']), 
  produccionController.crearProduccion
);

// ==========================================
// Rutas para Administradores
// ==========================================

// Ver estadísticas de producción
router.get('/estadisticas', 
  verificarRol(['admin']), 
  produccionController.obtenerEstadisticasProduccion
);

// Ver toda la producción (con filtros opcionales)
router.get('/', 
  verificarRol(['admin']), 
  produccionController.obtenerTodaProduccion
);

// Ver producción específica
router.get('/:id', 
  verificarRol(['admin', 'panadero']), 
  produccionController.obtenerProduccionPorId
);

// Actualizar producción
router.put('/:id', 
  verificarRol(['admin']), 
  produccionController.actualizarProduccion
);

// Eliminar producción
router.delete('/:id', 
  verificarRol(['admin']), 
  produccionController.eliminarProduccion
);

module.exports = router;