import { motion } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

export default function Contador({ total, brigadistas, proveedores }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <motion.div variants={item} className="glass rounded-2xl p-8 text-center relative overflow-hidden glow-green">
        <div className="absolute inset-0 bg-gradient-to-br from-primario/8 via-transparent to-transparent" />
        <p className="text-texto-muted text-[11px] font-semibold uppercase tracking-widest relative">En planta</p>
        <p className="text-7xl font-bold text-white mt-3 relative tabular-nums count-animate">{total}</p>
        <p className="text-texto-muted text-[11px] mt-2 relative">personas ahora mismo</p>
      </motion.div>
      <motion.div variants={item} className="glass rounded-2xl p-6 text-center">
        <p className="text-texto-muted text-[11px] font-semibold uppercase tracking-widest">Brigadistas</p>
        <p className="text-4xl font-bold text-warning mt-3 tabular-nums count-animate">{brigadistas}</p>
        <p className="text-texto-muted text-[11px] mt-2">activos</p>
      </motion.div>
      <motion.div variants={item} className="glass rounded-2xl p-6 text-center">
        <p className="text-texto-muted text-[11px] font-semibold uppercase tracking-widest">Proveedores</p>
        <p className="text-4xl font-bold text-blue-400 mt-3 tabular-nums count-animate">{proveedores}</p>
        <p className="text-texto-muted text-[11px] mt-2">en planta</p>
      </motion.div>
    </motion.div>
  );
}
