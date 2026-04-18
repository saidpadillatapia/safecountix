const prisma = require('../db');
const { generarPdfEmergencia } = require('../services/pdfService');

/**
 * GET /api/evacuacion/en-planta
 * Return list of employees currently inside the plant for emergency mode.
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
    console.error('Error en evacuacion getEnPlanta:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * GET /api/evacuacion/brigadistas
 * Return list of brigadistas currently inside the plant with their specialty.
 */
async function getBrigadistas(req, res) {
  try {
    const empresaId = req.user.empresaId;

    const brigadistas = await prisma.empleado.findMany({
      where: {
        empresaId,
        estadoActual: 'dentro',
        activo: true,
        tipo: 'brigadista'
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        departamento: true,
        turno: true,
        especialidadBrigada: true
      }
    });

    return res.json(brigadistas);
  } catch (error) {
    console.error('Error en evacuacion getBrigadistas:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * GET /api/evacuacion/pdf
 * Generate and return a PDF with the list of employees currently in the plant.
 */
async function generarPdf(req, res) {
  try {
    const empresaId = req.user.empresaId;

    // Get company name
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { nombre: true }
    });

    // Get employees inside
    const empleados = await prisma.empleado.findMany({
      where: { empresaId, estadoActual: 'dentro', activo: true },
      select: {
        nombre: true,
        tipo: true,
        departamento: true,
        turno: true
      }
    });

    const pdfBuffer = await generarPdfEmergencia({
      empleados,
      empresaNombre: empresa ? empresa.nombre : 'Empresa',
      totalEnPlanta: empleados.length
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-emergencia.pdf"');
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error en evacuacion generarPdf:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

module.exports = { getEnPlanta, getBrigadistas, generarPdf };
