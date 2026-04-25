import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiUrl, getAuthHeaders } from '../services/api.js';

export default function EntradasSalidasHora() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(apiUrl('/api/dashboard/movimientos-por-hora'), { headers: getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          setData(json.filter(h => { const hour = parseInt(h.hora); return hour >= 6 && hour <= 22; }));
        }
      } catch (error) { console.error('Error loading hourly data:', error); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return null;

  return (
    <div className="bg-paneles rounded-2xl border border-bordes p-5">
      <h3 className="text-white font-semibold text-sm mb-4">Entradas / Salidas Hoy</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D27" vertical={false} />
            <XAxis dataKey="hora" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#111916', border: '1px solid #1E2D27', borderRadius: '12px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="entradas" name="Entradas" fill="#34d399" radius={[3, 3, 0, 0]} />
            <Bar dataKey="salidas" name="Salidas" fill="#f87171" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
