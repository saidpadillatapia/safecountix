const tipoColors = {
  empleado: 'bg-primario/20 text-primario',
  brigadista: 'bg-yellow-900/30 text-yellow-400',
  proveedor: 'bg-blue-900/30 text-blue-400'
};

export default function ListaEnPlanta({ empleados }) {
  return (
    <div className="bg-paneles rounded-lg border border-primario/20 p-4">
      <h3 className="text-white font-semibold mb-3">
        Personal en planta ({empleados.length})
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {empleados.length === 0 ? (
          <p className="text-gray-500 text-sm">Nadie en planta</p>
        ) : (
          empleados.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0"
            >
              <div>
                <p className="text-white text-sm">{emp.nombre}</p>
                <p className="text-gray-500 text-xs">{emp.departamento}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${tipoColors[emp.tipo] || 'bg-gray-700 text-gray-300'}`}
              >
                {emp.tipo}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
