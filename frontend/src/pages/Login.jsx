import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiUrl } from '../services/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Error al iniciar sesión'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/dashboard');
    } catch (err) { setError('Error de conexión'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-fondo flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primario/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-16 h-16 bg-gradient-to-br from-primario to-emerald-400 rounded-[20px] flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-primario/30"
          >
            <span className="text-white text-2xl font-bold">SC</span>
          </motion.div>
          <h1 className="text-[22px] font-semibold text-white tracking-tight">SafeCountix</h1>
          <p className="text-texto-muted text-[13px] mt-1.5">Control de presencia en tiempo real</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-7 space-y-5">
          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="bg-danger/10 border border-danger/20 text-danger px-4 py-2.5 rounded-xl text-[13px]">
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-texto-secondary text-[11px] font-semibold mb-2 uppercase tracking-widest">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
              className="w-full px-4 py-2.5 bg-white/5 border border-bordes rounded-xl text-white text-sm placeholder-texto-muted/40 focus:outline-none focus:ring-2 focus:ring-primario/40 focus:border-primario/50 transition-all duration-300"
              placeholder="admin@safecountix.com" />
          </div>

          <div>
            <label className="block text-texto-secondary text-[11px] font-semibold mb-2 uppercase tracking-widest">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
              className="w-full px-4 py-2.5 bg-white/5 border border-bordes rounded-xl text-white text-sm placeholder-texto-muted/40 focus:outline-none focus:ring-2 focus:ring-primario/40 focus:border-primario/50 transition-all duration-300"
              placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-primario to-emerald-500 hover:from-primario-hover hover:to-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 disabled:opacity-50 text-sm shadow-lg shadow-primario/25 hover:shadow-primario/40 active:scale-[0.98]">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Ingresando...
              </span>
            ) : 'Ingresar'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
