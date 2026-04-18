const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  listarEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado
} = require('../controllers/empleadosController');

// All employee routes require authentication
router.use(authMiddleware);

router.get('/', listarEmpleados);
router.post('/', crearEmpleado);
router.put('/:id', actualizarEmpleado);
router.delete('/:id', eliminarEmpleado);

module.exports = router;
