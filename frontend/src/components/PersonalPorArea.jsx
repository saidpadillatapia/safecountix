import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#1D9E75', '#4ade80', '#facc15', '#60a5fa', '#f87171', '#a78bfa', '#fb923c', '#34d399'];

export default function PersonalPorArea({ empleados }) {
  // Count by department
  const porDepto = {};
  empleados.forEach(emp => {
    const depto = emp.departamento || 'Sin departamento';
    porDepto[depto] = (porDepto[depto] || 0) + 1;
  });

  const data = Object.entries(porDepto).map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return (
      <div className="bg-paneles rounded-lg border border-primario/20 p-4">
        <h3 className="text-white font-semibold mb-3">Personal por Área</h3>
        <p className="text-gray-500 text-sm">No hay personal en planta</p>
      </div>
    );
  }

  return (
    <div className="bg-paneles rounded-lg border border-primario/20 p-4">
      <h3 className="text-white font-semibold mb-3">Personal por Área</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#122B23', border: '1px solid #1D9E75', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
