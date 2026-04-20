const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar conexión a DB
const connection = require('./config/db');

// Importar rutas
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
  res.json({ message: 'API Panadería funcionando correctamente' });
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
app.use('/api/usuarios', usuariosRouter);
app.use('/api/productos', productosRouter);
app.use('/api/ventas', ventasRouter);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${process.env.DB_NAME || 'No configurada'}`);
  console.log(`\n📝 Endpoints disponibles:`);
  console.log(`   GET  /api/usuarios`);
  console.log(`   POST /api/usuarios`);
  console.log(`   GET  /api/productos`);
  console.log(`   POST /api/productos`);
  console.log(`   POST /api/ventas`);
});