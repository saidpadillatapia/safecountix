const prisma = require('../db');

/**
 * GET /api/dashboard/conteo
 * Return count of employees inside the plant, broken down by type.
 */
async function getConteo(req, res) {
  try {
    const empresaId = req.user.empresaId;

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

    return res.json({ totalEnPlanta, brigadistas, proveedores });
  } catch (error) {
    console.error('Error en getConteo:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * GET /api/dashboard/en-planta
 * Return list of employees currently inside the plant.
 */
async function getEnPlanta(req, res) {
  try {
    const empresaId = req.user.empresaId;

    const empleados = await prisma.empleado.findMany({
      where: { empresaId, estadoActual: 'dentro', activo: true },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        departamento: true,
        turno: true,
        numeroTarjeta: true,
        especialidadBrigada: true
      }
    });

    return res.json(empleados);
  } catch (error) {
    console.error('Error en getEnPlanta:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * GET /api/dashboard/movimientos
 * Return last 20 registros ordered by fechaHora desc.
 */
async function getMovimientos(req, res) {
  try {
    const empresaId = req.user.empresaId;

    const movimientos = await prisma.registro.findMany({
      where: {
        empleado: { empresaId }
      },
      orderBy: { fechaHora: 'desc' },
      take: 20,
      include: {
        empleado: {
          select: {
            nombre: true,
            tipo: true,
            departamento: true
          }
        }
      }
    });

    return res.json(movimientos);
  } catch (error) {
    console.error('Error en getMovimientos:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * GET /api/dashboard/movimientos-por-hora
 * Return entry/exit counts grouped by hour for today.
 */
async function getMovimientosPorHora(req, res) {
  try {
    const empresaId = req.user.empresaId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const registros = await prisma.registro.findMany({
      where: {
        empleado: { empresaId },
        fechaHora: { gte: today }
      },
      select: { tipo: true, fechaHora: true }
    });

    // Group by hour
    const porHora = {};
    for (let h = 0; h < 24; h++) {
      porHora[h] = { hora: `${String(h).padStart(2, '0')}:00`, entradas: 0, salidas: 0 };
    }
    registros.forEach(r => {
      const h = new Date(r.fechaHora).getHours();
      if (r.tipo === 'entrada') porHora[h].entradas++;
      else porHora[h].salidas++;
    });

    return res.json(Object.values(porHora));
  } catch (error) {
    console.error('Error en getMovimientosPorHora:', error);
    return res.status(500).json({ error: true, message: 'Error interno del servidor', code: 'INTERNAL_ERROR' });
  }
}

module.exports = { getConteo, getEnPlanta, getMovimientos, getMovimientosPorHora };
