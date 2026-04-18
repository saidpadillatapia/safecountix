const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public route — no auth required
router.post('/login', login);

// Protected route — requires valid JWT
router.post('/logout', authMiddleware, logout);

module.exports = router;
