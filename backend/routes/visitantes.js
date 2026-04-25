const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getVisitantes, registrarVisitante, registrarSalida } = require('../controllers/visitantesController');

router.use(authMiddleware);
router.get('/', getVisitantes);
router.post('/', registrarVisitante);
router.put('/:id/salida', registrarSalida);

module.exports = router;
