import { io } from 'socket.io-client';

let socket = null;

/**
 * Get or create the Socket.io client connection.
 * In dev: connects to localhost via Vite proxy.
 * In prod: connects to the backend URL from VITE_API_URL.
 */
export function getSocket() {
  if (!socket) {
    const serverUrl = import.meta.env.VITE_API_URL || undefined;
    socket = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5
    });

    socket.on('connect', () => {
      console.log('Socket.io connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error.message);
    });
  }

  return socket;
}

/**
 * Subscribe to conteo_actualizado events.
 * @param {Function} callback - Called with { totalEnPlanta, brigadistas, proveedores, ultimoMovimiento }
 * @returns {Function} Unsubscribe function
 */
export function onConteoActualizado(callback) {
  const s = getSocket();
  s.on('conteo_actualizado', callback);
  return () => s.off('conteo_actualizado', callback);
}

/**
 * Subscribe to evacuacion_activada events.
 * @param {Function} callback - Called with { timestamp, listaEnPlanta }
 * @returns {Function} Unsubscribe function
 */
export function onEvacuacionActivada(callback) {
  const s = getSocket();
  s.on('evacuacion_activada', callback);
  return () => s.off('evacuacion_activada', callback);
}

/**
 * Disconnect the socket.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
