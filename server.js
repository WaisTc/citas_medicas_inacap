require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const securityMiddleware = require('./middleware/securityMiddleware');
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');
const usuarioRoutes = require('./routes/usuario');

const app = express();

app.use(securityMiddleware);
app.use(rateLimitMiddleware);

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/usuario', usuarioRoutes);

// Global Error Handler for Express 5
app.use((err, req, res, next) => {
  console.error('--- ERROR GLOBAL ---');
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor.' });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Requerido para despliegues en AWS para permitir tráfico externo

app.listen(PORT, HOST, async () => {
  console.log(`\n================================`);
  console.log(`Servidor activo en: http://${HOST}:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);

  // Test DB connection
  try {
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    console.log('Base de Datos: CONECTADA ✅');
  } catch (err) {
    console.error('Base de Datos: ERROR DE CONEXIÓN ❌');
    console.error(err.message);
  }

  console.log(`================================\n`);
});
