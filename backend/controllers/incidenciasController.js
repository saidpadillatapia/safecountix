const prisma = require('../db');

async function getIncidencias(req, res) {
  try {
    const empresaId = req.user.empresaId;
    const incidencias = await prisma.incidencia.findMany({
      where: { empresaId },
      orderBy: { fechaCreada: 'desc' },
      take: 50
    });
    return res.json(incidencias);
  } catch (error) {
    console.error('Error en getIncidencias:', error);
    return res.status(500).json({ error: true, message: 'Error interno', code: 'INTERNAL_ERROR' });
  }
}

async function crearIncidencia(req, res) {
  try {
    const empresaId = req.user.empresaId;
    const { titulo, descripcion, area, nivel } = req.body;
    if (!titulo || !descripcion || !area || !nivel) {
      return res.status(400).json({ error: true, message: 'titulo, descripcion, area y nivel son requeridos', code: 'VALIDATION_ERROR' });
    }
    const incidencia = await prisma.incidencia.create({
      data: { empresaId, titulo, descripcion, area, nivel }
    });
    return res.status(201).json(incidencia);
  } catch (error) {
    console.error('Error en crearIncidencia:', error);
    return res.status(500).json({ error: true, message: 'Error interno', code: 'INTERNAL_ERROR' });
  }
}

async function actualizarIncidencia(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const data = { estado };
    if (estado === 'resuelta') data.fechaResuelta = new Date();
    const incidencia = await prisma.incidencia.update({
      where: { id: parseInt(id) },
      data
    });
    return res.json(incidencia);
  } catch (error) {
    console.error('Error en actualizarIncidencia:', error);
    return res.status(500).json({ error: true, message: 'Error interno', code: 'INTERNAL_ERROR' });
  }
}

module.exports = { getIncidencias, crearIncidencia, actualizarIncidencia };
