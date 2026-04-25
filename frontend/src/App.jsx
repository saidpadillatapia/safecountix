import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Evacuacion from './pages/Evacuacion.jsx';
import Empleados from './pages/Empleados.jsx';
import Alertas from './pages/Alertas.jsx';
import Incidencias from './pages/Incidencias.jsx';
import Visitantes from './pages/Visitantes.jsx';

function Layout({ children }) {
  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primario/15 text-primario'
        : 'text-texto-muted hover:text-texto hover:bg-white/5'
    }`;

  return (
    <div className="min-h-screen bg-fondo">
      <nav className="bg-paneles/80 backdrop-blur-md border-b border-bordes sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <NavLink to="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primario rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">SC</span>
              </div>
              <span className="text-white font-semibold text-[15px] tracking-tight">SafeCountix</span>
            </NavLink>
            <div className="flex items-center gap-1">
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/evacuacion" className={linkClass}>Evacuación</NavLink>
              <NavLink to="/empleados" className={linkClass}>Empleados</NavLink>
              <NavLink to="/visitantes" className={linkClass}>Visitantes</NavLink>
              <NavLink to="/alertas" className={linkClass}>Alertas</NavLink>
              <NavLink to="/incidencias" className={linkClass}>Incidencias</NavLink>
              <div className="w-px h-5 bg-bordes mx-2" />
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('usuario');
                  window.location.href = '/login';
                }}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-texto-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {children}
      </main>
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
