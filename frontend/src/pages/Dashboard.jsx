import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Contador from '../components/Contador.jsx';
import MovimientosRecientes from '../components/MovimientosRecientes.jsx';
import ListaEnPlanta from '../components/ListaEnPlanta.jsx';
import HistorialEvacuaciones from '../components/HistorialEvacuaciones.jsx';
import PersonalPorArea from '../components/PersonalPorArea.jsx';
import EntradasSalidasHora from '../components/EntradasSalidasHora.jsx';
import { onConteoActualizado } from '../services/socket.js';
import { apiUrl, getAuthHeaders } from '../services/api.js';

export default function Dashboard() {
  const [conteo, setConteo] = useState({ totalEnPlanta: 0, brigadistas: 0, proveedores: 0 });
  const [enPlanta, setEnPlanta] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [c, e, m] = await Promise.all([
          fetch(apiUrl('/api/dashboard/conteo'), { headers: getAuthHeaders() }),
          fetch(apiUrl('/api/dashboard/en-planta'), { headers: getAuthHeaders() }),
          fetch(apiUrl('/api/dashboard/movimientos'), { headers: getAuthHeaders() })
        ]);
        if (c.status === 401) { navigate('/login'); return; }
        const [cd, ed, md] = await Promise.all([c.json(), e.json(), m.json()]);
        setConteo(cd); setEnPlanta(ed); setMovimientos(md);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const unsub = onConteoActualizado((data) => {
      setConteo({ totalEnPlanta: data.totalEnPlanta, brigadistas: data.brigadistas, proveedores: data.proveedores });
      if (data.ultimoMovimiento) {
        setMovimientos(prev => [{ id: Date.now(), tipo: data.ultimoMovimiento.tipo, puerta: data.ultimoMovimiento.puerta, fechaHora: data.ultimoMovimiento.fechaHora, empleado: { nombre: data.ultimoMovimiento.empleadoNombre } }, ...prev].slice(0, 20));
      }
      fetch(apiUrl('/api/dashboard/en-planta'), { headers: getAuthHeaders() }).then(r => r.json()).then(setEnPlanta).catch(console.error);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primario/30 border-t-primario rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Panel de Control</h1>
          <p className="text-texto-muted text-[13px] mt-0.5">Monitoreo en tiempo real de la planta</p>
        </div>
        <button onClick={() => navigate('/evacuacion')}
          className="emergency-pulse bg-gradient-to-r from-danger to-red-600 hover:from-danger-hover hover:to-red-700 text-white font-bold py-2.5 px-7 rounded-xl transition-all duration-300 flex items-center gap-2 text-[13px] shadow-lg shadow-danger/25 active:scale-[0.97]">
          <span className="w-2 h-2 bg-white rounded-full dot-pulse" />
          EVACUACIÓN
        </button>
      </motion.div>

      <Contador total={conteo.totalEnPlanta} brigadistas={conteo.brigadistas} proveedores={conteo.proveedores} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2"><MovimientosRecientes movimientos={movimientos} /></div>
        <div><ListaEnPlanta empleados={enPlanta} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PersonalPorArea empleados={enPlanta} />
        <EntradasSalidasHora />
      </div>

      <HistorialEvacuaciones />
    </div>
  );
}
