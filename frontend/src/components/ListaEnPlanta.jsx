import { motion } from 'framer-motion';

const tipoColors = {
  empleado: 'bg-primario/10 text-primario border border-primario/20',
  brigadista: 'bg-warning/10 text-warning border border-warning/20',
  proveedor: 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
};

export default function ListaEnPlanta({ empleados }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="glass rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-bordes/50 flex items-center justify-between">
        <h3 className="text-white font-semibold text-[13px]">Personal en planta</h3>
        <span className="text-[11px] font-bold text-primario bg-primario/10 px-2.5 py-0.5 rounded-full border border-primario/20">{empleados.length}</span>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {empleados.length === 0 ? (
          <p className="text-texto-muted text-sm p-5">Nadie en planta</p>
        ) : empleados.map((emp, i) => (
          <motion.div key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
            className="flex items-center justify-between px-5 py-2.5 hover:bg-white/[0.03] transition-all duration-200 border-b border-bordes/30 last:border-0">
            <div>
              <p className="text-white text-[13px] font-medium">{emp.nombre}</p>
              <p className="text-texto-muted text-[11px]">{emp.departamento}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${tipoColors[emp.tipo] || ''}`}>{emp.tipo}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
