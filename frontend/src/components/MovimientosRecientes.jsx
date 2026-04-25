const tipoConfig = {
  entrada: { label: 'Entrada', class: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
  salida: { label: 'Salida', class: 'bg-red-500/15 text-red-400 border border-red-500/20' },
  salida_automatica: { label: 'Auto', class: 'bg-amber-500/15 text-amber-400 border border-amber-500/20' }
};

function getInitials(name) {
  if (!name) return '??';
  const parts = name.split(' ');
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
}

export default function MovimientosRecientes({ movimientos }) {
  return (
    <div className="bg-paneles rounded-2xl border border-bordes">
      <div className="px-5 py-4 border-b border-bordes">
        <h3 className="text-white font-semibold text-sm">Últimos movimientos</h3>
      </div>
      <div className="divide-y divide-bordes/50 max-h-[420px] overflow-y-auto">
        {movimientos.length === 0 ? (
          <p className="text-texto-muted text-sm p-5">Sin movimientos recientes</p>
        ) : (
          movimientos.map((mov) => {
            const config = tipoConfig[mov.tipo] || tipoConfig.entrada;
            const nombre = mov.empleado?.nombre || 'Desconocido';
            return (
              <div key={mov.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-full bg-bordes flex items-center justify-center flex-shrink-0">
                  <span className="text-texto-muted text-[10px] font-semibold uppercase">{getInitials(nombre)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{nombre}</p>
                  <p className="text-texto-muted text-xs">{mov.puerta}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${config.class}`}>
                    {config.label}
                  </span>
                  <p className="text-texto-muted text-[11px] mt-1">
                    {new Date(mov.fechaHora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
