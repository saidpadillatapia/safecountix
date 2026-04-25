import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl, getAuthHeaders } from '../services/api.js';

export default function Visitantes() {
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', empresaOrigen: '', motivo: '', acceso: 'peatonal' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function fetchVisitantes() {
    try {
      const res = await fetch(apiUrl('/api/visitantes'), { headers: getAuthHeaders() });
      if (res.status === 401) { navigate('/login'); return; }
      if (res.ok) setVisitantes(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchVisitantes(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch(apiUrl('/api/visitantes'), {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(form)
    });
    if (!res.ok) { setError('Error al registrar visitante'); return; }
    setShowForm(false);
    setForm({ nombre: '', empresaOrigen: '', motivo: '', acceso: 'peatonal' });
    fetchVisitantes();
  }

  async function handleSalida(id) {
    await fetch(apiUrl(`/api/visitantes/${id}/salida`), { method: 'PUT', headers: getAuthHeaders() });
    fetchVisitantes();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Cargando visitantes...</p></div>;

  const dentro = visitantes.filter(v => v.estado === 'dentro');
  const fuera = visitantes.filter(v => v.estado === 'fuera');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Control de Visitantes y Contratistas</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-primario hover:bg-primario/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          + Registrar Visitante
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-paneles rounded-lg border border-primario/20 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {error && <div className="md:col-span-2 bg-red-900/50 border border-red-500 text-red-300 px-4 py-2 rounded">{error}</div>}
          <input type="text" placeholder="Nombre completo" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
            className="px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white focus:border-primario" />
          <input type="text" placeholder="Empresa de origen" required value={form.empresaOrigen} onChange={e => setForm({...form, empresaOrigen: e.target.value})}
            className="px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white focus:border-primario" />
          <input type="text" placeholder="Motivo de visita" required value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})}
            className="px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white focus:border-primario" />
          <select value={form.acceso} onChange={e => setForm({...form, acceso: e.target.value})}
            className="px-3 py-2 bg-fondo border border-gray-600 rounded-md text-white">
            <option value="peatonal">Puerta Peatonal</option>
            <option value="vehicular">Puerta Vehicular</option>
          </select>
          <div className="md:col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 text-white py-2 px-4 rounded-md">Cancelar</button>
            <button type="submit" className="bg-primario text-white font-semibold py-2 px-4 rounded-md">Registrar Entrada</button>
          </div>
        </form>
      )}

      {dentro.length > 0 && (
        <div className="bg-paneles rounded-lg border border-primario/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700"><h3 className="text-white font-semibold">En planta ({dentro.length})</h3></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-700">
              <th className="text-left text-gray-400 px-4 py-2">Nombre</th>
              <th className="text-left text-gray-400 px-4 py-2">Empresa</th>
              <th className="text-left text-gray-400 px-4 py-2">Acceso</th>
              <th className="text-left text-gray-400 px-4 py-2">Entrada</th>
              <th className="text-right text-gray-400 px-4 py-2">Acción</th>
            </tr></thead>
            <tbody>
              {dentro.map(v => (
                <tr key={v.id} className="border-b border-gray-700/50">
                  <td className="px-4 py-2 text-white">{v.nombre}</td>
                  <td className="px-4 py-2 text-gray-300">{v.empresaOrigen}</td>
                  <td className="px-4 py-2 text-gray-300">{v.acceso}</td>
                  <td className="px-4 py-2 text-gray-300">{new Date(v.fechaEntrada).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleSalida(v.id)} className="text-xs bg-red-800 hover:bg-red-700 text-red-200 px-3 py-1 rounded transition-colors">
                      Registrar Salida
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fuera.length > 0 && (
        <div className="bg-paneles rounded-lg border border-gray-700/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700"><h3 className="text-gray-400 font-semibold">Historial de hoy ({fuera.length})</h3></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-700">
              <th className="text-left text-gray-500 px-4 py-2">Nombre</th>
              <th className="text-left text-gray-500 px-4 py-2">Empresa</th>
              <th className="text-left text-gray-500 px-4 py-2">Entrada</th>
              <th className="text-left text-gray-500 px-4 py-2">Salida</th>
            </tr></thead>
            <tbody>
              {fuera.map(v => (
                <tr key={v.id} className="border-b border-gray-700/30 opacity-60">
                  <td className="px-4 py-2 text-gray-400">{v.nombre}</td>
                  <td className="px-4 py-2 text-gray-500">{v.empresaOrigen}</td>
                  <td className="px-4 py-2 text-gray-500">{new Date(v.fechaEntrada).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-2 text-gray-500">{v.fechaSalida ? new Date(v.fechaSalida).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {visitantes.length === 0 && <div className="bg-paneles rounded-lg border border-primario/20 p-6 text-center"><p className="text-gray-500">No hay visitantes registrados</p></div>}
    </div>
  );
}
