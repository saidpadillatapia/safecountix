import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiUrl, getAuthHeaders } from '../services/api.js';

export default function EntradasSalidasHora() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function f() {
      try {
        const res = await fetch(apiUrl('/api/dashboard/movimientos-por-hora'), { headers: getAuthHeaders() });
        if (res.ok) { const j = await res.json(); setData(j.filter(h => parseInt(h.hora) >= 6 && parseInt(h.hora) <= 22)); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    f();
  }, []);

  if (loading) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="glass rounded-2xl p-5">
      <h3 className="text-white font-semibold text-[13px] mb-4">Entradas / Salidas Hoy</h3>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={1} barSize={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
            <XAxis dataKey="hora" stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} width={25} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(24,24,27,0.9)', backdropFilter: 'blur(10px)', border: '1px solid #27272A', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Bar dataKey="entradas" name="Entradas" fill="#22C55E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="salidas" name="Salidas" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
