const especialidadLabels = {
  primeros_auxilios: 'Primeros Auxilios',
  evacuacion: 'Evacuación',
  comunicacion: 'Comunicación',
  busqueda: 'Búsqueda'
};

export default function BrigadistasList({ brigadistas, searchTerm = '' }) {
  const filtered = brigadistas.filter(b => b.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-2">
      {filtered.length === 0 ? (
        <p className="text-texto-muted text-sm">No hay brigadistas en planta</p>
      ) : (
        filtered.map(b => (
          <div key={b.id} className="flex items-center justify-between py-2.5 px-4 bg-amber-500/5 rounded-xl border border-amber-500/15">
            <div>
              <p className="text-white text-sm font-medium">{b.nombre}</p>
              <p className="text-amber-400/70 text-xs">{especialidadLabels[b.especialidadBrigada] || b.especialidadBrigada}</p>
            </div>
            <span className="text-amber-400 text-[10px] font-medium px-2 py-0.5 bg-amber-500/15 border border-amber-500/20 rounded-full">Brigadista</span>
          </div>
        ))
      )}
    </div>
  );
}
