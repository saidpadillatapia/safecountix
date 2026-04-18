const PDFDocument = require('pdfkit');

/**
 * Generate a PDF buffer with the list of employees currently in the plant.
 * @param {Object} params
 * @param {Array} params.empleados - List of employees inside the plant
 * @param {string} params.empresaNombre - Company name
 * @param {number} params.totalEnPlanta - Total count of people inside
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generarPdfEmergencia({ empleados, empresaNombre, totalEnPlanta }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const now = new Date();
    const fechaHora = now.toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Header
    doc.fontSize(20).text('SafeCountix — Reporte de Emergencia', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Empresa: ${empresaNombre}`, { align: 'center' });
    doc.text(`Fecha y hora: ${fechaHora}`, { align: 'center' });
    doc.text(`Total de personas en planta: ${totalEnPlanta}`, { align: 'center' });
    doc.moveDown(1);

    // Divider
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Table header
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Nombre', 50, doc.y, { width: 180, continued: false });
    const headerY = doc.y - 12;
    doc.text('Tipo', 230, headerY, { width: 80 });
    doc.text('Departamento', 310, headerY, { width: 120 });
    doc.text('Turno', 430, headerY, { width: 80 });
    doc.moveDown(0.3);

    // Divider
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);

    // Employee rows
    doc.font('Helvetica').fontSize(9);
    for (const emp of empleados) {
      if (doc.y > 700) {
        doc.addPage();
      }

      const rowY = doc.y;
      doc.text(emp.nombre || '', 50, rowY, { width: 180 });
      doc.text(emp.tipo || '', 230, rowY, { width: 80 });
      doc.text(emp.departamento || '', 310, rowY, { width: 120 });
      doc.text(emp.turno || '', 430, rowY, { width: 80 });
      doc.moveDown(0.2);
    }

    doc.end();
  });
}

module.exports = { generarPdfEmergencia };
