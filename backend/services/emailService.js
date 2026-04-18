const nodemailer = require('nodemailer');

// Create transporter — uses SENDGRID_API_KEY if available, otherwise logs to console
let transporter;

if (process.env.SENDGRID_API_KEY) {
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  });
} else {
  // Development: log emails to console
  transporter = null;
}

/**
 * Send shift closure summary email to admin.
 * @param {Object} params
 * @param {string} params.adminEmail - Admin email address
 * @param {string} params.turno - Shift that was closed
 * @param {number} params.totalSalidas - Number of automatic exits generated
 * @param {Array} params.empleadosAfectados - List of affected employees
 * @param {Array} params.errores - List of errors during closure
 */
async function enviarResumenCierre({ adminEmail, turno, totalSalidas, empleadosAfectados, errores }) {
  const listaEmpleados = empleadosAfectados
    .map((e) => `  - ${e.nombre} (${e.departamento})`)
    .join('\n');

  const listaErrores = errores.length > 0
    ? `\n\nErrores durante el cierre:\n${errores.join('\n')}`
    : '';

  const subject = `SafeCountix — Cierre automático turno ${turno}`;
  const text = `Resumen de cierre automático de turno ${turno}:

Salidas automáticas generadas: ${totalSalidas}

Empleados afectados:
${listaEmpleados || '  (ninguno)'}${listaErrores}

Este es un mensaje automático de SafeCountix.`;

  if (!transporter) {
    console.log('=== Email (dev mode) ===');
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log('========================');
    return;
  }

  try {
    await transporter.sendMail({
      from: 'noreply@safecountix.com',
      to: adminEmail,
      subject,
      text
    });
    console.log(`Email de cierre de turno enviado a ${adminEmail}`);
  } catch (error) {
    console.error('Error enviando email de cierre:', error);
    // Don't throw — email failure should not revert the shift closure
  }
}

module.exports = { enviarResumenCierre };
