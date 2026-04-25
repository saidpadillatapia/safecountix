const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getConteo, getEnPlanta, getMovimientos, getMovimientosPorHora } = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(authMiddleware);

router.get('/conteo', getConteo);
router.get('/en-planta', getEnPlanta);
router.get('/movimientos', getMovimientos);
router.get('/movimientos-por-hora', getMovimientosPorHora);

module.exports = router;
