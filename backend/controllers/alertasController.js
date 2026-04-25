const prisma = require('../db');

async function getAlertas(req, res) {
  try {
    const empresaId = req.user.empresaId;
    const alertas = await prisma.alerta.findMany({
      where: { empresaId },
      orderBy: { fechaCreada: 'desc' },
      take: 20
    });
    return res.json(alertas);
  } catch (error) {
    console.error('Error en getAlertas:', error);
    return res.status(500).json({ error: true, message: 'Error interno', code: 'INTERNAL_ERROR' });
  }
}

async function crearAlerta(req, res) {
  try {
    const empresaId = req.user.empresaId;
    const { tipo, mensaje, nivel } = req.body;
    if (!tipo || !mensaje) {
      return res.status(400).json({ error: true, message: 'tipo y mensaje son requeridos', code: 'VALIDATION_ERROR' });
    }
    const alerta = await prisma.alerta.create({
      data: { empresaId, tipo, mensaje, nivel: nivel || 'warning' }
    });
    return res.status(201).json(alerta);
  } catch (error) {
    console.error('Error en crearAlerta:', error);
    return res.status(500).json({ error: true, message: 'Error interno', code: 'INTERNAL_ERROR' });
  }
}

async function marcarLeida(req, res) {
  try {
    const { id } = req.params;
    const alerta = await prisma.alerta.update({
      where: { id: parseInt(id) },
      data: { leida: true }
    });
    return res.json(alerta);
  } catch (error) {
    console.error('Error en marcarLeida:', error);
    return res.status(500).json({ error: true, message: 'Error interno', code: 'INTERNAL_ERROR' });
  }
}

module.exports = { getAlertas, crearAlerta, marcarLeida };
