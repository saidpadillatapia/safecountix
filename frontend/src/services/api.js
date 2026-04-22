// In development, Vite proxy handles /api requests.
// In production, we need the full backend URL.
const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Build a full API URL.
 * In dev: '/api/auth/login' (proxy handles it)
 * In prod: 'https://safecountix-backend.up.railway.app/api/auth/login'
 */
export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

/**
 * Get auth headers with JWT token.
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  };
}
