const cron = require('node-cron');

// Mapping: which shift ends at which hour
const TURNO_CIERRE = {
  '06:00': 'noche',
  '14:00': 'manana',
  '22:00': 'tarde'
};

let prisma;
let socketService;
let emailService;

/**
 * Initialize cron service with dependencies.
 */
function init(deps) {
  prisma = deps.prisma;
  socketService = deps.socketService;
  emailService = deps.emailService;

  // Schedule shift closures at 06:00, 14:00, and 22:00
  cron.schedule('0 6 * * *', () => cerrarTurno('06:00'));
  cron.schedule('0 14 * * *', () => cerrarTurno('14:00'));
  cron.schedule('0 22 * * *', () => cerrarTurno('22:00'));

  console.log('Cron service initialized — shift closures at 06:00, 14:00, 22:00');
}

/**
 * Close a shift: find employees of the ending shift who are still "dentro",
 * create salida_automatica records, and update their state to "fuera".
 */
async function cerrarTurno(hora) {
  const turno = TURNO_CIERRE[hora];
  if (!turno) return;

  console.log(`[Cron] Cerrando turno ${turno} (${hora})`);

  const errores = [];
  const empleadosAfectados = [];

  try {
    // Find employees of this shift who are still inside
    const empleadosDentro = await prisma.empleado.findMany({
      where: {
        turno,
        estadoActual: 'dentro',
        activo: true
      }
    });

    console.log(`[Cron] Encontrados ${empleadosDentro.length} empleados del turno ${turno} aún dentro`);

    // Process each employee individually — continue if one fails
    for (const empleado of empleadosDentro) {
      try {
        await prisma.$transaction([
          prisma.registro.create({
            data: {
              empleadoId: empleado.id,
              tipo: 'salida_automatica',
              puerta: 'peatonal'
            }
          }),
          prisma.empleado.update({
            where: { id: empleado.id },
            data: { estadoActual: 'fuera' }
          })
        ]);

        empleadosAfectados.push(empleado);
      } catch (error) {
        console.error(`[Cron] Error procesando empleado ${empleado.id} (${empleado.nombre}):`, error);
        errores.push(`Error con ${empleado.nombre} (ID: ${empleado.id}): ${error.message}`);
      }
    }

    // Emit updated count via Socket.io
    if (socketService && empleadosAfectados.length > 0) {
      try {
        // Get all companies affected and emit for each
        const empresaIds = [...new Set(empleadosAfectados.map((e) => e.empresaId))];
        for (const empresaId of empresaIds) {
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

          socketService.emitConteoActualizado({
            totalEnPlanta,
            brigadistas,
            proveedores,
            ultimoMovimiento: {
              empleadoNombre: 'Sistema',
              tipo: 'salida_automatica',
              puerta: 'peatonal',
              fechaHora: new Date()
            }
          });
        }
      } catch (socketError) {
        console.error('[Cron] Error emitting socket event:', socketError);
      }
    }

    // Send email summary to admin
    if (emailService) {
      try {
        // Find admin users for affected companies
        const empresaIds = [...new Set(empleadosDentro.map((e) => e.empresaId))];
        for (const empresaId of empresaIds) {
          const admin = await prisma.usuario.findFirst({
            where: { empresaId, rol: 'admin' }
          });

          if (admin) {
            await emailService.enviarResumenCierre({
              adminEmail: admin.email,
              turno,
              totalSalidas: empleadosAfectados.filter((e) => e.empresaId === empresaId).length,
              empleadosAfectados: empleadosAfectados.filter((e) => e.empresaId === empresaId),
              errores
            });
          }
        }
      } catch (emailError) {
        console.error('[Cron] Error sending email:', emailError);
      }
    }

    console.log(`[Cron] Turno ${turno} cerrado. ${empleadosAfectados.length} salidas automáticas generadas.`);
  } catch (error) {
    console.error(`[Cron] Error fatal cerrando turno ${turno}:`, error);
  }
}

module.exports = { init, cerrarTurno };
