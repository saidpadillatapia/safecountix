const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'safecountix_secret_2026';
const JWT_EXPIRES_IN = '24h';

/**
 * POST /api/auth/login
 * Authenticate user with email and password, return JWT token.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email y contraseña son requeridos',
        code: 'VALIDATION_ERROR'
      });
    }

    // Find user by email
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordValid) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT
    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      empresaId: usuario.empresaId
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      token,
      usuario: payload
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal).
 */
async function logout(req, res) {
  return res.json({ message: 'Sesión cerrada' });
}

module.exports = { login, logout };
