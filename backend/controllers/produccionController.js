const db = require('../config/db');

// Crear registro de producción (solo panadero)
exports.crearProduccion = (req, res) => {
  const { producto_id, cantidad_producida, fecha, observaciones } = req.body;
  const usuario_id = req.usuario.id;
  const usuario_rol = req.usuario.rol;
  
  // Validar que sea panadero
  if (usuario_rol !== 'panadero' && usuario_rol !== 'admin') {
    return res.status(403).json({ 
      error: 'Solo los panaderos pueden registrar producción' 
    });
  }
  
  // Validar datos requeridos
  if (!producto_id || !cantidad_producida || !fecha) {
    return res.status(400).json({ 
      error: 'Producto, cantidad y fecha son requeridos' 
    });
  }

  // Validar que la cantidad sea positiva
  if (cantidad_producida <= 0) {
    return res.status(400).json({ 
      error: 'La cantidad debe ser mayor a 0' 
    });
  }

  // Verificar que el producto existe
  db.query('SELECT id_producto, nombre FROM producto WHERE id_producto = ?', 
    [producto_id], 
    (err, productos) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (productos.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Insertar producción
      const sql = `
        INSERT INTO produccion (producto_id, cantidad_producida, fecha, usuario_id, observaciones)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.query(sql, [
        producto_id, 
        cantidad_producida, 
        fecha, 
        usuario_id,
        observaciones || null
      ], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Actualizar stock del producto
        db.query(
          'UPDATE producto SET stock = stock + ? WHERE id_producto = ?',
          [cantidad_producida, producto_id],
          (errUpdate) => {
            if (errUpdate) {
              console.error('Error actualizando stock:', errUpdate);
              // Aún así confirmamos la producción
            }
            
            res.status(201).json({
              mensaje: 'Producción registrada exitosamente',
              produccion: {
                id: result.insertId,
                producto_id,
                nombre_producto: productos[0].nombre,
                cantidad_producida,
                fecha,
                usuario_id,
                observaciones
              }
            });
          }
        );
      });
    }
  );
};

// Obtener producción del usuario autenticado (panadero ve sus propias producciones)
exports.obtenerMisProducciones = (req, res) => {
  const usuario_id = req.usuario.id;
  
  const sql = `
    SELECT 
      p.id_produccion,
      p.producto_id,
      pr.nombre as nombre_producto,
      pr.tipo as tipo_producto,
      p.cantidad_producida,
      p.fecha,
      p.observaciones,
      p.fecha_registro
    FROM produccion p
    INNER JOIN producto pr ON p.producto_id = pr.id_producto
    WHERE p.usuario_id = ?
    ORDER BY p.fecha DESC, p.fecha_registro DESC
  `;
  
  db.query(sql, [usuario_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Estadísticas de producción
    const estadisticas = {
      total_producciones: results.length,
      total_productos_producidos: results.reduce((sum, p) => sum + p.cantidad_producida, 0),
      producciones: results
    };
    
    res.json(estadisticas);
  });
};

// Obtener toda la producción (admin)
exports.obtenerTodaProduccion = (req, res) => {
  const { fecha_inicio, fecha_fin, producto_id } = req.query;
  
  let sql = `
    SELECT 
      p.id_produccion,
      p.producto_id,
      pr.nombre as nombre_producto,
      pr.tipo as tipo_producto,
      p.cantidad_producida,
      p.fecha,
      p.observaciones,
      p.fecha_registro,
      u.nombre as nombre_panadero,
      u.apellido as apellido_panadero,
      p.usuario_id
    FROM produccion p
    INNER JOIN producto pr ON p.producto_id = pr.id_producto
    INNER JOIN usuario u ON p.usuario_id = u.id_usuario
    WHERE 1=1
  `;
  
  const params = [];
  
  // Filtros opcionales
  if (fecha_inicio) {
    sql += ' AND p.fecha >= ?';
    params.push(fecha_inicio);
  }
  
  if (fecha_fin) {
    sql += ' AND p.fecha <= ?';
    params.push(fecha_fin);
  }
  
  if (producto_id) {
    sql += ' AND p.producto_id = ?';
    params.push(producto_id);
  }
  
  sql += ' ORDER BY p.fecha DESC, p.fecha_registro DESC';
  
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Agrupar por fecha
    const produccionPorFecha = results.reduce((acc, prod) => {
      const fecha = prod.fecha;
      if (!acc[fecha]) {
        acc[fecha] = {
          fecha,
          producciones: [],
          total_dia: 0
        };
      }
      acc[fecha].producciones.push(prod);
      acc[fecha].total_dia += prod.cantidad_producida;
      return acc;
    }, {});
    
    res.json({
      total_producciones: results.length,
      produccion_por_fecha: Object.values(produccionPorFecha),
      producciones: results
    });
  });
};

// Obtener producción por ID
exports.obtenerProduccionPorId = (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT 
      p.*,
      pr.nombre as nombre_producto,
      pr.tipo as tipo_producto,
      u.nombre as nombre_panadero,
      u.apellido as apellido_panadero
    FROM produccion p
    INNER JOIN producto pr ON p.producto_id = pr.id_producto
    INNER JOIN usuario u ON p.usuario_id = u.id_usuario
    WHERE p.id_produccion = ?
  `;
  
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Producción no encontrada' });
    }
    
    res.json(results[0]);
  });
};

