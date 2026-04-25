import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl, getAuthHeaders } from '../services/api.js';

const nivelColors = {
  info: 'bg-blue-900/30 border-blue-500/50 text-blue-300',
  warning: 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300',
  critical: 'bg-red-900/30 border-red-500/50 text-red-300'
};

const nivelLabels = { info: 'Info', warning: 'Advertencia', critical: 'Crítica' };

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function fetchAlertas() {
    try {
      const res = await fetch(apiUrl('/api/alertas'), { headers: getAuthHeaders() });
      if (res.status === 401) { navigate('/login'); return; }
      if (res.ok) setAlertas(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchAlertas(); }, []);

  async function handleMarcarLeida(id) {
    await fetch(apiUrl(`/api/alertas/${id}/leida`), { method: 'PUT', headers: getAuthHeaders() });
    fetchAlertas();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Cargando alertas...</p></div>;

  const noLeidas = alertas.filter(a => !a.leida);
  const leidas = alertas.filter(a => a.leida);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Alertas Activas</h1>

      {noLeidas.length === 0 && <div className="bg-paneles rounded-lg border border-primario/20 p-6 text-center"><p className="text-gray-500">No hay alertas activas</p></div>}

      <div className="space-y-3">
        {noLeidas.map(a => (
          <div key={a.id} className={`rounded-lg border p-4 flex items-center justify-between ${nivelColors[a.nivel] || nivelColors.warning}`}>
            <div>
              <p className="font-medium">{a.mensaje}</p>
              <p className="text-xs opacity-70 mt-1">{nivelLabels[a.nivel]} · {new Date(a.fechaCreada).toLocaleString('es-MX')}</p>
            </div>
            <button onClick={() => handleMarcarLeida(a.id)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors">
              Marcar leída
            </button>
          </div>
        ))}
      </div>

      {leidas.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-400 mt-8">Historial</h2>
          <div className="space-y-2">
            {leidas.map(a => (
              <div key={a.id} className="bg-paneles rounded-lg border border-gray-700/50 p-3 opacity-60">
                <p className="text-gray-400 text-sm">{a.mensaje}</p>
                <p className="text-gray-600 text-xs mt-1">{new Date(a.fechaCreada).toLocaleString('es-MX')}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
