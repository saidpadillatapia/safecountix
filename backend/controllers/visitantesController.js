const prisma = require('../db');

async function getVisitantes(req, res) {
  try {
    const empresaId = req.user.empresaId;
    const visitantes = await prisma.visitante.findMany({
      where: { empresaId },
      orderBy: { fechaEntrada: 'desc' },
      take: 50
    });
    return res.json(visitantes);
  } catch (error) {
    console.error('Error en getVisitantes:', error);
    return res.status(500).json({ error: true, message: 'Error interno', code: 'INTERNAL_ERROR' });
  }
}

async function registrarVisitante(req, res) {
  try {
    const empresaId = req.user.empresaId;
    const { nombre, empresaOrigen, motivo, acceso } = req.body;
    if (!nombre || !empresaOrigen || !motivo || !acceso) {
      return res.status(400).json({ error: true, message: 'nombre, empresaOrigen, motivo y acceso son requeridos', code: 'VALIDATION_ERROR' });
    }
    const visitante = await prisma.visitante.create({
      data: { empresaId, nombre, empresaOrigen, motivo, acceso }
    });
    return res.status(201).json(visitante);
  } catch (error) {
    console.error('Error en registrarVisitante:', error);
    return res.status(500).json({ error: true, message: 'Error interno', code: 'INTERNAL_ERROR' });
  }
}

async function registrarSalida(req, res) {
  try {
    const { id } = req.params;
    const visitante = await prisma.visitante.update({
      where: { id: parseInt(id) },
      data: { estado: 'fuera', fechaSalida: new Date() }
    });
    return res.json(visitante);
  } catch (error) {
    console.error('Error en registrarSalida:', error);
    return res.status(500).json({ error: true, message: 'Error interno', code: 'INTERNAL_ERROR' });
  }
}

module.exports = { getVisitantes, registrarVisitante, registrarSalida };
