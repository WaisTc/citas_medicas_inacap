const express = require('express');
const path = require('path');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuario');


const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para procesar el registro
app.use('/api/usuario', usuarioRoutes);


app.listen(3000, () => {
  console.log('Servidor activo en http://localhost:3000');
});
