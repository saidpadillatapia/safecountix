import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Contador from '../components/Contador.jsx';
import MovimientosRecientes from '../components/MovimientosRecientes.jsx';
import ListaEnPlanta from '../components/ListaEnPlanta.jsx';
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

        if (conteoRes.status === 401 || enPlantaRes.status === 401) {
          navigate('/login');
          return;
        }

        const [conteoData, enPlantaData, movimientosData] = await Promise.all([
          conteoRes.json(),
          enPlantaRes.json(),
          movimientosRes.json()
        ]);

        setConteo(conteoData);
        setEnPlanta(enPlantaData);
        setMovimientos(movimientosData);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  // Socket.io real-time updates
  useEffect(() => {
    const unsubscribe = onConteoActualizado((data) => {
      setConteo({
        totalEnPlanta: data.totalEnPlanta,
        brigadistas: data.brigadistas,
        proveedores: data.proveedores
      });

      // Add the latest movement to the top of the list
      if (data.ultimoMovimiento) {
        setMovimientos((prev) => {
          const newMov = {
            id: Date.now(),
            tipo: data.ultimoMovimiento.tipo,
            puerta: data.ultimoMovimiento.puerta,
            fechaHora: data.ultimoMovimiento.fechaHora,
            empleado: { nombre: data.ultimoMovimiento.empleadoNombre }
          };
          return [newMov, ...prev].slice(0, 20);
        });
      }

      // Refresh en-planta list
      fetch(apiUrl('/api/dashboard/en-planta'), { headers: getAuthHeaders() })
        .then((res) => res.json())
        .then((data) => setEnPlanta(data))
        .catch(console.error);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <button
          onClick={() => navigate('/evacuacion')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-red-900/30"
        >
          🚨 EVACUACIÓN
        </button>
      </div>

      <Contador
        total={conteo.totalEnPlanta}
        brigadistas={conteo.brigadistas}
        proveedores={conteo.proveedores}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MovimientosRecientes movimientos={movimientos} />
        </div>
        <div>
          <ListaEnPlanta empleados={enPlanta} />
        </div>
      </div>
    </div>
  );
}
