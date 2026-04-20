const express = require('express');
const app = express();

app.use(express.json());

// rutas
app.use('/usuarios', require('./routes/usuarios'));
app.use('/productos', require('./routes/productos'));
app.use('/ventas', require('./routes/ventas'));

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));