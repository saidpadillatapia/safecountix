const prisma = require('../db');

/**
 * GET /api/empleados
 * List all active employees for the authenticated user's company.
 */
async function listarEmpleados(req, res) {
  try {
    const empresaId = req.user.empresaId;

    const empleados = await prisma.empleado.findMany({
      where: { empresaId, activo: true },
      select: {
        id: true,
        nombre: true,
        numeroTarjeta: true,
        turno: true,
        departamento: true,
        tipo: true,
        especialidadBrigada: true,
        estadoActual: true
      }
    });

    return res.json(empleados);
  } catch (error) {
    console.error('Error en listarEmpleados:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * POST /api/empleados
 * Create a new employee.
 */
async function crearEmpleado(req, res) {
  try {
    const empresaId = req.user.empresaId;
    const { nombre, numeroTarjeta, turno, departamento, tipo, especialidadBrigada } = req.body;

    // Validate required fields
    if (!nombre || !numeroTarjeta || !turno || !departamento || !tipo) {
      return res.status(400).json({
        error: true,
        message: 'Todos los campos son requeridos: nombre, numeroTarjeta, turno, departamento, tipo',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validate turno
    if (!['manana', 'tarde', 'noche'].includes(turno)) {
      return res.status(400).json({
        error: true,
        message: 'El turno debe ser "manana", "tarde" o "noche"',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validate tipo
    if (!['empleado', 'brigadista', 'proveedor'].includes(tipo)) {
      return res.status(400).json({
        error: true,
        message: 'El tipo debe ser "empleado", "brigadista" o "proveedor"',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validate brigadista requires especialidad
    if (tipo === 'brigadista' && !especialidadBrigada) {
      return res.status(400).json({
        error: true,
        message: 'Los brigadistas requieren una especialidadBrigada',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validate especialidad values
    const especialidadesValidas = ['primeros_auxilios', 'evacuacion', 'comunicacion', 'busqueda'];
    if (especialidadBrigada && !especialidadesValidas.includes(especialidadBrigada)) {
      return res.status(400).json({
        error: true,
        message: 'La especialidadBrigada debe ser: primeros_auxilios, evacuacion, comunicacion o busqueda',
        code: 'VALIDATION_ERROR'
      });
    }

    const empleado = await prisma.empleado.create({
      data: {
        empresaId,
        nombre,
        numeroTarjeta,
        turno,
        departamento,
        tipo,
        especialidadBrigada: tipo === 'brigadista' ? especialidadBrigada : null,
        estadoActual: 'fuera',
        activo: true
      }
    });

    return res.status(201).json(empleado);
  } catch (error) {
    // Handle unique constraint violation (duplicate card number)
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: true,
        message: 'El número de tarjeta ya está registrado',
        code: 'DUPLICATE_CARD'
      });
    }

    console.error('Error en crearEmpleado:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * PUT /api/empleados/:id
 * Update an existing employee. Only updates provided fields.
 */
async function actualizarEmpleado(req, res) {
  try {
    const empresaId = req.user.empresaId;
    const { id } = req.params;
    const { nombre, numeroTarjeta, turno, departamento, tipo, especialidadBrigada } = req.body;

    // Verify employee exists and belongs to the company
    const existing = await prisma.empleado.findFirst({
      where: { id: parseInt(id), empresaId, activo: true }
    });

    if (!existing) {
      return res.status(404).json({
        error: true,
        message: 'Empleado no encontrado',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    // Build update data — only include provided fields
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (numeroTarjeta !== undefined) updateData.numeroTarjeta = numeroTarjeta;
    if (turno !== undefined) {
      if (!['manana', 'tarde', 'noche'].includes(turno)) {
        return res.status(400).json({
          error: true,
          message: 'El turno debe ser "manana", "tarde" o "noche"',
          code: 'VALIDATION_ERROR'
        });
      }
      updateData.turno = turno;
    }
    if (departamento !== undefined) updateData.departamento = departamento;
    if (tipo !== undefined) {
      if (!['empleado', 'brigadista', 'proveedor'].includes(tipo)) {
        return res.status(400).json({
          error: true,
          message: 'El tipo debe ser "empleado", "brigadista" o "proveedor"',
          code: 'VALIDATION_ERROR'
        });
      }
      updateData.tipo = tipo;
    }
    if (especialidadBrigada !== undefined) updateData.especialidadBrigada = especialidadBrigada;

    // Validate brigadista requires especialidad
    const finalTipo = updateData.tipo || existing.tipo;
    const finalEspecialidad = updateData.especialidadBrigada !== undefined
      ? updateData.especialidadBrigada
      : existing.especialidadBrigada;

    if (finalTipo === 'brigadista' && !finalEspecialidad) {
      return res.status(400).json({
        error: true,
        message: 'Los brigadistas requieren una especialidadBrigada',
        code: 'VALIDATION_ERROR'
      });
    }

    const empleado = await prisma.empleado.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return res.json(empleado);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: true,
        message: 'El número de tarjeta ya está registrado',
        code: 'DUPLICATE_CARD'
      });
    }

    console.error('Error en actualizarEmpleado:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * DELETE /api/empleados/:id
 * Soft delete — set activo to false.
 */
async function eliminarEmpleado(req, res) {
  try {
    const empresaId = req.user.empresaId;
    const { id } = req.params;

    // Verify employee exists and belongs to the company
    const existing = await prisma.empleado.findFirst({
      where: { id: parseInt(id), empresaId, activo: true }
    });

    if (!existing) {
      return res.status(404).json({
        error: true,
        message: 'Empleado no encontrado',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    await prisma.empleado.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    });

    return res.json({ message: 'Empleado desactivado' });
  } catch (error) {
    console.error('Error en eliminarEmpleado:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

module.exports = { listarEmpleados, crearEmpleado, actualizarEmpleado, eliminarEmpleado };
