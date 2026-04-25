import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#1D9E75', '#34d399', '#facc15', '#60a5fa', '#f87171', '#a78bfa', '#fb923c', '#2dd4bf'];

export default function PersonalPorArea({ empleados }) {
  const porDepto = {};
  empleados.forEach(emp => {
    const depto = emp.departamento || 'Sin departamento';
    porDepto[depto] = (porDepto[depto] || 0) + 1;
  });
  const data = Object.entries(porDepto).map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return (
      <div className="bg-paneles rounded-2xl border border-bordes p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Personal por Área</h3>
        <p className="text-texto-muted text-sm">No hay personal en planta</p>
      </div>
    );
  }

  return (
    <div className="bg-paneles rounded-2xl border border-bordes p-5">
      <h3 className="text-white font-semibold text-sm mb-4">Personal por Área</h3>
      <div className="flex items-center gap-6">
        <div className="h-52 w-52 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111916', border: '1px solid #1E2D27', borderRadius: '12px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 flex-1">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-texto text-xs">{item.name}</span>
              </div>
              <span className="text-white text-xs font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
