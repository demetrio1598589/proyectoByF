require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'mi-secreto-super-seguro-cambiame-en-produccion',
  expiresIn: process.env.JWT_EXPIRES_IN || '8h'
};