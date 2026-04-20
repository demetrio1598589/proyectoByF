const express = require('express');
const cors = require('cors');
require('dotenv').config(); // ✅ CORREGIDO

// Importar conexión a DB
const connection = require('./config/db');

// Importar rutas
const authRoutes = require('./routes/auth');
const usuariosRouter = require('./routes/usuarios');
const productosRouter = require('./routes/productos');
const ventasRouter = require('./routes/ventas');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Panadería funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      productos: '/api/productos',
      ventas: '/api/ventas'
    }
  });
});

// Ruta para verificar conexión a DB
app.get('/health', (req, res) => {
  connection.ping((err) => {
    if (err) {
      return res.status(500).json({ 
        status: 'Error', 
        message: 'Error de conexión a DB',
        error: err.message 
      });
    }
    res.json({ 
      status: 'OK', 
      message: 'Conectado a MySQL',
      database: process.env.DB_NAME 
    });
  });
});

// ========== RUTAS DE LA API ==========
app.use('/api/auth', authRoutes);      // ✅ Faltaba el punto y coma
app.use('/api/usuarios', usuariosRouter);
app.use('/api/productos', productosRouter);
app.use('/api/ventas', ventasRouter);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo global de errores (opcional pero recomendado)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${process.env.DB_NAME || 'No configurada'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`\n📝 Endpoints disponibles:`);
  console.log(`   POST /api/auth/registro`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/perfil (protegido)`);
  console.log(`   GET  /api/usuarios (admin only)`);
  console.log(`   POST /api/usuarios (admin only)`);
  console.log(`   GET  /api/productos (protegido)`);
  console.log(`   POST /api/productos (protegido)`);
  console.log(`   PUT  /api/productos/:id (protegido)`);
  console.log(`   DELETE /api/productos/:id (protegido)`);
  console.log(`   POST /api/ventas (protegido)`);
});