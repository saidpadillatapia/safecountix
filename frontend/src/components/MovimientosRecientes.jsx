import { motion } from 'framer-motion';

const tipoConfig = {
  entrada: { label: 'Entrada', dot: 'bg-success', pill: 'bg-success/10 text-success border border-success/20' },
  salida: { label: 'Salida', dot: 'bg-danger', pill: 'bg-danger/10 text-danger border border-danger/20' },
  salida_automatica: { label: 'Auto', dot: 'bg-warning', pill: 'bg-warning/10 text-warning border border-warning/20' }
};

function getInitials(name) {
  if (!name) return '??';
  const p = name.split(' ');
  return (p[0]?.[0] || '') + (p[1]?.[0] || '');
}

export default function MovimientosRecientes({ movimientos }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="glass rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-bordes/50">
        <h3 className="text-white font-semibold text-[13px]">Últimos movimientos</h3>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {movimientos.length === 0 ? (
          <p className="text-texto-muted text-sm p-5">Sin movimientos recientes</p>
        ) : movimientos.map((mov, i) => {
          const cfg = tipoConfig[mov.tipo] || tipoConfig.entrada;
          const nombre = mov.empleado?.nombre || 'Desconocido';
          return (
            <motion.div key={mov.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.03] transition-all duration-200 border-b border-bordes/30 last:border-0">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-bordes flex items-center justify-center flex-shrink-0">
                <span className="text-texto-muted text-[10px] font-semibold">{getInitials(nombre)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-medium truncate">{nombre}</p>
                <p className="text-texto-muted text-[11px]">{mov.puerta}</p>
              </div>
              <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${cfg.pill}`}>{cfg.label}</span>
                <span className="text-texto-muted text-[10px]">
                  {new Date(mov.fechaHora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
