const db = require('../config/db'); // ✅ Correcto ahora

exports.obtenerProductos = (req, res) => {
  db.query('SELECT * FROM producto', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.crearProducto = (req, res) => {
  const { nombre, descripcion, precio, stock, tipo } = req.body;
  
  // Validar datos requeridos
  if (!nombre || !precio) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }

  const sql = `
    INSERT INTO producto (nombre, descripcion, precio, stock, tipo)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [nombre, descripcion || null, precio, stock || 0, tipo || 'pan'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Producto creado', id: result.insertId });
  });
};

// Obtener producto por ID
exports.obtenerProductoPorId = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM producto WHERE id_producto = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(results[0]);
  });
};

// Actualizar producto
exports.actualizarProducto = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, tipo } = req.body;
  
  const sql = `
    UPDATE producto 
    SET nombre = ?, descripcion = ?, precio = ?, stock = ?, tipo = ?
    WHERE id_producto = ?
  `;
  
  db.query(sql, [nombre, descripcion, precio, stock, tipo, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto actualizado' });
  });
};

// Eliminar producto
exports.eliminarProducto = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM producto WHERE id_producto = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  });
};
