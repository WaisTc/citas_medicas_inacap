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
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/usuario', usuarioRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
