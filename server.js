const express = require('express');
const path = require('path');
const cors = require('cors');
const securityMiddleware = require('./middleware/securityMiddleware');
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');
const usuarioRoutes = require('./routes/usuario');

const app = express();

app.use(securityMiddleware);
app.use(rateLimitMiddleware);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/usuario', usuarioRoutes);

app.listen(3000, () => {
  console.log('Servidor activo en http://localhost:3000');
});
