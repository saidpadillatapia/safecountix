let io = null;

/**
 * Initialize Socket.io with the HTTP server instance.
 */
function init(httpServer) {
  const { Server } = require('socket.io');
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emit conteo_actualizado event to all connected clients.
 * @param {Object} data - { totalEnPlanta, brigadistas, proveedores, ultimoMovimiento }
 */
function emitConteoActualizado(data) {
  if (!io) {
    console.warn('Socket.io not initialized, skipping emit conteo_actualizado');
    return;
  }
  try {
    io.emit('conteo_actualizado', data);
  } catch (error) {
    console.error('Error emitting conteo_actualizado:', error);
  }
}

/**
 * Emit evacuacion_activada event to all connected clients.
 * @param {Object} data - { timestamp, listaEnPlanta }
 */
function emitEvacuacionActivada(data) {
  if (!io) {
    console.warn('Socket.io not initialized, skipping emit evacuacion_activada');
    return;
  }
  try {
    io.emit('evacuacion_activada', data);
  } catch (error) {
    console.error('Error emitting evacuacion_activada:', error);
  }
}

/**
 * Get the Socket.io server instance.
 */
function getIO() {
  return io;
}

module.exports = { init, emitConteoActualizado, emitEvacuacionActivada, getIO };
