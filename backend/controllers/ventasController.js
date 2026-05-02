const db = require('../config/db');

exports.crearVenta = (req, res) => {
  // El usuario_id viene del token (req.usuario.id)
  const usuario_id = req.usuario.id;
  // Soportar tanto 'productos' como 'items' (que envía el frontend)
  const productos = req.body.productos || req.body.items;
  
  // Validaciones
  if (!usuario_id) {
    return res.status(401).json({ error: 'Usuario no identificado' });
  }

  if (!productos || !productos.length) {
    return res.status(400).json({ error: 'Debe incluir al menos un producto en la venta' });
  }

  let total = 0;
  try {
    productos.forEach(p => {
      total += p.cantidad * p.precio_unitario;
    });
  } catch (e) {
    return res.status(400).json({ error: 'Estructura de productos inválida' });
  }

  // 1. Insertar venta
  db.query(
    'INSERT INTO venta (usuario_id, total) VALUES (?, ?)',
    [usuario_id, total],
    (err, result) => {
      if (err) {
        console.error('Error insertando venta:', err);
        return res.status(500).json({ error: 'Error al registrar la venta en la base de datos' });
      }

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
        if (err2) {
          console.error('Error insertando detalles:', err2);
          return res.status(500).json({ error: 'Error al registrar el detalle de la venta' });
        }
        
        // 3. Actualizar stock
        const updateStockPromises = productos.map(p => {
          return new Promise((resolve, reject) => {
            db.query('UPDATE producto SET stock = stock - ? WHERE id_producto = ?', 
              [p.cantidad, p.producto_id], 
              (err) => {
                if (err) reject(err);
                else resolve();
              });
          });
        });
        
        Promise.all(updateStockPromises)
          .then(() => {
            res.status(201).json({ 
              mensaje: 'Venta registrada con éxito', 
              ventaId, 
              total: parseFloat(total.toFixed(2)) 
            });
          })
          .catch(err => {
            console.error('Error actualizando stock:', err);
            // La venta ya se registró, devolvemos éxito pero con aviso
            res.status(201).json({ 
              mensaje: 'Venta registrada pero hubo un problema actualizando el inventario', 
              ventaId, 
              total: parseFloat(total.toFixed(2)) 
            });
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