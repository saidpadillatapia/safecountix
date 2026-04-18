const prisma = require('../db');

// socketService will be injected later via setSocketService
let socketService = null;

function setSocketService(svc) {
  socketService = svc;
}

/**
 * POST /api/registro
 * Toggle entrada/salida for an employee based on their card number.
 */
async function crearRegistro(req, res) {
  try {
    const { numeroTarjeta, puerta } = req.body;

    // Validate puerta
    if (!puerta || !['peatonal', 'vehicular'].includes(puerta)) {
      return res.status(400).json({
        error: true,
        message: 'La puerta debe ser "peatonal" o "vehicular"',
        code: 'VALIDATION_ERROR'
      });
    }

    if (!numeroTarjeta) {
      return res.status(400).json({
        error: true,
        message: 'El número de tarjeta es requerido',
        code: 'VALIDATION_ERROR'
      });
    }

    // Build query filter — if authenticated user, filter by empresaId
    const whereClause = { numeroTarjeta, activo: true };
    if (req.user && req.user.empresaId) {
      whereClause.empresaId = req.user.empresaId;
    }

    // Find active employee by card number
    const empleado = await prisma.empleado.findFirst({ where: whereClause });

    if (!empleado) {
      return res.status(404).json({
        error: true,
        message: 'Empleado no encontrado',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    // Toggle logic
    const esEntrada = empleado.estadoActual === 'fuera';
    const tipoRegistro = esEntrada ? 'entrada' : 'salida';
    const nuevoEstado = esEntrada ? 'dentro' : 'fuera';

    // Create registro and update employee state in a transaction
    const [registro] = await prisma.$transaction([
      prisma.registro.create({
        data: {
          empleadoId: empleado.id,
          tipo: tipoRegistro,
          puerta
        }
      }),
      prisma.empleado.update({
        where: { id: empleado.id },
        data: { estadoActual: nuevoEstado }
      })
    ]);

    // Calculate updated net count for the employee's company
    const conteo = await calcularConteo(empleado.empresaId);

    // Emit socket event
    if (socketService) {
      try {
        socketService.emitConteoActualizado({
          ...conteo,
          ultimoMovimiento: {
            empleadoNombre: empleado.nombre,
            tipo: tipoRegistro,
            puerta,
            fechaHora: registro.fechaHora
          }
        });
      } catch (socketError) {
        console.error('Error emitting socket event:', socketError);
        // Don't fail the HTTP response for socket errors
      }
    }

    return res.json({
      accion: tipoRegistro,
      empleado: {
        id: empleado.id,
        nombre: empleado.nombre,
        tipo: empleado.tipo,
        departamento: empleado.departamento
      },
      conteo
    });
  } catch (error) {
    console.error('Error en crearRegistro:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Calculate net count of employees inside the plant for a given company.
 */
async function calcularConteo(empresaId) {
  const [totalEnPlanta, brigadistas, proveedores] = await Promise.all([
    prisma.empleado.count({
      where: { empresaId, estadoActual: 'dentro', activo: true }
    }),
    prisma.empleado.count({
      where: { empresaId, estadoActual: 'dentro', activo: true, tipo: 'brigadista' }
    }),
    prisma.empleado.count({
      where: { empresaId, estadoActual: 'dentro', activo: true, tipo: 'proveedor' }
    })
  ]);

  return { totalEnPlanta, brigadistas, proveedores };
}

module.exports = { crearRegistro, setSocketService, calcularConteo };
