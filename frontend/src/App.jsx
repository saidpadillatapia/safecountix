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
    `px-2 py-2 rounded-md text-xs font-medium transition-colors ${
      isActive
        ? 'bg-primario text-white'
        : 'text-gray-300 hover:bg-paneles hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-fondo">
      <nav className="bg-paneles border-b border-primario/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-primario font-bold text-xl">SafeCountix</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/evacuacion" className={linkClass}>Evacuación</NavLink>
              <NavLink to="/empleados" className={linkClass}>Empleados</NavLink>
              <NavLink to="/visitantes" className={linkClass}>Visitantes</NavLink>
              <NavLink to="/alertas" className={linkClass}>Alertas</NavLink>
              <NavLink to="/incidencias" className={linkClass}>Incidencias</NavLink>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('usuario');
                  window.location.href = '/login';
                }}
                className="px-2 py-2 rounded-md text-xs font-medium text-gray-300 hover:bg-red-900/50 hover:text-red-300 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
