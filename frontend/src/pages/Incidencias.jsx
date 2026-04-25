import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl, getAuthHeaders } from '../services/api.js';

const nivelColors = { baja: 'text-blue-400', media: 'text-yellow-400', alta: 'text-orange-400', critica: 'text-red-400' };
const estadoColors = { abierta: 'bg-red-900/30 text-red-400', en_proceso: 'bg-yellow-900/30 text-yellow-400', resuelta: 'bg-green-900/30 text-green-400' };
const estadoLabels = { abierta: 'Abierta', en_proceso: 'En proceso', resuelta: 'Resuelta' };

export default function Incidencias() {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', area: '', nivel: 'media' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function fetchIncidencias() {
    try {
      const res = await fetch(apiUrl('/api/incidencias'), { headers: getAuthHeaders() });
      if (res.status === 401) { navigate('/login'); return; }
      if (res.ok) setIncidencias(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchIncidencias(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch(apiUrl('/api/incidencias'), {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(form)
    });
    if (!res.ok) { setError('Error al crear incidencia'); return; }
    setShowForm(false);
    setForm({ titulo: '', descripcion: '', area: '', nivel: 'media' });
    fetchIncidencias();
  }

  async function handleCambiarEstado(id, estado) {
    await fetch(apiUrl(`/api/incidencias/${id}`), {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ estado })
    });
    fetchIncidencias();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Cargando incidencias...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Incidencias</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-primario hover:bg-primario/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          + Nueva Incidencia
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-paneles rounded-lg border border-primario/20 p-6 space-y-4">
          {error && <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-2 rounded">{error}</div>}
          <input type="text" placeholder="Título" required value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})}
            className="w-full px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white focus:border-primario" />
          <textarea placeholder="Descripción" required value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}
            className="w-full px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white focus:border-primario h-24" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Área" required value={form.area} onChange={e => setForm({...form, area: e.target.value})}
              className="px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white focus:border-primario" />
            <select value={form.nivel} onChange={e => setForm({...form, nivel: e.target.value})}
              className="px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white">
              <option value="baja">Baja</option><option value="media">Media</option>
              <option value="alta">Alta</option><option value="critica">Crítica</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 text-white py-2 px-4 rounded-md">Cancelar</button>
            <button type="submit" className="bg-primario text-white font-semibold py-2 px-4 rounded-md">Crear</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {incidencias.length === 0 && <div className="bg-paneles rounded-lg border border-primario/20 p-6 text-center"><p className="text-gray-500">No hay incidencias registradas</p></div>}
        {incidencias.map(inc => (
          <div key={inc.id} className="bg-paneles rounded-lg border border-primario/20 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white font-medium">{inc.titulo}</p>
                <p className="text-gray-400 text-sm mt-1">{inc.descripcion}</p>
                <p className="text-gray-500 text-xs mt-2">{inc.area} · <span className={nivelColors[inc.nivel]}>{inc.nivel}</span> · {new Date(inc.fechaCreada).toLocaleDateString('es-MX')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${estadoColors[inc.estado]}`}>{estadoLabels[inc.estado]}</span>
                {inc.estado === 'abierta' && (
                  <button onClick={() => handleCambiarEstado(inc.id, 'en_proceso')} className="text-xs bg-yellow-800 text-yellow-200 px-2 py-1 rounded">En proceso</button>
                )}
                {inc.estado === 'en_proceso' && (
                  <button onClick={() => handleCambiarEstado(inc.id, 'resuelta')} className="text-xs bg-green-800 text-green-200 px-2 py-1 rounded">Resolver</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
