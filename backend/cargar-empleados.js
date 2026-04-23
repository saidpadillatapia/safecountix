const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const nombres = [
  'Gomez Lozano Leticia',
  'Garcia Lubian Juan Carlos',
  'Soto Mota Alejandro Guadalupe',
  'Macias Reyes Hector',
  'Alberto Sanchez Luna',
  'Arturo Rodriguez Becerra',
  'Pablo Mauricio Tezcucano',
  'Garcia Ortega Ercilia Victoria',
  'Rios Oliva Olga Lidia',
  'Lopez Arevalo Jose Martin',
  'Rios Tornero Norma Alicia',
  'Cabrera Gallardo Maria Araceli',
  'Contreras De La Cruz Miguel Angel',
  'Luna Buenrostro Claudia Patricia',
  'Armenta Macias Hector Manuel',
  'Alvarez Moreno Rosa',
  'Raygoza Garcia Julia',
  'Cortes Benavides J Rosa',
  'Garcia Alcocer Adalberto',
  'Gutierrez Gomez Bruno',
  'Ortega Ortega Isela',
  'Prieto Ochoa Juan',
  'Vera Castillo Maria Teresa',
  'Olvera Rodriguez Jesus Adrian',
  'Aguila Torres Wilfrido',
  'Luna Dominguez Alejandra',
  'Gomez Delgadillo Maria Esther',
  'Ojeda Cuevas Margarita',
  'Diaz Mendoza Margarita',
  'Leon Arceo Victor Manuel',
  'Ortiz Morquecho Laura',
  'Sandoval Vazquez Enrique',
  'Guerrero Alvarez Alicia',
  'Herrera Torres Jose De Jesus',
  'Salazar Guerrero Dionicio',
  'Rodriguez Cano Armando',
  'Rodriguez Colmenares Armando',
  'Fuentes Soto Maria Isabel',
  'Contreras Bautista Martin',
  'Alcocer Duarte Liliana'
];

const turnos = ['manana', 'tarde', 'noche'];

function generarTarjeta(usadas) {
  let tarjeta;
  do {
    tarjeta = String(Math.floor(100000 + Math.random() * 900000));
  } while (usadas.has(tarjeta));
  usadas.add(tarjeta);
  return tarjeta;
}

async function main() {
  const tarjetasUsadas = new Set();

  // Obtener tarjetas existentes para no duplicar
  const existentes = await prisma.empleado.findMany({ select: { numeroTarjeta: true } });
  existentes.forEach(e => tarjetasUsadas.add(e.numeroTarjeta));

  let creados = 0;
  for (const nombre of nombres) {
    const tarjeta = generarTarjeta(tarjetasUsadas);
    const turno = turnos[Math.floor(Math.random() * turnos.length)];

    await prisma.empleado.create({
      data: {
        empresaId: 1,
        nombre,
        numeroTarjeta: tarjeta,
        turno,
        departamento: 'Producción',
        tipo: 'empleado',
        especialidadBrigada: null,
        estadoActual: 'fuera',
        activo: true
      }
    });
    creados++;
    console.log(`${creados}. ${nombre} — tarjeta: ${tarjeta}, turno: ${turno}`);
  }

  console.log(`\n${creados} empleados cargados exitosamente.`);
}

main()
  .catch(e => { console.error('Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
