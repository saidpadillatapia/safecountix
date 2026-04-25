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
        if (res.ok) setHistorial(await res.json());
      } catch (error) { console.error('Error loading historial:', error); }
      finally { setLoading(false); }
    }
    fetchHistorial();
  }, []);

  if (loading) return null;
  if (historial.length === 0) {
    return (
      <div className="bg-paneles rounded-2xl border border-bordes p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Historial de Evacuaciones</h3>
        <p className="text-texto-muted text-sm">No hay evacuaciones registradas aún</p>
      </div>
    );
  }

  const chartData = historial.slice(0, 10).reverse().map(ev => ({
    nombre: new Date(ev.fechaInicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
    duracion: Math.round(ev.duracionSegundos / 60 * 10) / 10,
    evacuados: ev.totalEvacuados,
    brigadistas: ev.brigadistas
  }));

  return (
    <div className="bg-paneles rounded-2xl border border-bordes p-5">
      <h3 className="text-white font-semibold text-sm mb-4">Historial de Evacuaciones</h3>
      <div className="h-56 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D27" vertical={false} />
            <XAxis dataKey="nombre" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#111916', border: '1px solid #1E2D27', borderRadius: '12px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="duracion" name="Duración (min)" fill="#1D9E75" radius={[3, 3, 0, 0]} />
            <Bar dataKey="evacuados" name="Evacuados" fill="#34d399" radius={[3, 3, 0, 0]} />
            <Bar dataKey="brigadistas" name="Brigadistas" fill="#facc15" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="divide-y divide-bordes/50">
        {historial.slice(0, 5).map(ev => (
          <div key={ev.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-white text-sm font-medium">{new Date(ev.fechaInicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p className="text-texto-muted text-xs">{new Date(ev.fechaInicio).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="text-right">
              <p className="text-primario text-sm font-semibold">{formatDuration(ev.duracionSegundos)}</p>
              <p className="text-texto-muted text-xs">{ev.totalEvacuados}/{ev.totalEnPlanta} evacuados</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
