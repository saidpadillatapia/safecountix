import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiUrl, getAuthHeaders } from '../services/api.js';

function fmt(s) { return `${Math.floor(s/60)}m ${s%60}s`; }

export default function HistorialEvacuaciones() {
  const [h, setH] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/api/evacuacion/historial'), { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : []).then(setH).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (h.length === 0) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5">
      <h3 className="text-white font-semibold text-[13px] mb-3">Historial de Evacuaciones</h3>
      <p className="text-texto-muted text-sm">No hay evacuaciones registradas aún</p>
    </motion.div>
  );

  const cd = h.slice(0,10).reverse().map(e => ({
    nombre: new Date(e.fechaInicio).toLocaleDateString('es-MX',{day:'2-digit',month:'short'}),
    duracion: Math.round(e.duracionSegundos/60*10)/10, evacuados: e.totalEvacuados, brigadistas: e.brigadistas
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
      className="glass rounded-2xl p-5">
      <h3 className="text-white font-semibold text-[13px] mb-4">Historial de Evacuaciones</h3>
      <div className="h-48 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cd} barGap={1} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
            <XAxis dataKey="nombre" stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} width={25} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(24,24,27,0.9)', backdropFilter: 'blur(10px)', border: '1px solid #27272A', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Bar dataKey="duracion" name="Min" fill="#1D9E75" radius={[4,4,0,0]} />
            <Bar dataKey="evacuados" name="Evacuados" fill="#22C55E" radius={[4,4,0,0]} />
            <Bar dataKey="brigadistas" name="Brigadistas" fill="#F59E0B" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-0">
        {h.slice(0,5).map(e => (
          <div key={e.id} className="flex items-center justify-between py-2.5 border-b border-bordes/30 last:border-0">
            <div>
              <p className="text-white text-[13px] font-medium">{new Date(e.fechaInicio).toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'})}</p>
              <p className="text-texto-muted text-[11px]">{new Date(e.fechaInicio).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}</p>
            </div>
            <div className="text-right">
              <p className="text-primario text-[13px] font-semibold">{fmt(e.duracionSegundos)}</p>
              <p className="text-texto-muted text-[11px]">{e.totalEvacuados}/{e.totalEnPlanta} evacuados</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
