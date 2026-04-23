const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getEnPlanta, getBrigadistas, generarPdf, finalizarEvacuacion, getHistorial } = require('../controllers/evacuacionController');

// All evacuation routes require authentication
router.use(authMiddleware);

router.get('/en-planta', getEnPlanta);
router.get('/brigadistas', getBrigadistas);
router.get('/pdf', generarPdf);
router.post('/finalizar', finalizarEvacuacion);
router.get('/historial', getHistorial);

module.exports = router;
