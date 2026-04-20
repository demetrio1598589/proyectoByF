const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.obtenerUsuarios = (req, res) => {
  // No devolver el password por seguridad
  db.query('SELECT id_usuario, nombre, apellido, email, dni, rol, fecha_creacion FROM usuario', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.crearUsuario = async (req, res) => {
  const { nombre, apellido, email, dni, password, rol } = req.body;
  
  // Validar datos requeridos
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y password son requeridos' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO usuario (nombre, apellido, email, dni, password, rol)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.query(sql, [nombre, apellido || null, email, dni || null, hash, rol || 'cajero'], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'El email o DNI ya está registrado' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ mensaje: 'Usuario creado', id: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};