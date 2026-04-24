const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const loginAttempts = new Map();

// Registro de usuario
exports.registro = async (req, res) => {
  const { nombre, apellido, email, dni, password, rol } = req.body;
  
  // Validar datos requeridos
  if (!nombre || !email || !password) {
    return res.status(400).json({ 
      error: 'Nombre, email y password son requeridos' 
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  // Validar longitud de password
  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'La contraseña debe tener al menos 6 caracteres' 
    });
  }

  try {
    // Verificar si el usuario ya existe
    const checkSql = 'SELECT id_usuario FROM usuario WHERE email = ? OR dni = ?';
    db.query(checkSql, [email, dni || null], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al verificar usuario' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ 
          error: 'El email o DNI ya está registrado' 
        });
      }

      // Hash de la contraseña
      const hash = await bcrypt.hash(password, 10);
      
      // Insertar usuario
      const sql = `
        INSERT INTO usuario (nombre, apellido, email, dni, password, rol)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.query(sql, [
        nombre, 
        apellido || null, 
        email, 
        dni || null, 
        hash, 
        rol || 'cajero'
      ], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Error al crear usuario' });
        }
        
        // Generar token
        const token = jwt.sign(
          { 
            id: result.insertId, 
            email: email, 
            nombre: nombre,
            rol: rol || 'cajero' 
          },
          jwtConfig.secret,
          { expiresIn: jwtConfig.expiresIn }
        );
        
        res.status(201).json({
          mensaje: 'Usuario registrado exitosamente',
          token,
          usuario: {
            id: result.insertId,
            nombre,
            apellido,
            email,
            rol: rol || 'cajero'
          }
        });
      });
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Login de usuario
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Verificar bloqueo por intentos
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  const now = Date.now();
  
  if (attempts.count >= 3 && (now - attempts.lastAttempt) < 30000) {
    const tiempoRestante = Math.ceil((30000 - (now - attempts.lastAttempt)) / 1000);
    return res.status(429).json({ 
      error: `Demasiados intentos. Espere ${tiempoRestante} segundos` 
    });
  }
  
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email y contraseña son requeridos' 
    });
  }

  // Buscar usuario por email
  const sql = 'SELECT * FROM usuario WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al buscar usuario' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas usuario' });
    }
    
    const usuario = results[0];
    
    try {
      // Verificar contraseña
      const passwordValido = await bcrypt.compare(password, usuario.password);
      
      if (!passwordValido) {
        return res.status(401).json({ error: 'Credenciales inválidas contraseña' });
      }
      
      // Generar token
      const token = jwt.sign(
        { 
          id: usuario.id_usuario, 
          email: usuario.email, 
          nombre: usuario.nombre,
          rol: usuario.rol 
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );
      
      res.json({
        mensaje: 'Login exitoso',
        token,
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          dni: usuario.dni,
          rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  if (resultadoFallido) {
    loginAttempts.set(email, { 
      count: attempts.count + 1, 
      lastAttempt: now 
    });
  } else {
    loginAttempts.delete(email);
  }
};

// Obtener perfil del usuario autenticado
exports.perfil = (req, res) => {
  const usuarioId = req.usuario.id;
  
  const sql = 'SELECT id_usuario, nombre, apellido, email, dni, rol, fecha_creacion FROM usuario WHERE id_usuario = ?';
  
  db.query(sql, [usuarioId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener perfil' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(results[0]);
  });
};