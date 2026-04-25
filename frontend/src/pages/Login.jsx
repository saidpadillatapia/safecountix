import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../services/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Error al iniciar sesión'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/dashboard');
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-fondo flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primario rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">SC</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SafeCountix</h1>
          <p className="text-texto-muted text-sm mt-1">Control de presencia en tiempo real</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-paneles rounded-2xl p-8 border border-bordes">
          <h2 className="text-lg font-semibold text-white mb-6">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-texto-muted text-xs font-medium mb-2 uppercase tracking-wider">
              Correo electrónico
            </label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
              className="w-full px-4 py-3 bg-fondo border border-bordes rounded-xl text-white placeholder-texto-muted/50 focus:outline-none focus:border-primario focus:ring-1 focus:ring-primario/30 transition-all text-sm"
              placeholder="admin@safecountix.com" />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-texto-muted text-xs font-medium mb-2 uppercase tracking-wider">
              Contraseña
            </label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
              className="w-full px-4 py-3 bg-fondo border border-bordes rounded-xl text-white placeholder-texto-muted/50 focus:outline-none focus:border-primario focus:ring-1 focus:ring-primario/30 transition-all text-sm"
              placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primario hover:bg-primario-hover text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
