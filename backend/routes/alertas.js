const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getAlertas, crearAlerta, marcarLeida } = require('../controllers/alertasController');

router.use(authMiddleware);
router.get('/', getAlertas);
router.post('/', crearAlerta);
router.put('/:id/leida', marcarLeida);

module.exports = router;
