const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clean existing data in reverse dependency order
  await prisma.registro.deleteMany();
  await prisma.empleado.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.empresa.deleteMany();

  // 1. Create Empresa
  const empresa = await prisma.empresa.create({
    data: {
      nombre: 'BorgWarner Guadalajara',
      subdominio: 'borgwarner-gdl',
      plan: 'basico',
      activo: true,
    },
  });

  console.log(`Empresa creada: ${empresa.nombre} (id: ${empresa.id})`);

  // 2. Create Usuario admin
  const passwordHash = bcrypt.hashSync('Admin123', 10);
  const usuario = await prisma.usuario.create({
    data: {
      empresaId: empresa.id,
      nombre: 'Administrador',
      email: 'admin@safecountix.com',
      passwordHash,
      rol: 'admin',
    },
  });

  console.log(`Usuario creado: ${usuario.email} (rol: ${usuario.rol})`);

  // 3. Create 10 Empleados
  const empleadosData = [
    // 5 empleados regulares
    {
      nombre: 'Carlos Hernández',
      numeroTarjeta: 'RFID-001',
      turno: 'manana',
      departamento: 'Producción',
      tipo: 'empleado',
      especialidadBrigada: null,
      estadoActual: 'dentro',
    },
    {
      nombre: 'María López',
      numeroTarjeta: 'RFID-002',
      turno: 'manana',
      departamento: 'Calidad',
      tipo: 'empleado',
      especialidadBrigada: null,
      estadoActual: 'fuera',
    },
    {
      nombre: 'José García',
      numeroTarjeta: 'RFID-003',
      turno: 'tarde',
      departamento: 'Mantenimiento',
      tipo: 'empleado',
      especialidadBrigada: null,
      estadoActual: 'dentro',
    },
    {
      nombre: 'Ana Martínez',
      numeroTarjeta: 'RFID-004',
      turno: 'tarde',
      departamento: 'Logística',
      tipo: 'empleado',
      especialidadBrigada: null,
      estadoActual: 'fuera',
    },
    {
      nombre: 'Roberto Sánchez',
      numeroTarjeta: 'RFID-005',
      turno: 'noche',
      departamento: 'Producción',
      tipo: 'empleado',
      especialidadBrigada: null,
      estadoActual: 'dentro',
    },
    // 3 brigadistas with different especialidades
    {
      nombre: 'Laura Torres',
      numeroTarjeta: 'RFID-006',
      turno: 'manana',
      departamento: 'Seguridad',
      tipo: 'brigadista',
      especialidadBrigada: 'primeros_auxilios',
      estadoActual: 'dentro',
    },
    {
      nombre: 'Fernando Ruiz',
      numeroTarjeta: 'RFID-007',
      turno: 'tarde',
      departamento: 'Seguridad',
      tipo: 'brigadista',
      especialidadBrigada: 'evacuacion',
      estadoActual: 'fuera',
    },
    {
      nombre: 'Patricia Díaz',
      numeroTarjeta: 'RFID-008',
      turno: 'noche',
      departamento: 'Seguridad',
      tipo: 'brigadista',
      especialidadBrigada: 'comunicacion',
      estadoActual: 'dentro',
    },
    // 2 proveedores
    {
      nombre: 'Miguel Ángel Flores',
      numeroTarjeta: 'RFID-009',
      turno: 'manana',
      departamento: 'Servicios Externos',
      tipo: 'proveedor',
      especialidadBrigada: null,
      estadoActual: 'dentro',
    },
    {
      nombre: 'Sofía Ramírez',
      numeroTarjeta: 'RFID-010',
      turno: 'tarde',
      departamento: 'Servicios Externos',
      tipo: 'proveedor',
      especialidadBrigada: null,
      estadoActual: 'fuera',
    },
  ];

  const empleados = [];
  for (const data of empleadosData) {
    const empleado = await prisma.empleado.create({
      data: {
        empresaId: empresa.id,
        ...data,
      },
    });
    empleados.push(empleado);
  }

  console.log(`Empleados creados: ${empleados.length}`);

  // 4. Create 20 Registros distributed over the last 2 days
  const now = new Date();

  const registrosData = [
    // Day 1 (yesterday) - 10 registros
    { empleadoIdx: 0, tipo: 'entrada', puerta: 'peatonal', hoursAgo: 30 },
    { empleadoIdx: 1, tipo: 'entrada', puerta: 'peatonal', hoursAgo: 29 },
    { empleadoIdx: 2, tipo: 'entrada', puerta: 'vehicular', hoursAgo: 28 },
    { empleadoIdx: 5, tipo: 'entrada', puerta: 'peatonal', hoursAgo: 27 },
    { empleadoIdx: 8, tipo: 'entrada', puerta: 'vehicular', hoursAgo: 26 },
    { empleadoIdx: 1, tipo: 'salida', puerta: 'peatonal', hoursAgo: 22 },
    { empleadoIdx: 0, tipo: 'salida', puerta: 'peatonal', hoursAgo: 21 },
    { empleadoIdx: 2, tipo: 'salida', puerta: 'vehicular', hoursAgo: 20 },
    { empleadoIdx: 5, tipo: 'salida', puerta: 'peatonal', hoursAgo: 19 },
    { empleadoIdx: 8, tipo: 'salida', puerta: 'vehicular', hoursAgo: 18 },
    // Day 2 (today) - 10 registros
    { empleadoIdx: 0, tipo: 'entrada', puerta: 'peatonal', hoursAgo: 8 },
    { empleadoIdx: 2, tipo: 'entrada', puerta: 'vehicular', hoursAgo: 7.5 },
    { empleadoIdx: 4, tipo: 'entrada', puerta: 'peatonal', hoursAgo: 7 },
    { empleadoIdx: 5, tipo: 'entrada', puerta: 'peatonal', hoursAgo: 6.5 },
    { empleadoIdx: 7, tipo: 'entrada', puerta: 'peatonal', hoursAgo: 6 },
    { empleadoIdx: 8, tipo: 'entrada', puerta: 'vehicular', hoursAgo: 5.5 },
    { empleadoIdx: 3, tipo: 'entrada', puerta: 'peatonal', hoursAgo: 5 },
    { empleadoIdx: 3, tipo: 'salida', puerta: 'peatonal', hoursAgo: 3 },
    { empleadoIdx: 6, tipo: 'entrada', puerta: 'peatonal', hoursAgo: 2 },
    { empleadoIdx: 6, tipo: 'salida', puerta: 'peatonal', hoursAgo: 1 },
  ];

  for (const reg of registrosData) {
    const fechaHora = new Date(now.getTime() - reg.hoursAgo * 60 * 60 * 1000);
    await prisma.registro.create({
      data: {
        empleadoId: empleados[reg.empleadoIdx].id,
        tipo: reg.tipo,
        puerta: reg.puerta,
        fechaHora,
      },
    });
  }

  console.log(`Registros creados: ${registrosData.length}`);

  // Summary
  const dentroCount = empleadosData.filter((e) => e.estadoActual === 'dentro').length;
  const brigadistasDentro = empleadosData.filter(
    (e) => e.estadoActual === 'dentro' && e.tipo === 'brigadista'
  ).length;
  const proveedoresDentro = empleadosData.filter(
    (e) => e.estadoActual === 'dentro' && e.tipo === 'proveedor'
  ).length;

  console.log('\n--- Resumen del Seed ---');
  console.log(`Empresa: ${empresa.nombre} (subdominio: ${empresa.subdominio})`);
  console.log(`Usuario admin: ${usuario.email}`);
  console.log(`Empleados: ${empleados.length} (${dentroCount} dentro)`);
  console.log(`  - Brigadistas dentro: ${brigadistasDentro}`);
  console.log(`  - Proveedores dentro: ${proveedoresDentro}`);
  console.log(`Registros: ${registrosData.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\nSeed completado exitosamente.');
  })
  .catch(async (e) => {
    console.error('Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
