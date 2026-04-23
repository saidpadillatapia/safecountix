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

/**
 * POST /api/evacuacion/finalizar
 * Save evacuation record to history.
 */
async function finalizarEvacuacion(req, res) {
  try {
    const empresaId = req.user.empresaId;
    const { fechaInicio, duracionSegundos, totalEnPlanta, totalEvacuados, brigadistas } = req.body;

    if (!fechaInicio || duracionSegundos === undefined) {
      return res.status(400).json({
        error: true,
        message: 'fechaInicio y duracionSegundos son requeridos',
        code: 'VALIDATION_ERROR'
      });
    }

    const registro = await prisma.historialEvacuacion.create({
      data: {
        empresaId,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(),
        duracionSegundos: parseInt(duracionSegundos),
        totalEnPlanta: parseInt(totalEnPlanta) || 0,
        totalEvacuados: parseInt(totalEvacuados) || 0,
        brigadistas: parseInt(brigadistas) || 0
      }
    });

    return res.status(201).json(registro);
  } catch (error) {
    console.error('Error en finalizarEvacuacion:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * GET /api/evacuacion/historial
 * Return evacuation history for the company.
 */
async function getHistorial(req, res) {
  try {
    const empresaId = req.user.empresaId;

    const historial = await prisma.historialEvacuacion.findMany({
      where: { empresaId },
      orderBy: { fechaInicio: 'desc' },
      take: 50
    });

    return res.json(historial);
  } catch (error) {
    console.error('Error en getHistorial:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}

module.exports = { getEnPlanta, getBrigadistas, generarPdf, finalizarEvacuacion, getHistorial };
