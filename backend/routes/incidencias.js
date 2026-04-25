const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getIncidencias, crearIncidencia, actualizarIncidencia } = require('../controllers/incidenciasController');

router.use(authMiddleware);
router.get('/', getIncidencias);
router.post('/', crearIncidencia);
router.put('/:id', actualizarIncidencia);

module.exports = router;
