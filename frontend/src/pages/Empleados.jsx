import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

const TURNOS = ['manana', 'tarde', 'noche'];
const TIPOS = ['empleado', 'brigadista', 'proveedor'];
const ESPECIALIDADES = ['primeros_auxilios', 'evacuacion', 'comunicacion', 'busqueda'];

const turnoLabels = { manana: 'Mañana', tarde: 'Tarde', noche: 'Noche' };
const tipoLabels = { empleado: 'Empleado', brigadista: 'Brigadista', proveedor: 'Proveedor' };
const especialidadLabels = {
  primeros_auxilios: 'Primeros Auxilios',
  evacuacion: 'Evacuación',
  comunicacion: 'Comunicación',
  busqueda: 'Búsqueda'
};

const emptyForm = {
  nombre: '', numeroTarjeta: '', turno: 'manana',
  departamento: '', tipo: 'empleado', especialidadBrigada: ''
};

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');
  const [filterTurno, setFilterTurno] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterDepto, setFilterDepto] = useState('');
  const navigate = useNavigate();

  async function fetchEmpleados() {
    try {
      const res = await fetch('/api/empleados', { headers: getAuthHeaders() });
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      setEmpleados(data);
    } catch (err) {
      console.error('Error fetching empleados:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchEmpleados(); }, []);

  function handleEdit(emp) {
    setEditingId(emp.id);
    setForm({
      nombre: emp.nombre,
      numeroTarjeta: emp.numeroTarjeta,
      turno: emp.turno,
      departamento: emp.departamento,
      tipo: emp.tipo,
      especialidadBrigada: emp.especialidadBrigada || ''
    });
    setShowForm(true);
    setError('');
  }

  function handleNew() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const body = { ...form };
    if (body.tipo !== 'brigadista') body.especialidadBrigada = null;

    try {
      const url = editingId ? `/api/empleados/${editingId}` : '/api/empleados';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Error al guardar');
        return;
      }

      setShowForm(false);
      fetchEmpleados();
    } catch (err) {
      setError('Error de conexión');
    }
  }

  async function handleDelete(emp) {
    if (!confirm(`¿Estás seguro de desactivar a ${emp.nombre}?`)) return;

    try {
      const res = await fetch(`/api/empleados/${emp.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) fetchEmpleados();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  }

  const departamentos = [...new Set(empleados.map((e) => e.departamento))].sort();

  const filtered = empleados.filter((e) => {
    if (filterTurno && e.turno !== filterTurno) return false;
    if (filterTipo && e.tipo !== filterTipo) return false;
    if (filterDepto && e.departamento !== filterDepto) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Cargando empleados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Gestión de Empleados</h1>
        <button
          onClick={handleNew}
          className="bg-primario hover:bg-primario/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          + Nuevo Empleado
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterTurno}
          onChange={(e) => setFilterTurno(e.target.value)}
          className="bg-paneles border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
        >
          <option value="">Todos los turnos</option>
          {TURNOS.map((t) => <option key={t} value={t}>{turnoLabels[t]}</option>)}
        </select>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="bg-paneles border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => <option key={t} value={t}>{tipoLabels[t]}</option>)}
        </select>
        <select
          value={filterDepto}
          onChange={(e) => setFilterDepto(e.target.value)}
          className="bg-paneles border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
        >
          <option value="">Todos los departamentos</option>
          {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="bg-paneles rounded-lg border border-primario/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h2>
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Nombre</label>
              <input
                type="text" required value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white focus:border-primario focus:ring-1 focus:ring-primario"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Número de Tarjeta</label>
              <input
                type="text" required value={form.numeroTarjeta}
                onChange={(e) => setForm({ ...form, numeroTarjeta: e.target.value })}
                className="w-full px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white focus:border-primario focus:ring-1 focus:ring-primario"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Turno</label>
              <select
                value={form.turno}
                onChange={(e) => setForm({ ...form, turno: e.target.value })}
                className="w-full px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white"
              >
                {TURNOS.map((t) => <option key={t} value={t}>{turnoLabels[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Departamento</label>
              <input
                type="text" required value={form.departamento}
                onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                className="w-full px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white focus:border-primario focus:ring-1 focus:ring-primario"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white"
              >
                {TIPOS.map((t) => <option key={t} value={t}>{tipoLabels[t]}</option>)}
              </select>
            </div>
            {form.tipo === 'brigadista' && (
              <div>
                <label className="block text-gray-300 text-sm mb-1">Especialidad</label>
                <select
                  value={form.especialidadBrigada}
                  onChange={(e) => setForm({ ...form, especialidadBrigada: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white"
                >
                  <option value="">Seleccionar...</option>
                  {ESPECIALIDADES.map((e) => (
                    <option key={e} value={e}>{especialidadLabels[e]}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-primario hover:bg-primario/80 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                {editingId ? 'Guardar Cambios' : 'Crear Empleado'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-paneles rounded-lg border border-primario/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 px-4 py-3 font-medium">Nombre</th>
                <th className="text-left text-gray-400 px-4 py-3 font-medium">Tarjeta</th>
                <th className="text-left text-gray-400 px-4 py-3 font-medium">Turno</th>
                <th className="text-left text-gray-400 px-4 py-3 font-medium">Departamento</th>
                <th className="text-left text-gray-400 px-4 py-3 font-medium">Tipo</th>
                <th className="text-left text-gray-400 px-4 py-3 font-medium">Estado</th>
                <th className="text-right text-gray-400 px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-700/50 hover:bg-fondo/50">
                  <td className="px-4 py-3 text-white">{emp.nombre}</td>
                  <td className="px-4 py-3 text-gray-300 font-mono text-xs">{emp.numeroTarjeta}</td>
                  <td className="px-4 py-3 text-gray-300">{turnoLabels[emp.turno]}</td>
                  <td className="px-4 py-3 text-gray-300">{emp.departamento}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      emp.tipo === 'brigadista' ? 'bg-yellow-900/30 text-yellow-400' :
                      emp.tipo === 'proveedor' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-primario/20 text-primario'
                    }`}>
                      {tipoLabels[emp.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      emp.estadoActual === 'dentro'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {emp.estadoActual === 'dentro' ? 'Dentro' : 'Fuera'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="text-primario hover:text-primario/80 text-xs mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(emp)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No se encontraron empleados</p>
        )}
      </div>
    </div>
  );
}
