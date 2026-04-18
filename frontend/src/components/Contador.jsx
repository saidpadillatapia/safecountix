export default function Contador({ total, brigadistas, proveedores }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-paneles rounded-lg p-6 border border-primario/20 text-center">
        <p className="text-gray-400 text-sm uppercase tracking-wide">En planta</p>
        <p className="text-6xl font-bold text-primario mt-2">{total}</p>
        <p className="text-gray-500 text-sm mt-1">personas</p>
      </div>
      <div className="bg-paneles rounded-lg p-6 border border-primario/20 text-center">
        <p className="text-gray-400 text-sm uppercase tracking-wide">Brigadistas</p>
        <p className="text-4xl font-bold text-yellow-400 mt-2">{brigadistas}</p>
        <p className="text-gray-500 text-sm mt-1">activos</p>
      </div>
      <div className="bg-paneles rounded-lg p-6 border border-primario/20 text-center">
        <p className="text-gray-400 text-sm uppercase tracking-wide">Proveedores</p>
        <p className="text-4xl font-bold text-blue-400 mt-2">{proveedores}</p>
        <p className="text-gray-500 text-sm mt-1">en planta</p>
      </div>
    </div>
  );
}
