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

// Obtener usuario por ID
exports.obtenerUsuarioPorId = (req, res) => {
  const { id } = req.params;
  
  db.query(
    'SELECT id_usuario, nombre, apellido, email, dni, rol, fecha_creacion FROM usuario WHERE id_usuario = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.json(results[0]);
    }
  );
};

// Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, dni, password, rol } = req.body;
  
  if (!nombre || !email) {
    return res.status(400).json({ error: 'Nombre y email son requeridos' });
  }

  try {
    let sql = 'UPDATE usuario SET nombre = ?, apellido = ?, email = ?, dni = ?, rol = ?';
    let params = [nombre, apellido || null, email, dni || null, rol || 'cajero'];
    
    // Si se proporciona password, actualizarlo también
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      sql += ', password = ?';
      params.push(hash);
    }
    
    sql += ' WHERE id_usuario = ?';
    params.push(id);
    
    db.query(sql, params, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'El email o DNI ya está registrado' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.json({ mensaje: 'Usuario actualizado correctamente' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario
exports.eliminarUsuario = (req, res) => {
  const { id } = req.params;
  
  // Verificar que no se intente eliminar a sí mismo (opcional)
  if (req.usuario && req.usuario.id_usuario == id) {
    return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  }
  
  db.query('DELETE FROM usuario WHERE id_usuario = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  });
};