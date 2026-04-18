const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { crearRegistro } = require('../controllers/registrosController');

// Rate limiting: 10 requests per second per IP for RFID readers
const registroLimiter = rateLimit({
  windowMs: 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Demasiadas solicitudes al endpoint de registro',
    code: 'RATE_LIMITED'
  }
});

// POST /api/registro — public endpoint for RFID readers (no auth required)
router.post('/', registroLimiter, crearRegistro);

module.exports = router;
