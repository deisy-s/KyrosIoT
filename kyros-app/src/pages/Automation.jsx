import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../App.css';

const METRICA_MAP = { 'Temperatura': 'temperatura', 'Humo / Gases': 'humo', 'Humedad Relativa': 'humedad' };
const METRICA_REVERSE = { temperatura: 'Temperatura', humo: 'Humo / Gases', humedad: 'Humedad Relativa' };
const CONDICION_MAP = { 'Mayor a': 'mayor', 'Menor a': 'menor', 'Igual a': 'igual' };
const CONDICION_REVERSE = { mayor: 'Mayor a', menor: 'Menor a', igual: 'Igual a' };
const ACTUADOR_MAP = { 'Alimentación Principal': 1, 'Extractores': 2, 'Sirena de Emergencia': 3, 'Luces de Seguridad': 4 };
const ACTUADOR_REVERSE = { 1: 'Alimentación Principal', 2: 'Extractores', 3: 'Sirena de Emergencia', 4: 'Luces de Seguridad' };
const UNIDAD = { temperatura: '°C', humedad: '%', humo: 'ppm' };
const METRICA_ICON = { temperatura: 'device_thermostat', humedad: 'water_drop', humo: 'detector_smoke' };

const Automation = () => {
    const [activeTab, setActiveTab] = useState('rules');
    const [reles, setReles] = useState({ 1: false, 2: false, 3: false, 4: false });
    const [reglas, setReglas] = useState([]);
    const [nuevaRegla, setNuevaRegla] = useState({ metrica: 'Temperatura', condicion: 'Mayor a', valor: '', accion: 'Encender', actuador: 'Extractores' });

    const actuadores = [
        { id: 1, sector: "Línea de producción 1", equipo: "Alimentación Principal (Fuerza)", icono: "precision_manufacturing", descripcion: "Corte de energía de emergencia." },
        { id: 2, sector: "Montaje de cables", equipo: "Sistema de Extracción de Aire", icono: "air", descripcion: "Control manual de ventilación." },
        { id: 3, sector: "Planta General", equipo: "Alarma de Evacuación", icono: "campaign", descripcion: "Sirena estroboscópica de nivel 3." },
        { id: 4, sector: "Almacén de componentes", equipo: "Iluminación de Seguridad", icono: "lightbulb", descripcion: "Reflectores de contingencia." }
    ];

    const fetchReglas = async () => {
        try {
            const { data } = await axios.get('/api/automation/rules');
            setReglas(data);
        } catch (error) {
            console.error("Error cargando reglas:", error);
        }
    };

    useEffect(() => {
        // Cargar estado real de relés desde el servidor
        axios.get('/api/iot/control').then(res => setReles(res.data)).catch(() => {});

        // Cargar reglas persistidas
        fetchReglas();

        // Escuchar cambios de relés en tiempo real
        const socket = io('http://localhost:5000');
        socket.on('relay-cambio', ({ rele, estado }) => {
            setReles(prev => ({ ...prev, [rele]: estado }));
        });
        return () => socket.disconnect();
    }, []);

    const toggleRele = async (id) => {
        const nuevoEstado = !reles[id];
        setReles(prev => ({ ...prev, [id]: nuevoEstado }));
        try {
            await axios.post('/api/iot/control', { rele: id, estado: nuevoEstado });
        } catch (error) {
            console.error("Error enviando el comando:", error);
            setReles(prev => ({ ...prev, [id]: !nuevoEstado }));
        }
    };

    const agregarRegla = async (e) => {
        e.preventDefault();
        if (!nuevaRegla.valor) return;
        try {
            await axios.post('/api/automation/rules', {
                metrica: METRICA_MAP[nuevaRegla.metrica],
                condicion: CONDICION_MAP[nuevaRegla.condicion],
                valor: Number(nuevaRegla.valor),
                accion: nuevaRegla.accion.toLowerCase(),
                actuador: ACTUADOR_MAP[nuevaRegla.actuador]
            });
            fetchReglas();
            setNuevaRegla({ metrica: 'Temperatura', condicion: 'Mayor a', valor: '', accion: 'Encender', actuador: 'Extractores' });
        } catch (error) {
            console.error("Error creando regla:", error);
        }
    };

    const toggleRegla = async (id) => {
        try {
            const { data } = await axios.put(`/api/automation/rules/${id}/toggle`);
            setReglas(prev => prev.map(r => r._id === id ? data : r));
        } catch (error) {
            console.error("Error toggling regla:", error);
        }
    };

    const eliminarRegla = async (id) => {
        try {
            await axios.delete(`/api/automation/rules/${id}`);
            setReglas(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            console.error("Error eliminando regla:", error);
        }
    };

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                <header className="mb-10">
                    <h1 className="text-on-surface tracking-[-0.04em] leading-tight">Centro de Control de Automatizaciones</h1>
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

                {activeTab === 'rules' && (
                    <div className="animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 bg-surface-container border border-brand-blue/10 rounded-2xl p-6 shadow-sm h-fit">
                                <h2 className="text-sm font-bold text-brand-blue uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xl!">add_circle</span> Crear Nueva Regla
                                </h2>
                                <form onSubmit={agregarRegla} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Si la métrica:</label>
                                        <select value={nuevaRegla.metrica} onChange={(e) => setNuevaRegla({ ...nuevaRegla, metrica: e.target.value })} className="w-full bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface text-sm outline-none focus:border-brand-blue">
                                            <option>Temperatura</option>
                                            <option>Humo / Gases</option>
                                            <option>Humedad Relativa</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-1/2">
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Es:</label>
                                            <select value={nuevaRegla.condicion} onChange={(e) => setNuevaRegla({ ...nuevaRegla, condicion: e.target.value })} className="w-full bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface text-sm outline-none focus:border-brand-blue">
                                                <option>Mayor a</option>
                                                <option>Menor a</option>
                                                <option>Igual a</option>
                                            </select>
                                        </div>
                                        <div className="w-1/2">
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Valor:</label>
                                            <input type="number" required value={nuevaRegla.valor} onChange={(e) => setNuevaRegla({ ...nuevaRegla, valor: e.target.value })} placeholder="Ej. 40" className="w-full bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface text-sm outline-none focus:border-brand-blue" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Entonces:</label>
                                        <div className="flex gap-3">
                                            <select value={nuevaRegla.accion} onChange={(e) => setNuevaRegla({ ...nuevaRegla, accion: e.target.value })} className="w-1/3 bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface text-sm outline-none focus:border-brand-blue">
                                                <option>Encender</option>
                                                <option>Apagar</option>
                                            </select>
                                            <select value={nuevaRegla.actuador} onChange={(e) => setNuevaRegla({ ...nuevaRegla, actuador: e.target.value })} className="w-2/3 bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface text-sm outline-none focus:border-brand-blue">
                                                <option>Extractores</option>
                                                <option>Alimentación Principal</option>
                                                <option>Sirena de Emergencia</option>
                                                <option>Luces de Seguridad</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full py-3 mt-4 technical-gradient text-white rounded-lg font-bold text-sm shadow-md shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all">
                                        Guardar Regla Lógica
                                    </button>
                                </form>
                            </div>

                            <div className="lg:col-span-2 space-y-4">
                                <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Reglas en Operación</h2>
                                {reglas.length === 0 ? (
                                    <div className="p-8 text-center text-on-surface-variant/50 border border-dashed border-outline-variant/30 rounded-2xl">
                                        No hay automatizaciones configuradas.
                                    </div>
                                ) : (
                                    reglas.map((regla) => (
                                        <div key={regla._id} className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border transition-all ${regla.activa ? 'bg-surface-container border-brand-blue/10 shadow-sm' : 'bg-surface-container/30 border-on-surface-variant/50 opacity-60'}`}>
                                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${regla.activa ? 'bg-brand-blue/10 text-brand-blue' : 'bg-surface text-on-surface-variant'}`}>
                                                    <span className="material-symbols-outlined">{METRICA_ICON[regla.metrica] || 'sensors'}</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Lógica Condicional</p>
                                                    <p className="text-on-surface text-sm">
                                                        SI <span className="font-bold text-brand-blue">{METRICA_REVERSE[regla.metrica]}</span> es {CONDICION_REVERSE[regla.condicion]?.toLowerCase()} a <span className="font-bold text-error">{regla.valor}{UNIDAD[regla.metrica]}</span>
                                                    </p>
                                                    <p className="text-on-surface text-sm">
                                                        ➔ ENTONCES <span className="font-bold capitalize">{regla.accion}</span> {ACTUADOR_REVERSE[regla.actuador]}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end gap-4">
                                                <button onClick={() => toggleRegla(regla._id)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${regla.activa ? 'bg-brand-blue' : 'bg-on-surface-variant'}`}>
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${regla.activa ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                                <button onClick={() => eliminarRegla(regla._id)} className="p-2 text-xl! text-outline-variant cursor-pointer hover:text-error hover:bg-error/10 rounded-xl transition-all">
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

                {activeTab === 'manual' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in">
                        {actuadores.map((act) => (
                            <div key={act.id} className="md:col-span-6 lg:col-span-3 bg-surface-container rounded-xl overflow-hidden ambient-glow flex flex-col transition-all hover:-translate-y-1 border border-brand-blue/10 shadow-sm">
                                <div className="relative h-32 bg-surface-container-low flex items-center justify-center border-b border-brand-blue/50">
                                    <span className={`material-symbols-outlined text-5xl! transition-colors duration-300 ${reles[act.id] ? (act.id === 1 || act.id === 3 ? 'text-error' : 'text-brand-blue') : 'text-on-surface-variant/30'}`}>
                                        {act.icono}
                                    </span>
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white transition-colors ${reles[act.id] ? (act.id === 1 || act.id === 3 ? 'bg-error' : 'bg-brand-blue') : 'bg-on-surface-variant/50'}`}>
                                            {reles[act.id] ? 'Accionado' : 'En Espera'}
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
                                            className={`w-full py-3 rounded-md font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] transition-all active:scale-95 ${reles[act.id]
                                                ? 'bg-surface-container text-on-surface border border-outline hover:bg-error/10 hover:text-error hover:border-error'
                                                : 'technical-gradient text-white'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-sm">
                                                {reles[act.id] ? 'power_settings_new' : 'play_arrow'}
                                            </span>
                                            {reles[act.id] ? 'Detener Sistema' : 'Forzar Encendido'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Automation;
