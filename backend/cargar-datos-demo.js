const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Cargando datos de demo ===\n');

  // 1. Registrar entradas para 15 empleados (ponerlos "dentro")
  console.log('1. Registrando entradas de empleados...');
  const empleados = await prisma.empleado.findMany({
    where: { empresaId: 1, activo: true },
    take: 15
  });

  let entradas = 0;
  for (const emp of empleados) {
    await prisma.empleado.update({
      where: { id: emp.id },
      data: { estadoActual: 'dentro' }
    });
    await prisma.registro.create({
      data: {
        empleadoId: emp.id,
        tipo: 'entrada',
        puerta: Math.random() > 0.5 ? 'peatonal' : 'vehicular'
      }
    });
    entradas++;
  }
  console.log(`   ${entradas} empleados registrados como "dentro"\n`);

  // 2. Crear visitantes
  console.log('2. Creando visitantes...');
  const visitantesData = [
    { nombre: 'Roberto Sánchez', empresaOrigen: 'ABC Servicios', motivo: 'Mantenimiento de aires acondicionados', acceso: 'peatonal', estado: 'dentro' },
    { nombre: 'Laura Martínez', empresaOrigen: 'Grupo Industrial', motivo: 'Auditoría de calidad', acceso: 'peatonal', estado: 'dentro' },
    { nombre: 'Pedro Gómez', empresaOrigen: 'ConstruMex', motivo: 'Reparación de techo nave 3', acceso: 'vehicular', estado: 'dentro' },
    { nombre: 'Miguel Ángel Torres', empresaOrigen: 'Mantenimiento Total', motivo: 'Servicio a montacargas', acceso: 'vehicular', estado: 'fuera', fechaSalida: new Date() },
    { nombre: 'José Rodríguez', empresaOrigen: 'Logística Total', motivo: 'Entrega de materiales', acceso: 'vehicular', estado: 'fuera', fechaSalida: new Date() }
  ];

  for (const v of visitantesData) {
    await prisma.visitante.create({
      data: { empresaId: 1, ...v }
    });
  }
  console.log(`   ${visitantesData.length} visitantes creados (3 dentro, 2 ya salieron)\n`);

  // 3. Crear alertas
  console.log('3. Creando alertas...');
  const alertasData = [
    { tipo: 'sobre_cupo', mensaje: 'Área de Producción supera el 90% de capacidad (270/300 personas)', nivel: 'warning' },
    { tipo: 'visitante_sin_salida', mensaje: 'Visitante Pedro Gómez (ConstruMex) lleva más de 8 horas sin registrar salida', nivel: 'warning' },
    { tipo: 'incidencia', mensaje: 'Nueva incidencia crítica reportada: Salida de emergencia bloqueada en Nave 2', nivel: 'critical' },
    { tipo: 'evacuacion_pendiente', mensaje: 'Simulacro de evacuación programado para el 2 de mayo a las 10:00 AM', nivel: 'info' },
    { tipo: 'sobre_cupo', mensaje: 'Área de Almacén tiene 5 visitantes sin registro de salida', nivel: 'warning', leida: true },
    { tipo: 'incidencia', mensaje: 'Extintor vencido en Área de Calidad fue reemplazado', nivel: 'info', leida: true }
  ];

  for (const a of alertasData) {
    await prisma.alerta.create({
      data: { empresaId: 1, ...a }
    });
  }
  console.log(`   ${alertasData.length} alertas creadas (4 activas, 2 leídas)\n`);

  // 4. Crear incidencias
  console.log('4. Creando incidencias...');
  const incidenciasData = [
    { titulo: 'Salida de emergencia bloqueada', descripcion: 'La puerta de emergencia de la Nave 2 está bloqueada por tarimas de material. Se requiere despejar inmediatamente para cumplir con la norma NOM-002-STPS.', area: 'Nave 2 - Producción', nivel: 'critica', estado: 'abierta' },
    { titulo: 'Extintor sin presión', descripcion: 'El extintor #47 ubicado junto a la línea de ensamble 3 marca presión baja en el manómetro. Necesita recarga o reemplazo.', area: 'Línea de Ensamble 3', nivel: 'alta', estado: 'en_proceso' },
    { titulo: 'Señalización de ruta de evacuación dañada', descripcion: 'Las flechas de señalización en el pasillo principal del área de almacén están desprendidas y no son visibles.', area: 'Almacén', nivel: 'media', estado: 'abierta' },
    { titulo: 'Luz de emergencia sin funcionar', descripcion: 'La luz de emergencia del baño de hombres en planta baja no enciende durante los cortes de energía.', area: 'Planta Baja - Baños', nivel: 'baja', estado: 'abierta' },
    { titulo: 'Detector de humo activado por error', descripcion: 'El detector de humo en la cocina del comedor se activó por vapor de cocción. Se verificó que no hay riesgo real. Se recomienda reubicar el detector.', area: 'Comedor', nivel: 'media', estado: 'resuelta', fechaResuelta: new Date() },
    { titulo: 'Fuga de agua en cuarto eléctrico', descripcion: 'Se detectó humedad y goteo en el cuarto eléctrico principal. Riesgo de cortocircuito. Se cortó el suministro de agua de la tubería afectada.', area: 'Cuarto Eléctrico Principal', nivel: 'critica', estado: 'resuelta', fechaResuelta: new Date() }
  ];

  for (const inc of incidenciasData) {
    await prisma.incidencia.create({
      data: { empresaId: 1, ...inc }
    });
  }
  console.log(`   ${incidenciasData.length} incidencias creadas\n`);

  // Summary
  const dentro = await prisma.empleado.count({ where: { empresaId: 1, estadoActual: 'dentro', activo: true } });
  const brigadistasDentro = await prisma.empleado.count({ where: { empresaId: 1, estadoActual: 'dentro', activo: true, tipo: 'brigadista' } });
  const visitantesDentro = await prisma.visitante.count({ where: { empresaId: 1, estado: 'dentro' } });
  const alertasActivas = await prisma.alerta.count({ where: { empresaId: 1, leida: false } });
  const incidenciasAbiertas = await prisma.incidencia.count({ where: { empresaId: 1, estado: { not: 'resuelta' } } });

  console.log('=== Resumen ===');
  console.log(`Empleados dentro: ${dentro} (${brigadistasDentro} brigadistas)`);
  console.log(`Visitantes dentro: ${visitantesDentro}`);
  console.log(`Alertas activas: ${alertasActivas}`);
  console.log(`Incidencias abiertas: ${incidenciasAbiertas}`);
}

main()
  .catch(e => { console.error('Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
