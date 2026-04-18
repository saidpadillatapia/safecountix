const tipoColors = {
  entrada: 'text-green-400',
  salida: 'text-red-400',
  salida_automatica: 'text-yellow-400'
};

const tipoLabels = {
  entrada: 'Entrada',
  salida: 'Salida',
  salida_automatica: 'Salida auto.'
};

export default function MovimientosRecientes({ movimientos }) {
  return (
    <div className="bg-paneles rounded-lg border border-primario/20 p-4">
      <h3 className="text-white font-semibold mb-3">Últimos movimientos</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {movimientos.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin movimientos recientes</p>
        ) : (
          movimientos.map((mov) => (
            <div
              key={mov.id}
              className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0"
            >
              <div className="flex-1">
                <p className="text-white text-sm">{mov.empleado?.nombre || 'Desconocido'}</p>
                <p className="text-gray-500 text-xs">{mov.puerta}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${tipoColors[mov.tipo] || 'text-gray-400'}`}>
                  {tipoLabels[mov.tipo] || mov.tipo}
                </p>
                <p className="text-gray-500 text-xs">
                  {new Date(mov.fechaHora).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