// Actualizar producción
exports.actualizarProduccion = (req, res) => {
  const { id } = req.params;
  const { cantidad_producida, fecha, observaciones } = req.body;
  const usuario_rol = req.usuario.rol;
  
  // Solo admin puede actualizar producciones
  if (usuario_rol !== 'admin') {
    return res.status(403).json({ 
      error: 'Solo administradores pueden modificar producciones' 
    });
  }
  
  if (!cantidad_producida || !fecha) {
    return res.status(400).json({ 
      error: 'Cantidad y fecha son requeridos' 
    });
  }
  
  // Obtener la producción actual para calcular diferencia de stock
  db.query('SELECT * FROM produccion WHERE id_produccion = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Producción no encontrada' });
    }
    
    const produccionAnterior = results[0];
    const diferenciaCantidad = cantidad_producida - produccionAnterior.cantidad_producida;
    
    const sql = `
      UPDATE produccion 
      SET cantidad_producida = ?, fecha = ?, observaciones = ?
      WHERE id_produccion = ?
    `;
    
    db.query(sql, [cantidad_producida, fecha, observaciones || null, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Actualizar stock según la diferencia
      if (diferenciaCantidad !== 0) {
        db.query(
          'UPDATE producto SET stock = stock + ? WHERE id_producto = ?',
          [diferenciaCantidad, produccionAnterior.producto_id]
        );
      }
      
      res.json({ 
        mensaje: 'Producción actualizada correctamente',
        diferencia_stock: diferenciaCantidad
      });
    });
  });
};

// Eliminar producción
exports.eliminarProduccion = (req, res) => {
  const { id } = req.params;
  const usuario_rol = req.usuario.rol;
  
  // Solo admin puede eliminar producciones
  if (usuario_rol !== 'admin') {
    return res.status(403).json({ 
      error: 'Solo administradores pueden eliminar producciones' 
    });
  }
  
  // Obtener la producción antes de eliminar
  db.query('SELECT * FROM produccion WHERE id_produccion = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Producción no encontrada' });
    }
    
    const produccion = results[0];
    
    db.query('DELETE FROM produccion WHERE id_produccion = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Revertir el stock
      db.query(
        'UPDATE producto SET stock = stock - ? WHERE id_producto = ?',
        [produccion.cantidad_producida, produccion.producto_id],
        (errUpdate) => {
          if (errUpdate) {
            console.error('Error revirtiendo stock:', errUpdate);
          }
        }
      );
      
      res.json({ 
        mensaje: 'Producción eliminada correctamente',
        stock_revertido: produccion.cantidad_producida
      });
    });
  });
};

// Obtener estadísticas de producción
exports.obtenerEstadisticasProduccion = (req, res) => {
  const sql = `
    SELECT 
      pr.nombre as producto,
      pr.tipo,
      SUM(p.cantidad_producida) as total_producido,
      COUNT(p.id_produccion) as total_registros,
      AVG(p.cantidad_producida) as promedio_diario,
      MAX(p.cantidad_producida) as maxima_produccion,
      MIN(p.cantidad_producida) as minima_produccion
    FROM produccion p
    INNER JOIN producto pr ON p.producto_id = pr.id_producto
    GROUP BY p.producto_id
    ORDER BY total_producido DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const totalGeneral = results.reduce((sum, p) => sum + p.total_producido, 0);
    
    res.json({
      total_general: totalGeneral,
      por_producto: results
    });
  });
};