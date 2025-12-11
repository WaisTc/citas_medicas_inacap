const helmet = require('helmet');

const securityMiddleware = helmet({
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
});

module.exports = securityMiddleware;
