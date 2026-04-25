import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        const [conteoRes, enPlantaRes, movimientosRes] = await Promise.all([
          fetch(apiUrl('/api/dashboard/conteo'), { headers: getAuthHeaders() }),
          fetch(apiUrl('/api/dashboard/en-planta'), { headers: getAuthHeaders() }),
          fetch(apiUrl('/api/dashboard/movimientos'), { headers: getAuthHeaders() })
        ]);
        if (conteoRes.status === 401 || enPlantaRes.status === 401) { navigate('/login'); return; }
        const [conteoData, enPlantaData, movimientosData] = await Promise.all([
          conteoRes.json(), enPlantaRes.json(), movimientosRes.json()
        ]);
        setConteo(conteoData);
        setEnPlanta(enPlantaData);
        setMovimientos(movimientosData);
      } catch (error) { console.error('Error loading dashboard:', error); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onConteoActualizado((data) => {
      setConteo({ totalEnPlanta: data.totalEnPlanta, brigadistas: data.brigadistas, proveedores: data.proveedores });
      if (data.ultimoMovimiento) {
        setMovimientos((prev) => {
          const newMov = { id: Date.now(), tipo: data.ultimoMovimiento.tipo, puerta: data.ultimoMovimiento.puerta, fechaHora: data.ultimoMovimiento.fechaHora, empleado: { nombre: data.ultimoMovimiento.empleadoNombre } };
          return [newMov, ...prev].slice(0, 20);
        });
      }
      fetch(apiUrl('/api/dashboard/en-planta'), { headers: getAuthHeaders() })
        .then(r => r.json()).then(d => setEnPlanta(d)).catch(console.error);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-primario border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-texto-muted text-sm mt-1">Monitoreo en tiempo real de la planta</p>
        </div>
        <button onClick={() => navigate('/evacuacion')}
          className="emergency-pulse bg-danger hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm">
          <span className="text-lg">🚨</span> EVACUACIÓN
        </button>
      </div>

      <Contador total={conteo.totalEnPlanta} brigadistas={conteo.brigadistas} proveedores={conteo.proveedores} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MovimientosRecientes movimientos={movimientos} />
        </div>
        <div>
          <ListaEnPlanta empleados={enPlanta} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalPorArea empleados={enPlanta} />
        <EntradasSalidasHora />
      </div>

      <HistorialEvacuaciones />
    </div>
  );
}
