const especialidadLabels = {
  primeros_auxilios: 'Primeros Auxilios',
  evacuacion: 'Evacuación',
  comunicacion: 'Comunicación',
  busqueda: 'Búsqueda'
};

export default function BrigadistasList({ brigadistas, searchTerm = '' }) {
  const filtered = brigadistas.filter((b) =>
    b.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay brigadistas en planta</p>
      ) : (
        filtered.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between py-2 px-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30"
          >
            <div>
              <p className="text-white text-sm font-medium">{b.nombre}</p>
              <p className="text-yellow-400 text-xs">
                {especialidadLabels[b.especialidadBrigada] || b.especialidadBrigada}
              </p>
            </div>
            <span className="text-yellow-400 text-xs px-2 py-1 bg-yellow-900/40 rounded-full">
              Brigadista
            </span>
          </div>
        ))
      )}
    </div>
  );
}
