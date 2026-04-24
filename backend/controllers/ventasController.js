const db = require('../config/db');

exports.crearVenta = (req, res) => {
  const { usuario_id, productos } = req.body;
  
  // Validaciones
  if (!usuario_id || !productos || !productos.length) {
    return res.status(400).json({ error: 'Usuario y productos son requeridos' });
  }

  let total = 0;
  productos.forEach(p => {
    total += p.cantidad * p.precio_unitario;
  });

  // 1. Insertar venta
  db.query(
    'INSERT INTO venta (usuario_id, total) VALUES (?, ?)',
    [usuario_id, total],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      const ventaId = result.insertId;

      // 2. Insertar detalles
      const detalles = productos.map(p => [
        ventaId,
        p.producto_id,
        p.cantidad,
        p.precio_unitario,
        p.cantidad * p.precio_unitario
      ]);

      const sql = `
        INSERT INTO detalle_venta 
        (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES ?
      `;

      db.query(sql, [detalles], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        
        // Actualizar stock
        const updateStock = productos.map(p => {
          return new Promise((resolve, reject) => {
            db.query('UPDATE producto SET stock = stock - ? WHERE id_producto = ?', 
              [p.cantidad, p.producto_id], 
              (err) => {
                if (err) reject(err);
                resolve();
              });
          });
        });
        
        Promise.all(updateStock)
          .then(() => {
            res.json({ mensaje: 'Venta registrada', ventaId, total });
          })
          .catch(err => {
            console.error('Error actualizando stock:', err);
            // No falla la venta, solo log del error
            res.json({ mensaje: 'Venta registrada pero error en stock', ventaId, total });
          });
      });
    }
  );
};

// Agregar funciones faltantes
exports.obtenerVentas = (req, res) => {
  const sql = `
    SELECT v.*, u.nombre as usuario_nombre 
    FROM venta v
    JOIN usuario u ON v.usuario_id = u.id_usuario
    ORDER BY v.fecha DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.obtenerVentasUsuario = (req, res) => {
  const usuario_id = req.usuario.id;
  
  const sql = `
    SELECT * FROM venta 
    WHERE usuario_id = ?
    ORDER BY fecha DESC
  `;
  
  db.query(sql, [usuario_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.obtenerVentaPorId = (req, res) => {
  const { id } = req.params;
  
  // Obtener venta principal
  const sqlVenta = 'SELECT v.*, u.nombre FROM venta v JOIN usuario u ON v.usuario_id = u.id_usuario WHERE v.id_venta = ?';
  
  db.query(sqlVenta, [id], (err, ventaResult) => {
    if (err) return res.status(500).json({ error: err.message });
    if (ventaResult.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
    
    // Obtener detalles
    const sqlDetalles = `
      SELECT dv.*, p.nombre as producto_nombre 
      FROM detalle_venta dv
      JOIN producto p ON dv.producto_id = p.id_producto
      WHERE dv.venta_id = ?
    `;
    
    db.query(sqlDetalles, [id], (err, detallesResult) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({
        venta: ventaResult[0],
        detalles: detallesResult
      });
    });
  });
};