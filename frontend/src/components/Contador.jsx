export default function Contador({ total, brigadistas, proveedores }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Hero number */}
      <div className="bg-paneles rounded-2xl p-8 border border-bordes text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primario/5 to-transparent" />
        <p className="text-texto-muted text-xs font-medium uppercase tracking-wider relative">En planta</p>
        <p className="text-7xl font-bold text-primario mt-3 relative tabular-nums">{total}</p>
        <p className="text-texto-muted text-xs mt-2 relative">personas ahora mismo</p>
      </div>
      <div className="bg-paneles rounded-2xl p-6 border border-bordes text-center">
        <p className="text-texto-muted text-xs font-medium uppercase tracking-wider">Brigadistas</p>
        <p className="text-4xl font-bold text-amber-400 mt-3 tabular-nums">{brigadistas}</p>
        <p className="text-texto-muted text-xs mt-2">activos</p>
      </div>
      <div className="bg-paneles rounded-2xl p-6 border border-bordes text-center">
        <p className="text-texto-muted text-xs font-medium uppercase tracking-wider">Proveedores</p>
        <p className="text-4xl font-bold text-blue-400 mt-3 tabular-nums">{proveedores}</p>
        <p className="text-texto-muted text-xs mt-2">en planta</p>
      </div>
    </div>
  );
}
