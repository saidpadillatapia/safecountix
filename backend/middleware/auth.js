const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'safecountix_secret_2026';

/**
 * Middleware to verify JWT token from Authorization header.
 * Attaches decoded user data to req.user on success.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: true,
      message: 'Token de autenticación requerido',
      code: 'TOKEN_INVALID'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      error: true,
      message: 'Token inválido',
      code: 'TOKEN_INVALID'
    });
  }
}

module.exports = authMiddleware;
