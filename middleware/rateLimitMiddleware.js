const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.'
});

module.exports = limiter;
