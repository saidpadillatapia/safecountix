import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BrigadistasList from '../components/BrigadistasList.jsx';
import { onConteoActualizado, onEvacuacionActivada } from '../services/socket.js';
import { apiUrl, getAuthHeaders } from '../services/api.js';

const tipoColors = {
  empleado: 'bg-primario/10 text-primario border border-primario/20',
  brigadista: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  proveedor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
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
        const [r1, r2] = await Promise.all([
          fetch(apiUrl('/api/evacuacion/en-planta'), { headers: getAuthHeaders() }),
          fetch(apiUrl('/api/evacuacion/brigadistas'), { headers: getAuthHeaders() })
        ]);
        if (r1.status === 401) { navigate('/login'); return; }
        const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
        setEnPlanta(d1); setInitialCount(d1.length);
        setBrigadistas(d2); setInitialBrigadistas(d2.length);
        setStartTime(new Date());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (!startTime || finished) return;
    timerRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsedSeconds(diff);
      setElapsed(`${String(Math.floor(diff/3600)).padStart(2,'0')}:${String(Math.floor((diff%3600)/60)).padStart(2,'0')}:${String(diff%60).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [startTime, finished]);

  useEffect(() => {
    if (finished) return;
    const u1 = onConteoActualizado(() => {
      fetch(apiUrl('/api/evacuacion/en-planta'), { headers: getAuthHeaders() }).then(r=>r.json()).then(setEnPlanta).catch(console.error);
      fetch(apiUrl('/api/evacuacion/brigadistas'), { headers: getAuthHeaders() }).then(r=>r.json()).then(setBrigadistas).catch(console.error);
    });
    const u2 = onEvacuacionActivada((data) => {
      if (data.listaEnPlanta) setEnPlanta(data.listaEnPlanta);
      if (data.timestamp && !startTime) setStartTime(new Date(data.timestamp));
    });
    return () => { u1(); u2(); };
  }, [startTime, finished]);

  async function handleDownloadPdf() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('/api/evacuacion/pdf'), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Error');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'reporte-emergencia.pdf'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  }

  function handleMarkEvacuated(id) {
    const emp = enPlanta.find(e => e.id === id);
    if (emp) { setEnPlanta(p => p.filter(e => e.id !== id)); setEvacuados(p => [...p, emp]); }
  }

  async function handleFinish() {
    if (!confirm('¿Finalizar la evacuación?')) return;
    clearInterval(timerRef.current); setFinished(true); setSaving(true);
    try {
      await fetch(apiUrl('/api/evacuacion/finalizar'), {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ fechaInicio: startTime.toISOString(), duracionSegundos: elapsedSeconds, totalEnPlanta: initialCount, totalEvacuados: evacuados.length, brigadistas: initialBrigadistas })
      });
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  const tabs = [
    { id: 'en-planta', label: 'En planta', count: enPlanta.length },
    { id: 'evacuados', label: 'Evacuados', count: evacuados.length },
    { id: 'brigadistas', label: 'Brigadistas', count: brigadistas.length }
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (finished) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">✅</span></div>
          <h1 className="text-2xl font-bold text-emerald-400">Evacuación Finalizada</h1>
          <p className="text-texto-muted text-sm mt-2">Resumen guardado exitosamente</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Duración', value: elapsed, color: 'text-white' },
            { label: 'En planta al inicio', value: initialCount, color: 'text-primario' },
            { label: 'Evacuados', value: evacuados.length, color: 'text-emerald-400' },
            { label: 'Brigadistas', value: initialBrigadistas, color: 'text-amber-400' }
          ].map(s => (
            <div key={s.label} className="bg-paneles rounded-2xl border border-bordes p-5 text-center">
              <p className="text-texto-muted text-xs uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-bold mt-2 ${s.color} tabular-nums`}>{s.value}</p>
            </div>
          ))}
        </div>
        {enPlanta.length > 0 && (
          <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-5">
            <h3 className="text-red-400 font-semibold text-sm mb-3">⚠️ Personal NO evacuado ({enPlanta.length})</h3>
            <div className="space-y-1">{enPlanta.map(e => <p key={e.id} className="text-red-300 text-sm">{e.nombre} — {e.departamento}</p>)}</div>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={handleDownloadPdf} className="bg-primario hover:bg-primario-hover text-white font-semibold py-2.5 px-5 rounded-xl transition-all text-sm">📄 Descargar PDF</button>
          <button onClick={() => navigate('/dashboard')} className="bg-white/5 hover:bg-white/10 text-texto border border-bordes font-medium py-2.5 px-5 rounded-xl transition-all text-sm">Volver al Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Emergency header */}
      <div className="bg-gradient-to-r from-red-950/60 to-red-900/30 border border-red-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <h1 className="text-2xl font-bold text-red-400 tracking-tight">MODO EVACUACIÓN</h1>
            </div>
            <p className="text-texto-muted text-sm">Tiempo: <span className="font-mono text-white text-lg font-semibold">{elapsed}</span></p>
          </div>
          <div className="text-center">
            <p className="text-red-400/70 text-xs uppercase tracking-wider">Personas en planta</p>
            <p className="text-6xl font-bold text-red-400 tabular-nums">{enPlanta.length}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button onClick={handleDownloadPdf} className="bg-white/5 hover:bg-white/10 text-texto border border-bordes font-medium py-2 px-4 rounded-xl transition-all text-xs">📄 PDF</button>
              <button onClick={() => navigate('/dashboard')} className="bg-white/5 hover:bg-white/10 text-texto border border-bordes font-medium py-2 px-4 rounded-xl transition-all text-xs">Volver</button>
            </div>
            <button onClick={handleFinish} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm">✅ Fin de Evacuación</button>
          </div>
        </div>
      </div>

      <input type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
        className="w-full px-4 py-3 bg-paneles border border-bordes rounded-xl text-white placeholder-texto-muted/50 focus:outline-none focus:border-primario focus:ring-1 focus:ring-primario/30 transition-all text-sm" />

      <div className="flex gap-1 border-b border-bordes">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-all border-b-2 ${activeTab === tab.id ? 'border-primario text-primario' : 'border-transparent text-texto-muted hover:text-texto'}`}>
            {tab.label} <span className="ml-1 text-[10px] bg-white/5 px-1.5 py-0.5 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="bg-paneles rounded-2xl border border-bordes divide-y divide-bordes/50">
        {activeTab === 'en-planta' && enPlanta.filter(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
          <div key={emp.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
            <div>
              <p className="text-white text-sm font-medium">{emp.nombre}</p>
              <p className="text-texto-muted text-xs">{emp.departamento} · {emp.turno}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tipoColors[emp.tipo]}`}>{emp.tipo}</span>
              <button onClick={() => handleMarkEvacuated(emp.id)} className="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg transition-all">✓ Evacuado</button>
            </div>
          </div>
        ))}
        {activeTab === 'evacuados' && (evacuados.length === 0
          ? <p className="text-texto-muted text-sm p-5">Nadie marcado como evacuado aún</p>
          : evacuados.filter(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
            <div key={emp.id} className="flex items-center justify-between px-5 py-3">
              <div><p className="text-emerald-300 text-sm font-medium">{emp.nombre}</p><p className="text-emerald-500/50 text-xs">{emp.departamento}</p></div>
              <span className="text-emerald-400 text-xs">✓ Evacuado</span>
            </div>
          ))
        )}
        {activeTab === 'brigadistas' && <div className="p-4"><BrigadistasList brigadistas={brigadistas} searchTerm={searchTerm} /></div>}
      </div>
    </div>
  );
}
