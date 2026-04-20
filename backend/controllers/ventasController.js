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