const tipoColors = {
  empleado: 'bg-primario/15 text-primario border border-primario/20',
  brigadista: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  proveedor: 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
};

export default function ListaEnPlanta({ empleados }) {
  return (
    <div className="bg-paneles rounded-2xl border border-bordes">
      <div className="px-5 py-4 border-b border-bordes flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Personal en planta</h3>
        <span className="text-primario text-xs font-semibold bg-primario/10 px-2 py-0.5 rounded-full">{empleados.length}</span>
      </div>
      <div className="divide-y divide-bordes/50 max-h-[420px] overflow-y-auto">
        {empleados.length === 0 ? (
          <p className="text-texto-muted text-sm p-5">Nadie en planta</p>
        ) : (
          empleados.map((emp) => (
            <div key={emp.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <div>
                <p className="text-white text-sm font-medium">{emp.nombre}</p>
                <p className="text-texto-muted text-xs">{emp.departamento}</p>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${tipoColors[emp.tipo] || 'bg-gray-700 text-gray-300'}`}>
                {emp.tipo}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
