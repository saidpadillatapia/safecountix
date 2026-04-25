import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Evacuacion from './pages/Evacuacion.jsx';
import Empleados from './pages/Empleados.jsx';
import Alertas from './pages/Alertas.jsx';
import Incidencias from './pages/Incidencias.jsx';
import Visitantes from './pages/Visitantes.jsx';

function Layout({ children }) {
  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
      isActive
        ? 'bg-white/10 text-white shadow-sm'
        : 'text-texto-muted hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="min-h-screen bg-fondo">
      <nav className="glass sticky top-0 z-50 border-b border-bordes/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-12">
            <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-6 h-6 bg-gradient-to-br from-primario to-emerald-400 rounded-lg flex items-center justify-center shadow-lg shadow-primario/20 group-hover:shadow-primario/40 transition-shadow">
                <span className="text-white text-[10px] font-bold">SC</span>
              </div>
              <span className="text-white font-semibold text-sm tracking-tight">SafeCountix</span>
            </NavLink>
            <div className="flex items-center gap-0.5">
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/evacuacion" className={linkClass}>Evacuación</NavLink>
              <NavLink to="/empleados" className={linkClass}>Empleados</NavLink>
              <NavLink to="/visitantes" className={linkClass}>Visitantes</NavLink>
              <NavLink to="/alertas" className={linkClass}>Alertas</NavLink>
              <NavLink to="/incidencias" className={linkClass}>Incidencias</NavLink>
              <div className="w-px h-4 bg-bordes mx-2" />
              <button
                onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('usuario'); window.location.href = '/login'; }}
                className="px-3 py-1.5 rounded-xl text-[13px] font-medium text-texto-muted hover:text-danger hover:bg-danger/10 transition-all duration-300"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="max-w-[1400px] mx-auto px-6 py-8"
      >
        {children}
      </motion.main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/evacuacion" element={<Layout><Evacuacion /></Layout>} />
      <Route path="/empleados" element={<Layout><Empleados /></Layout>} />
      <Route path="/visitantes" element={<Layout><Visitantes /></Layout>} />
      <Route path="/alertas" element={<Layout><Alertas /></Layout>} />
      <Route path="/incidencias" element={<Layout><Incidencias /></Layout>} />
    </Routes>
  );
}
