import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BrigadistasList from '../components/BrigadistasList.jsx';
import { onConteoActualizado, onEvacuacionActivada } from '../services/socket.js';
import { apiUrl, getAuthHeaders } from '../services/api.js';

const tipoColors = {
  empleado: 'bg-primario/20 text-primario border-primario/30',
  brigadista: 'bg-yellow-900/20 text-yellow-400 border-yellow-700/30',
  proveedor: 'bg-blue-900/20 text-blue-400 border-blue-700/30'
};

export default function Evacuacion() {
  const [enPlanta, setEnPlanta] = useState([]);
  const [initialCount, setInitialCount] = useState(0);
  const [evacuados, setEvacuados] = useState([]);
  const [brigadistas, setBrigadistas] = useState([]);
  const [initialBrigadistas, setInitialBrigadistas] = useState(0);
  const [activeTab, setActiveTab] = useState('en-planta');
  const [searchTerm, setSearchTerm] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState('00:00:00');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [enPlantaRes, brigadistasRes] = await Promise.all([
          fetch(apiUrl('/api/evacuacion/en-planta'), { headers: getAuthHeaders() }),
          fetch(apiUrl('/api/evacuacion/brigadistas'), { headers: getAuthHeaders() })
        ]);
        if (enPlantaRes.status === 401) { navigate('/login'); return; }
        const [enPlantaData, brigadistasData] = await Promise.all([
          enPlantaRes.json(), brigadistasRes.json()
        ]);
        setEnPlanta(enPlantaData);
        setInitialCount(enPlantaData.length);
        setBrigadistas(brigadistasData);
        setInitialBrigadistas(brigadistasData.length);
        setStartTime(new Date());
      } catch (error) {
        console.error('Error loading evacuation data:', error);
      } finally { setLoading(false); }
    }
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (!startTime || finished) return;
    timerRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsedSeconds(diff);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [startTime, finished]);

  useEffect(() => {
    if (finished) return;
    const unsubConteo = onConteoActualizado(() => {
      fetch(apiUrl('/api/evacuacion/en-planta'), { headers: getAuthHeaders() })
        .then(r => r.json()).then(d => setEnPlanta(d)).catch(console.error);
      fetch(apiUrl('/api/evacuacion/brigadistas'), { headers: getAuthHeaders() })
        .then(r => r.json()).then(d => setBrigadistas(d)).catch(console.error);
    });
    const unsubEvac = onEvacuacionActivada((data) => {
      if (data.listaEnPlanta) setEnPlanta(data.listaEnPlanta);
      if (data.timestamp && !startTime) setStartTime(new Date(data.timestamp));
    });
    return () => { unsubConteo(); unsubEvac(); };
  }, [startTime, finished]);

  async function handleDownloadPdf() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('/api/evacuacion/pdf'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error generating PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'reporte-emergencia.pdf'; a.click();
      URL.revokeObjectURL(url);
    } catch (error) { console.error('Error downloading PDF:', error); }
  }

  function handleMarkEvacuated(empleadoId) {
    const emp = enPlanta.find(e => e.id === empleadoId);
    if (emp) {
      setEnPlanta(prev => prev.filter(e => e.id !== empleadoId));
      setEvacuados(prev => [...prev, emp]);
    }
  }

  async function handleFinishEvacuation() {
    if (!confirm('¿Estás seguro de finalizar la evacuación?')) return;
    clearInterval(timerRef.current);
    setFinished(true);
    setSaving(true);
    try {
      await fetch(apiUrl('/api/evacuacion/finalizar'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fechaInicio: startTime.toISOString(),
          duracionSegundos: elapsedSeconds,
          totalEnPlanta: initialCount,
          totalEvacuados: evacuados.length,
          brigadistas: initialBrigadistas
        })
      });
    } catch (error) { console.error('Error saving evacuation:', error); }
    finally { setSaving(false); }
  }

  const tabs = [
    { id: 'en-planta', label: 'En planta', count: enPlanta.length },
    { id: 'evacuados', label: 'Evacuados', count: evacuados.length },
    { id: 'brigadistas', label: 'Brigadistas', count: brigadistas.length }
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Cargando datos de evacuación...</p></div>;
  }

  // Summary screen after finishing
  if (finished) {
    return (
      <div className="space-y-6">
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-green-400 mb-2">✅ Evacuación Finalizada</h1>
          <p className="text-gray-300">Resumen de la evacuación</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-paneles rounded-lg p-6 border border-primario/20 text-center">
            <p className="text-gray-400 text-sm">Duración total</p>
            <p className="text-3xl font-bold text-white font-mono mt-2">{elapsed}</p>
          </div>
          <div className="bg-paneles rounded-lg p-6 border border-primario/20 text-center">
            <p className="text-gray-400 text-sm">Personal en planta al inicio</p>
            <p className="text-3xl font-bold text-primario mt-2">{initialCount}</p>
          </div>
          <div className="bg-paneles rounded-lg p-6 border border-primario/20 text-center">
            <p className="text-gray-400 text-sm">Evacuados confirmados</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{evacuados.length}</p>
          </div>
          <div className="bg-paneles rounded-lg p-6 border border-primario/20 text-center">
            <p className="text-gray-400 text-sm">Brigadistas activos</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">{initialBrigadistas}</p>
          </div>
        </div>
        {enPlanta.length > 0 && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-2">⚠️ Personal NO evacuado ({enPlanta.length})</h3>
            <div className="space-y-1">
              {enPlanta.map(emp => (
                <p key={emp.id} className="text-red-300 text-sm">{emp.nombre} — {emp.departamento}</p>
              ))}
            </div>
          </div>
        )}
        {evacuados.length > 0 && (
          <div className="bg-paneles rounded-lg border border-primario/20 p-4">
            <h3 className="text-green-400 font-semibold mb-2">Personal evacuado ({evacuados.length})</h3>
            <div className="space-y-1">
              {evacuados.map(emp => (
                <p key={emp.id} className="text-gray-300 text-sm">✓ {emp.nombre} — {emp.departamento}</p>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={handleDownloadPdf} className="bg-primario hover:bg-primario/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            📄 Descargar PDF
          </button>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Volver al Dashboard
          </button>
        </div>
        {saving && <p className="text-gray-500 text-sm">Guardando registro...</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-red-400">🚨 MODO EVACUACIÓN</h1>
            <p className="text-gray-300 mt-1">Tiempo transcurrido: <span className="font-mono text-white text-xl">{elapsed}</span></p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Personas en planta</p>
            <p className="text-6xl font-bold text-red-400">{enPlanta.length}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <button onClick={handleDownloadPdf} className="bg-primario hover:bg-primario/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                📄 Descargar PDF
              </button>
              <button onClick={() => navigate('/dashboard')} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Volver
              </button>
            </div>
            <button onClick={handleFinishEvacuation} className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full">
              ✅ Fin de Evacuación
            </button>
          </div>
        </div>
      </div>

      <input type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
        className="w-full px-4 py-3 bg-paneles border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-primario focus:ring-1 focus:ring-primario" />

      <div className="flex gap-2 border-b border-gray-700">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-primario text-primario' : 'border-transparent text-gray-400 hover:text-white'}`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="bg-paneles rounded-lg border border-primario/20 p-4">
        {activeTab === 'en-planta' && (
          <div className="space-y-2">
            {enPlanta.filter(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
              <div key={emp.id} className={`flex items-center justify-between py-2 px-3 rounded-lg border ${tipoColors[emp.tipo] || 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                <div>
                  <p className="text-white text-sm font-medium">{emp.nombre}</p>
                  <p className="text-xs opacity-70">{emp.departamento} · {emp.turno}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">{emp.tipo}</span>
                  <button onClick={() => handleMarkEvacuated(emp.id)} className="text-xs bg-green-800 hover:bg-green-700 text-green-200 px-2 py-1 rounded transition-colors">
                    ✓ Evacuado
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'evacuados' && (
          <div className="space-y-2">
            {evacuados.filter(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
              <div key={emp.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-green-900/20 border border-green-700/30">
                <div>
                  <p className="text-green-300 text-sm font-medium">{emp.nombre}</p>
                  <p className="text-green-500 text-xs">{emp.departamento} · {emp.tipo}</p>
                </div>
                <span className="text-green-400 text-xs">✓ Evacuado</span>
              </div>
            ))}
            {evacuados.length === 0 && <p className="text-gray-500 text-sm">Nadie marcado como evacuado aún</p>}
          </div>
        )}
        {activeTab === 'brigadistas' && <BrigadistasList brigadistas={brigadistas} searchTerm={searchTerm} />}
      </div>
    </div>
  );
}
