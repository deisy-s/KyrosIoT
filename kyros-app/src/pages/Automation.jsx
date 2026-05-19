import { useState, useEffect, useCallback } from 'react';
import { insforge } from '../lib/insforge';
import '../App.css';

// ── Mapeos UI ↔ DB ──────────────────────────────────────────────────────────

const METRICAS = [
  { label: 'Temperatura',     db: 'temperatura', unidad: '°C',  icono: 'device_thermostat' },
  { label: 'Humo / Gases',    db: 'humo',        unidad: 'ppm', icono: 'detector_smoke'    },
  { label: 'Humedad Relativa',db: 'humedad',      unidad: '%',   icono: 'water_drop'        },
];

const CONDICIONES = [
  { label: 'Mayor a', db: '>' },
  { label: 'Menor a', db: '<' },
  { label: 'Igual a', db: '=' },
];

const ACTUADORES = [
  { id: 1, nombre: 'Alimentación Principal', sector: 'Línea de producción 1', equipo: 'Alimentación Principal (Fuerza)', icono: 'precision_manufacturing', descripcion: 'Corte de energía de emergencia.' },
  { id: 2, nombre: 'Extractores',            sector: 'Montaje de cables',     equipo: 'Sistema de Extracción de Aire',  icono: 'air',                    descripcion: 'Control manual de ventilación.' },
  { id: 3, nombre: 'Sirena de Emergencia',   sector: 'Planta General',        equipo: 'Alarma de Evacuación',           icono: 'campaign',               descripcion: 'Sirena estroboscópica de nivel 3.' },
  { id: 4, nombre: 'Luces de Seguridad',     sector: 'Almacén de componentes',equipo: 'Iluminación de Seguridad',       icono: 'lightbulb',              descripcion: 'Reflectores de contingencia.' },
];

const metricaLabel = (db) => METRICAS.find(m => m.db === db)?.label ?? db;
const metricaUnidad = (db) => METRICAS.find(m => m.db === db)?.unidad ?? '';
const metricaIcono  = (db) => METRICAS.find(m => m.db === db)?.icono ?? 'sensors';
const condicionLabel = (db) => CONDICIONES.find(c => c.db === db)?.label ?? db;
const actuadorNombre = (id) => ACTUADORES.find(a => a.id === id)?.nombre ?? `Relé ${id}`;

const FORM_DEFAULT = { metrica: 'temperatura', condicion: '>', valor: '', accion: 'encender', actuador_id: 1 };

// ────────────────────────────────────────────────────────────────────────────

