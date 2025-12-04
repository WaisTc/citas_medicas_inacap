const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const usuarioRoutes = require('./routes/usuario');


const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://kit.fontawesome.com", "https://maps.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://ka-f.fontawesome.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://maps.gstatic.com", "https://maps.googleapis.com"],
      connectSrc: ["'self'", "https://ka-f.fontawesome.com", "https://maps.googleapis.com"],
    },
  },
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.'
});
app.use(limiter);

app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/usuario', usuarioRoutes);


app.listen(3000, () => {
  console.log('Servidor activo en http://localhost:3000');
});
