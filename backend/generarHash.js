const bcrypt = require('bcryptjs');

async function generarHash() {
  const password = '123456';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('✅ Hash generado para "' + password + '":');
  console.log(hash);
  
  // Verificar que funciona
  const coincide = await bcrypt.compare(password, hash);
  console.log('¿Verificación correcta?:', coincide);
}

generarHash();