import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiUrl, getAuthHeaders } from '../services/api.js';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function HistorialEvacuaciones() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistorial() {
      try {
        const res = await fetch(apiUrl('/api/evacuacion/historial'), { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setHistorial(data);
        }
      } catch (error) {
        console.error('Error loading historial:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistorial();
  }, []);

  if (loading) return null;
  if (historial.length === 0) {
    return (
      <div className="bg-paneles rounded-lg border border-primario/20 p-4">
        <h3 className="text-white font-semibold mb-3">Historial de Evacuaciones</h3>
        <p className="text-gray-500 text-sm">No hay evacuaciones registradas aún</p>
      </div>
    );
  }

  const chartData = historial.slice(0, 10).reverse().map((ev, i) => ({
    nombre: new Date(ev.fechaInicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
    duracion: Math.round(ev.duracionSegundos / 60 * 10) / 10,
    evacuados: ev.totalEvacuados,
    enPlanta: ev.totalEnPlanta,
    brigadistas: ev.brigadistas
  }));

  return (
    <div className="bg-paneles rounded-lg border border-primario/20 p-4">
      <h3 className="text-white font-semibold mb-4">Historial de Evacuaciones</h3>

      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="nombre" stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#122B23', border: '1px solid #1D9E75', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#ccc' }}
            />
            <Legend />
            <Bar dataKey="duracion" name="Duración (min)" fill="#1D9E75" radius={[4, 4, 0, 0]} />
            <Bar dataKey="evacuados" name="Evacuados" fill="#4ade80" radius={[4, 4, 0, 0]} />
            <Bar dataKey="brigadistas" name="Brigadistas" fill="#facc15" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {historial.slice(0, 5).map((ev) => (
          <div key={ev.id} className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0">
            <div>
              <p className="text-white text-sm">
                {new Date(ev.fechaInicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-gray-500 text-xs">
                {new Date(ev.fechaInicio).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-primario text-sm font-medium">{formatDuration(ev.duracionSegundos)}</p>
              <p className="text-gray-500 text-xs">{ev.totalEvacuados}/{ev.totalEnPlanta} evacuados</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
