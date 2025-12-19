const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        // Clear the invalid cookie
        res.clearCookie('token');
        res.status(401).json({ error: 'Token no válido o expirado' });
    }
};

module.exports = verifyToken;