const Automation = () => {
  const [activeTab, setActiveTab] = useState('rules');

  const getUser = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user')) ?? {};
      return { ...u, companyId: u.companyId ?? u.id };
    }
    catch { return {}; }
  };

  // ── Estado: reglas ─────────────────────────────────────────────────────────
  const [reglas, setReglas] = useState([]);
  const [loadingReglas, setLoadingReglas] = useState(true);
  const [errorReglas, setErrorReglas] = useState(null);
  const [nuevaRegla, setNuevaRegla] = useState(FORM_DEFAULT);
  const [guardando, setGuardando] = useState(false);

  // ── Estado: relay_states ───────────────────────────────────────────────────
  const [relayStates, setRelayStates] = useState({});
  const [loadingRelay, setLoadingRelay] = useState(true);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  const cargarReglas = useCallback(async () => {
    const { companyId } = getUser();
    if (!companyId) { setLoadingReglas(false); return; }

    setLoadingReglas(true);
    const { data, error } = await insforge
      .from('rules')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) setErrorReglas(error.message);
    else setReglas(data ?? []);
    setLoadingReglas(false);
  }, []);

  const cargarRelayStates = useCallback(async () => {
    const { companyId } = getUser();
    if (!companyId) { setLoadingRelay(false); return; }

    setLoadingRelay(true);
    const { data } = await insforge
      .from('relay_states')
      .select('*')
      .eq('company_id', companyId);

    if (data) {
      const mapa = {};
      data.forEach(r => { mapa[r.relay_id] = r.estado; });
      setRelayStates(mapa);
    }
    setLoadingRelay(false);
  }, []);

  useEffect(() => {
    cargarReglas();
    cargarRelayStates();
  }, [cargarReglas, cargarRelayStates]);

  // ── CRUD reglas ────────────────────────────────────────────────────────────
  const agregarRegla = async (e) => {
    e.preventDefault();
    if (!nuevaRegla.valor) return;

    const { companyId } = getUser();
    if (!companyId) return;

    setGuardando(true);
    const { error } = await insforge.from('rules').insert({
      company_id:  companyId,
      metrica:     nuevaRegla.metrica,
      condicion:   nuevaRegla.condicion,
      valor:       Number(nuevaRegla.valor),
      accion:      nuevaRegla.accion,
      actuador_id: Number(nuevaRegla.actuador_id),
      activa:      true,
    });

    if (!error) {
      setNuevaRegla(FORM_DEFAULT);
      await cargarReglas();
    }
    setGuardando(false);
  };

  const toggleRegla = async (regla) => {
    await insforge.from('rules').update({ activa: !regla.activa }).eq('id', regla.id);
    setReglas(prev => prev.map(r => r.id === regla.id ? { ...r, activa: !r.activa } : r));
  };

  const eliminarRegla = async (id) => {
    await insforge.from('rules').delete().eq('id', id);
    setReglas(prev => prev.filter(r => r.id !== id));
  };

  // ── Control manual ─────────────────────────────────────────────────────────
  const toggleRele = async (relayId) => {
    const { companyId } = getUser();
    if (!companyId) return;

    const nuevoEstado = !relayStates[relayId];
    setRelayStates(prev => ({ ...prev, [relayId]: nuevoEstado }));

    await insforge.from('relay_states').upsert(
      { company_id: companyId, relay_id: relayId, estado: nuevoEstado, updated_at: new Date().toISOString() },
      { onConflict: 'company_id,relay_id' }
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-surface min-h-screen">
      <main className="pt-25 px-6 md:px-12 pb-12 w-full">
        <header className="mb-10">
          <h1 className="text-on-surface tracking-[-0.04em] leading-tight">Centro de Control</h1>
          <p className="text-on-surface-variant text-base max-w-xl mt-2 mb-8">
            Gestiona los actuadores físicos y define reglas de comportamiento autónomo para la planta.
          </p>

          <div className="flex border-b border-outline-variant/20">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-6 py-3 font-bold text-sm cursor-pointer transition-colors border-b-2 ${activeTab === 'rules' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined align-middle mr-2 text-xl!">psychology</span>
              Reglas Autónomas
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-6 py-3 font-bold cursor-pointer text-sm transition-colors border-b-2 ${activeTab === 'manual' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined align-middle mr-2 text-xl!">pan_tool</span>
              Control Manual (Override)
            </button>
          </div>
        </header>

        {/* ══ PESTAÑA: REGLAS AUTÓNOMAS ══════════════════════════════════════ */}
        {activeTab === 'rules' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Formulario */}
              <div className="lg:col-span-1 bg-surface-container border border-brand-blue/10 rounded-2xl p-6 shadow-sm h-fit">
                <h2 className="text-sm font-bold text-brand-blue uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl!">add_circle</span> Crear Nueva Regla
                </h2>

                <form onSubmit={agregarRegla} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Si la métrica:</label>
                    <select
                      value={nuevaRegla.metrica}
                      onChange={(e) => setNuevaRegla({ ...nuevaRegla, metrica: e.target.value })}
                      className="w-full bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface text-sm outline-none focus:border-brand-blue"
                    >
                      {METRICAS.map(m => <option key={m.db} value={m.db}>{m.label}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Es:</label>
                      <select
                        value={nuevaRegla.condicion}
                        onChange={(e) => setNuevaRegla({ ...nuevaRegla, condicion: e.target.value })}
                        className="w-full bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface text-sm outline-none focus:border-brand-blue"
                      >
                        {CONDICIONES.map(c => <option key={c.db} value={c.db}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="w-1/2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">
                        Valor ({metricaUnidad(nuevaRegla.metrica)}):
                      </label>
                      <input
                        type="number"
                        required
                        value={nuevaRegla.valor}
                        onChange={(e) => setNuevaRegla({ ...nuevaRegla, valor: e.target.value })}
                        placeholder="Ej. 40"
                        className="w-full bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface text-sm outline-none focus:border-brand-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Entonces:</label>
                    <div className="flex gap-3">
                      <select
                        value={nuevaRegla.accion}
                        onChange={(e) => setNuevaRegla({ ...nuevaRegla, accion: e.target.value })}
                        className="w-1/3 bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface text-sm outline-none focus:border-brand-blue capitalize"
                      >
                        <option value="encender">Encender</option>
                        <option value="apagar">Apagar</option>
                      </select>
                      <select
                        value={nuevaRegla.actuador_id}
                        onChange={(e) => setNuevaRegla({ ...nuevaRegla, actuador_id: Number(e.target.value) })}
                        className="w-2/3 bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface text-sm outline-none focus:border-brand-blue"
                      >
                        {ACTUADORES.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={guardando}
                    className="w-full py-3 mt-4 technical-gradient text-white rounded-lg font-bold text-sm shadow-md shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:scale-100"
                  >
                    {guardando ? 'Guardando...' : 'Guardar Regla Lógica'}
                  </button>
                </form>
              </div>

              {/* Lista de reglas */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Reglas en Operación</h2>

                {loadingReglas ? (
                  <div className="p-8 text-center text-on-surface-variant/50 border border-dashed border-outline-variant/30 rounded-2xl">
                    Cargando reglas...
                  </div>
                ) : errorReglas ? (
                  <div className="p-6 text-center text-error border border-error/20 bg-error/5 rounded-2xl text-sm">
                    Error al cargar: {errorReglas}
                  </div>
                ) : reglas.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant/50 border border-dashed border-outline-variant/30 rounded-2xl">
                    No hay automatizaciones configuradas.
                  </div>
                ) : (
                  reglas.map((regla) => (
                    <div
                      key={regla.id}
                      className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border transition-all ${regla.activa ? 'bg-surface-container border-brand-blue/10 shadow-sm' : 'bg-surface-container/30 border-on-surface-variant/50 opacity-60'}`}
                    >
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${regla.activa ? 'bg-brand-blue/10 text-brand-blue' : 'bg-surface text-on-surface-variant'}`}>
                          <span className="material-symbols-outlined">{metricaIcono(regla.metrica)}</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Lógica Condicional</p>
                          <p className="text-on-surface text-sm">
                            SI <span className="font-bold text-brand-blue">{metricaLabel(regla.metrica)}</span> es {condicionLabel(regla.condicion).toLowerCase()} <span className="font-bold text-error">{regla.valor}{metricaUnidad(regla.metrica)}</span>
                          </p>
                          <p className="text-on-surface text-sm">
                            ➔ ENTONCES <span className="font-bold capitalize">{regla.accion}</span> {actuadorNombre(regla.actuador_id)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={() => toggleRegla(regla)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${regla.activa ? 'bg-brand-blue' : 'bg-on-surface-variant'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${regla.activa ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <button
                          onClick={() => eliminarRegla(regla.id)}
                          className="p-2 text-xl! text-outline-variant cursor-pointer hover:text-error hover:bg-error/10 rounded-xl transition-all"
                          title="Eliminar regla"
                        >
                          <span className="align-middle material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ PESTAÑA: CONTROL MANUAL ════════════════════════════════════════ */}
        {activeTab === 'manual' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
            {loadingRelay ? (
              <div className="md:col-span-12 p-8 text-center text-on-surface-variant/50">
                Cargando estados...
              </div>
            ) : (
              ACTUADORES.map((act) => {
                const encendido = relayStates[act.id] ?? false;
                return (
                  <div key={act.id} className="md:col-span-6 lg:col-span-3 bg-surface-container rounded-xl overflow-hidden ambient-glow flex flex-col transition-all hover:-translate-y-1 border border-brand-blue/10 shadow-sm">
                    <div className="relative h-32 bg-surface-container-low flex items-center justify-center border-b border-brand-blue/50">
                      <span className={`material-symbols-outlined text-5xl! transition-colors duration-300 ${encendido ? (act.id === 1 || act.id === 3 ? 'text-error' : 'text-brand-blue') : 'text-on-surface-variant/30'}`}>
                        {act.icono}
                      </span>
                      <div className="absolute top-4 right-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white transition-colors ${encendido ? (act.id === 1 || act.id === 3 ? 'bg-error' : 'bg-brand-blue') : 'bg-on-surface-variant/50'}`}>
                          {encendido ? 'Accionado' : 'En Espera'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{act.sector}</span>
                      <h3 className="text-on-surface font-bold text-xl leading-tight mb-2">{act.equipo}</h3>
                      <p className="text-base text-on-surface-variant mb-6">{act.descripcion}</p>

                      <div className="mt-auto">
                        <button
                          onClick={() => toggleRele(act.id)}
                          className={`w-full py-3 rounded-md font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] transition-all active:scale-95 ${
                            encendido
                              ? 'bg-surface-container text-on-surface border border-outline hover:bg-error/10 hover:text-error hover:border-error'
                              : 'technical-gradient text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {encendido ? 'power_settings_new' : 'play_arrow'}
                          </span>
                          {encendido ? 'Detener Sistema' : 'Forzar Encendido'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Automation;
