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
          // Only show hours that have data or are within work hours (6-22)
          setData(json.filter(h => {
            const hour = parseInt(h.hora);
            return hour >= 6 && hour <= 22;
          }));
        }
      } catch (error) {
        console.error('Error loading hourly data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return null;

  return (
    <div className="bg-paneles rounded-lg border border-primario/20 p-4">
      <h3 className="text-white font-semibold mb-3">Entradas / Salidas Hoy</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="hora" stroke="#888" fontSize={11} />
            <YAxis stroke="#888" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#122B23', border: '1px solid #1D9E75', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey="entradas" name="Entradas" fill="#4ade80" radius={[4, 4, 0, 0]} />
            <Bar dataKey="salidas" name="Salidas" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
