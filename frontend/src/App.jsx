import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Evacuacion from './pages/Evacuacion.jsx';
import Empleados from './pages/Empleados.jsx';

function Layout({ children }) {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
            <div className="flex items-center gap-2">
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/evacuacion" className={linkClass}>
                Evacuación
              </NavLink>
              <NavLink to="/empleados" className={linkClass}>
                Empleados
              </NavLink>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('usuario');
                  window.location.href = '/login';
                }}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-red-900/50 hover:text-red-300 transition-colors"
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

function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center h-64">
      <h1 className="text-2xl text-gray-400">{title}</h1>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/evacuacion"
        element={
          <Layout>
            <Evacuacion />
          </Layout>
        }
      />
      <Route
        path="/empleados"
        element={
          <Layout>
            <Empleados />
          </Layout>
        }
      />
    </Routes>
  );
}
