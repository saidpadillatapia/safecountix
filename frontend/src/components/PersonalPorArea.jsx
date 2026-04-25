import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#1D9E75', '#34d399', '#F59E0B', '#60a5fa', '#EF4444', '#a78bfa', '#fb923c', '#2dd4bf'];

export default function PersonalPorArea({ empleados }) {
  const porDepto = {};
  empleados.forEach(e => { const d = e.departamento || 'Sin depto'; porDepto[d] = (porDepto[d] || 0) + 1; });
  const data = Object.entries(porDepto).map(([name, value]) => ({ name, value }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className="glass rounded-2xl p-5">
      <h3 className="text-white font-semibold text-[13px] mb-4">Personal por Área</h3>
      {data.length === 0 ? <p className="text-texto-muted text-sm">No hay personal en planta</p> : (
        <div className="flex items-center gap-6">
          <div className="h-44 w-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(24,24,27,0.9)', backdropFilter: 'blur(10px)', border: '1px solid #27272A', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5 flex-1">
            {data.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-texto-secondary text-[12px]">{item.name}</span>
                </div>
                <span className="text-white text-[12px] font-semibold tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
