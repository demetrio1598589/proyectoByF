const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const authMiddleware = (req, res, next) => {
  // Obtener token del header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso denegado. Token no proporcionado' 
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.usuario = decoded; // Guardar info del usuario en la request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar roles
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para acceder a este recurso' 
      });
    }
    
    next();
  };
};

module.exports = { authMiddleware, verificarRol };