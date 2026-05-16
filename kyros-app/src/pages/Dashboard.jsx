import { useState } from 'react';
import '../App.css';

export default function Dashboard() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    // --- BANCO DE WIDGETS DISPONIBLES (Estilo App Store) ---
    const bibliotecaWidgets = [
        { id: 'w_temp', size: 'col-span-12 md:col-span-6 lg:col-span-4', type: 'metric', title: 'Temperatura Cuarto 2', value: '23.4°C', subtitle: 'Línea de Cableado • Nominal', icon: 'device_thermostat', color: 'text-brand-blue bg-brand-blue/10' },
        { id: 'w_psi', size: 'col-span-12 md:col-span-6 lg:col-span-4', type: 'gauge', title: 'Presión Tanque 4', value: '752 PSI', subtitle: 'Planta Compresores • Estable', icon: 'speed', color: 'text-green-500 bg-green-500/10' },
        { id: 'w_graph', size: 'col-span-12 lg:col-span-8', type: 'chart', title: 'Rendimiento de Producción', value: '+12% Eficiencia', subtitle: 'Gráfica de Tendencia de Planta', icon: 'trending_up', color: 'text-brand-blue bg-brand-blue/10' },
        { id: 'w_core', size: 'col-span-12 md:col-span-6 lg:col-span-4', type: 'status', title: 'Estado KYROSYS Core v1', value: 'Online', subtitle: 'IP: 192.168.5.105', icon: 'router', color: 'text-brand-blue bg-brand-blue/10' },
        { id: 'w_gas', size: 'col-span-12 md:col-span-6 lg:col-span-4', type: 'metric', title: 'Concentración de Gas', value: '45 ppm', subtitle: 'Sector Almacén • Seguro', icon: 'detector_smoke', color: 'text-yellow-500 bg-yellow-500/10' }
    ];

    // --- WIDGETS INSTALADOS EN LA PANTALLA INICIAL ---
    const [widgetsActivos, setWidgetsActivos] = useState([
        { id: 'w_temp', size: 'col-span-12 md:col-span-6 lg:col-span-4', type: 'metric', title: 'Temperatura Cuarto 2', value: '23.4°C', subtitle: 'Línea de Cableado • Nominal', icon: 'device_thermostat', color: 'text-brand-blue bg-brand-blue/10' },
        { id: 'w_psi', size: 'col-span-12 md:col-span-6 lg:col-span-4', type: 'gauge', title: 'Presión Tanque 4', value: '752 PSI', subtitle: 'Planta Compresores • Estable', icon: 'speed', color: 'text-green-500 bg-green-500/10' },
        { id: 'w_graph', size: 'col-span-12 lg:col-span-8', type: 'chart', title: 'Rendimiento de Producción', value: '+12% Eficiencia', subtitle: 'Gráfica de Tendencia de Planta', icon: 'trending_up', color: 'text-brand-blue bg-brand-blue/10' }
    ]);

    // --- LOGICA DE MOVIMIENTO (NUEVO) ---
    const moverWidget = (index, direccion) => {
        const nuevosWidgets = [...widgetsActivos];
        const nuevaPosicion = index + direccion;

        // Verificar límites
        if (nuevaPosicion < 0 || nuevaPosicion >= nuevosWidgets.length) return;

        // Intercambio de posiciones (destructuring assignment)
        [nuevosWidgets[index], nuevosWidgets[nuevaPosicion]] = [nuevosWidgets[nuevaPosicion], nuevosWidgets[index]];
        
        setWidgetsActivos(nuevosWidgets);
    };

    const agregarWidget = (widget) => {
        if (!widgetsActivos.find(w => w.id === widget.id)) {
            setWidgetsActivos([...widgetsActivos, widget]);
        }
    };

    const eliminarWidget = (id) => {
        setWidgetsActivos(widgetsActivos.filter(w => w.id !== id));
    };

    return (
        <div className="bg-surface min-h-screen pb-12">
            {/* ESTILOS DEL "JIGGLE MODE" */}
            <style>{`
                @keyframes phoneWiggle {
                    0% { transform: rotate(-0.5deg); }
                    50% { transform: rotate(0.5deg); }
                    100% { transform: rotate(-0.5deg); }
                }
                .jiggle-mode {
                    animation: phoneWiggle 0.25s infinite ease-in-out;
                    border: 2px dashed #0056D2 !important;
                }
            `}</style>

            <main className="pt-25 px-6 md:px-12 w-full">
                {/* ENCABEZADO */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-on-surface tracking-[-0.04em] leading-tight text-4xl font-bold">Industrial Canvas</h1>
                        <p className="text-on-surface-variant text-base mt-2">
                            Activa el modo personalización para organizar y mover tus paneles de monitoreo.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                                isEditMode 
                                ? 'bg-green-500 text-white shadow-green-500/20' 
                                : 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20 hover:bg-brand-blue hover:text-white'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg">{isEditMode ? 'check_circle' : 'edit_square'}</span>
                            {isEditMode ? 'Listo' : 'Personalizar'}
                        </button>

                        {isEditMode && (
                            <button 
                                onClick={() => setIsLibraryOpen(true)}
                                className="px-5 py-2.5 bg-brand-blue text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-brand-blue/20 transition-all active:scale-95 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">add_box</span>
                                Añadir Widget
                            </button>
                        )}
                    </div>
                </header>

                {/* --- REJILLA DINÁMICA CON REORGANIZACIÓN --- */}
                <div className="grid grid-cols-12 gap-6 items-stretch">
                    {widgetsActivos.map((widget, index) => (
                        <div 
                            key={widget.id} 
                            className={`${widget.size} relative bg-surface-container rounded-2xl p-6 border border-outline-variant/10 shadow-sm transition-all flex flex-col justify-between group ${isEditMode ? 'jiggle-mode shadow-md bg-surface-container-high' : ''}`}
                        >
                            {/* CONTROLES DE MOVIMIENTO Y ELIMINACIÓN (SOLO EN MODO EDICIÓN) */}
                            {isEditMode && (
                                <div className="absolute -top-3 right-2 flex gap-1.5 z-50">
                                    {/* Mover Izquierda */}
                                    <button 
                                        onClick={() => moverWidget(index, -1)}
                                        disabled={index === 0}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all ${index === 0 ? 'bg-surface-container-high text-outline-variant cursor-not-allowed' : 'bg-surface border border-outline-variant/20 text-brand-blue cursor-pointer hover:bg-brand-blue/10 hover:border-brand-blue/30 active:scale-90'}`}
                                        title="Mover a la izquierda"
                                    >
                                        <span className="material-symbols-outlined text-[16px] font-bold">arrow_back</span>
                                    </button>
                                    {/* Mover Derecha */}
                                    <button 
                                        onClick={() => moverWidget(index, 1)}
                                        disabled={index === widgetsActivos.length - 1}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all ${index === widgetsActivos.length - 1 ? 'bg-surface-container-high text-outline-variant cursor-not-allowed' : 'bg-surface border border-outline-variant/20 text-brand-blue cursor-pointer hover:bg-brand-blue/10 hover:border-brand-blue/30 active:scale-90'}`}
                                        title="Mover a la derecha"
                                    >
                                        <span className="material-symbols-outlined text-[16px] font-bold">arrow_forward</span>
                                    </button>
                                    {/* Eliminar (reposicionado ligeramente) */}
                                    <button 
                                        onClick={() => eliminarWidget(widget.id)}
                                        className="w-7 h-7 bg-error text-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 active:scale-90 transition-transform ml-1"
                                        title="Eliminar widget"
                                    >
                                        <span className="material-symbols-outlined text-xs font-black">close</span>
                                    </button>
                                </div>
                            )}

                            <div className="w-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-10 h-10 rounded-xl ${widget.color} flex items-center justify-center shrink-0`}>
                                        <span className="material-symbols-outlined text-xl">{widget.icon}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{widget.subtitle}</span>
                                    </div>
                                </div>
                                <h3 className="text-on-surface font-bold text-base tracking-tight mb-1">{widget.title}</h3>
                            </div>

                            <div className="mt-4 grow flex items-center">
                                {widget.type === 'metric' && (
                                    <span className="text-4xl font-black text-on-surface tracking-tighter">{widget.value}</span>
                                )}
                                {widget.type === 'status' && (
                                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        {widget.value}
                                    </span>
                                )}
                                {widget.type === 'gauge' && (
                                    <div className="flex items-center gap-4 w-full">
                                        <span className="text-4xl font-black text-on-surface tracking-tighter">{widget.value}</span>
                                        <div className="grow bg-surface h-2 rounded-full overflow-hidden border border-outline-variant/10">
                                            <div className="bg-green-500 h-full w-[75%] rounded-full"></div>
                                        </div>
                                    </div>
                                )}
                                {widget.type === 'chart' && (
                                    <div className="w-full h-24 mt-2">
                                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 100">
                                            <path d="M0,80 L50,75 L100,85 L150,60 L200,65 L250,50 L300,55 L350,30 L400,45 L450,50 L500,40" fill="none" stroke="#0056D2" strokeWidth="3" strokeLinecap="round" />
                                            <path d="M0,80 L50,75 L100,85 L150,60 L200,65 L250,50 L300,55 L350,30 L400,45 L450,50 L500,40 L500,100 L0,100 Z" fill="url(#dashGradMove)" className="opacity-10" />
                                            <defs>
                                                <linearGradient id="dashGradMove" x1="0" x2="0" y1="0" y2="1">
                                                    <stop offset="0%" stopColor="#0056D2" />
                                                    <stop offset="100%" stopColor="#0056D2" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* BOTÓN SLOT VACÍO */}
                    {isEditMode && (
                        <div 
                            onClick={() => setIsLibraryOpen(true)}
                            className="col-span-12 md:col-span-6 lg:col-span-4 rounded-2xl border-2 border-dashed border-outline-variant/30 hover:border-brand-blue/50 flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-colors min-h-[160px]"
                        >
                            <span className="material-symbols-outlined text-outline-variant text-3xl mb-2">add_circle</span>
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Añadir Espacio</p>
                        </div>
                    )}
                </div>

                {/* --- LIBRERÍA DE WIDGETS --- */}
                {isLibraryOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-md" onClick={() => setIsLibraryOpen(false)} />
                        <div className="bg-surface-container border border-outline-variant/10 rounded-2xl w-full max-w-xl max-h-[80vh] overflow-y-auto p-6 z-10 shadow-2xl relative">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-on-surface tracking-tight">Biblioteca de KYROS Widgets</h2>
                                <button onClick={() => setIsLibraryOpen(false)} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center cursor-pointer hover:bg-zinc-400/10 transition-colors">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                {bibliotecaWidgets.filter(w => !widgetsActivos.find(a => a.id === w.id)).map((widget) => (
                                    <div key={widget.id} className="bg-surface p-4 rounded-xl border border-outline-variant/10 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl ${widget.color} flex items-center justify-center shrink-0`}>
                                                <span className="material-symbols-outlined">{widget.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-on-surface">{widget.title}</h4>
                                                <p className="text-xs text-on-surface-variant">{widget.subtitle}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => { agregarWidget(widget); setIsLibraryOpen(false); }}
                                            className="px-4 py-2 bg-brand-blue text-white rounded-lg text-xs font-bold cursor-pointer transition-transform active:scale-95 whitespace-nowrap"
                                        >
                                            Instalar
                                        </button>
                                    </div>
                                ))}
                                {bibliotecaWidgets.filter(w => !widgetsActivos.find(a => a.id === w.id)).length === 0 && (
                                    <p className="text-sm text-on-surface-variant text-center py-6">Todos los widgets disponibles ya están en tu dashboard.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}