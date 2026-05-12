import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom';
import '../App.css'

const EditPanel = ({ isOpen, onClose }) => {
    return (
        <div
            className={`fixed inset-0 z-100 transition-all duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
        >
            <div
                className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm"
                onClick={onClose}
            />

            <aside className={`relative ml-auto w-full max-w-lg h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
                }`}>
                <div className="p-8 pb-4">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-left text-brand-blue tracking-tight">
                                Editar Dashboard
                            </h2>
                            <p className="text-sm text-on-surface-variant">
                                Selecciona un widget para agregar al dashboard
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container active:scale-95 transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                        <button
                            className="bg-brand-blue text-white px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer">
                            Todo
                        </button>
                        <button
                            className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer hover:bg-brand-blue hover:text-white">
                            Línea de producción
                        </button>
                        <button
                            className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer hover:bg-brand-blue hover:text-white">
                            Línea de cableado
                        </button>
                    </div>
                </div>
                <div className="grow overflow-y-auto px-8 space-y-4 pb-8">
                    <div
                        className="group relative bg-surface-container rounded-xl p-4 flex gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-brand-blue/5 hover:-translate-y-0.5">
                        <div className="w-24 h-24 rounded-lg bg-surface-container overflow-hidden shrink-0">
                            <img alt="Sensor: Humidity"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                data-alt="Close up of a modern digital humidity sensor display with glowing blue LED numbers in a dark industrial environment"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7TiR3ji0k9oo_8Z8DDGbeTUD0DsaHgMNu73Kwk-cgzd_PyULghlsgfsVEe4h7P3PWtCoIK9ElDFpGV5iS7zpF8YKUqJHsNWIqPLLrD7KgyhQ3dYT0M3_QaSbgo4jRvD9amQw6Vkbv-3FUZxEO3ZsU9ZcoAwEgtHzuJpTwhUag7nR3VjQ-0puvHD1WjYUPWDD93zYmGyvOp3LPxHIHvbfr3XG14EWmg_8hJ-Ixg-usCmVVhVvTXQpxy5UdkqVLWNyfWdMarVBv4fc" />
                        </div>
                        <div className="grow flex flex-col justify-between">
                            <div className="text-left cursor-default">
                                <span
                                    className="text-[10px] font-bold uppercase tracking-widest text-on-surface">Sensor</span>
                                <h4 className="text-on-surface">Sensor de humedad : Línea de
                                    cableado</h4>
                                <p className="text-xs text-on-surface-variant mt-1">Visualización en tiempo real de lecturas
                                    de humedad</p>
                            </div>
                            <button
                                className="mt-2 w-full py-2 bg-surface-container hover:from-brand-blue hover:bg-brand-blue hover:to-brand-light hover:text-white rounded-md text-xs font-bold transition-all flex items-center justify-center cursor-pointer gap-2 group/btn">
                                <span
                                    className="material-symbols-outlined text-sm group-hover/btn:rotate-90 transition-transform">add</span>
                                Agregar a dashboard
                            </button>
                        </div>
                    </div>

                    <div
                        className="group relative bg-surface-container rounded-xl p-4 flex gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-brand-blue/5 hover:-translate-y-0.5">
                        <div className="w-24 h-24 rounded-lg bg-surface-container-low overflow-hidden shrink-0">
                            <div className="w-full h-full bg-brand-blue/5 flex items-center justify-center">
                                <span className="material-symbols-outlined text-brand-blue text-4xl">analytics</span>
                            </div>
                        </div>
                        <div className="grow flex flex-col justify-between">
                            <div className="text-left cursor-default">
                                <span
                                    className="text-[10px] font-bold uppercase tracking-widest text-on-surface">Datos
                                    de rendimiento</span>
                                <h4 className="text-on-surface">Estadísticas : Línea de producción
                                </h4>
                                <p className="text-xs text-on-surface-variant mt-1">Promedio móvil de unidades procesadas
                                    por hora en Línea 1</p>
                            </div>
                            <button
                                className="mt-2 w-full py-2 cursor-pointer bg-surface-container hover:bg-brand-blue hover:from-brand-blue hover:to-brand-light hover:text-white rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn">
                                <span
                                    className="material-symbols-outlined text-sm group-hover/btn:rotate-90 transition-transform">add</span>
                                Agregar a dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

const Dashboard = ({ onOpenPanel }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    return (
        <div className="bg-surface min-h-screen">
            <EditPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
            />
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-on-surface tracking-[-0.04em] leading-tight">Información General de
                                Planta</h1>
                            <div className="flex items-center gap-3">
                                <span
                                    className="flex items-center gap-1.5 px-3 py-1 bg-brand-light/10 text-brand-blue font-bold text-xs rounded-full uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
                                    Sistema activo
                                </span>
                                <span className="text-on-surface-variant text-sm font-medium">Planta: Guasave, Sin.</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsPanelOpen(true)}
                        className="md:w-auto px-8 bg-linear-to-br cursor-pointer from-brand-blue to-brand-light text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        <span className="material-symbols-outlined">add_circle</span>
                        <span>Agregar widget</span>
                    </button>
                </header>

                <div className="grid grid-cols-12 gap-6 items-start">
                    <section className="col-span-12 lg:col-span-8 bg-surface-container rounded-xl p-6 ambient-glow">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <p className="text-[13px] font-bold text-on-surface-variant text-left uppercase tracking-0.1em mb-1">
                                    Métricas Ambientales</p>
                                <h2 className="text-xl text-on-surface">Temperatura en Cuarto 2</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className="text-xl font-black text-brand-blue">23.4°C</span>
                                    <p className="text-[0.6875rem] text-on-surface">Rango Nominal</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-64 relative overflow-hidden rounded-lg bg-surface-container">
                            <svg className="w-full h-full preserve-3d" preserveaspectratio="none" viewbox="0 0 1000 200">
                                <line className="text-outline-variant opacity-10" stroke="currentColor" x1="0" x2="1000" y1="50"
                                    y2="50"></line>
                                <line className="text-outline-variant opacity-10" stroke="currentColor" x1="0" x2="1000" y1="100"
                                    y2="100"></line>
                                <line className="text-outline-variant opacity-10" stroke="currentColor" x1="0" x2="1000" y1="150"
                                    y2="150"></line>
                                <path
                                    d="M0,150 L100,145 L200,160 L300,120 L400,130 L500,100 L600,110 L700,80 L800,95 L900,105 L1000,90"
                                    fill="none" stroke="#003f87" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="3"></path>
                                <path className="opacity-10"
                                    d="M0,150 L100,145 L200,160 L300,120 L400,130 L500,100 L600,110 L700,80 L800,95 L900,105 L1000,90 L1000,200 L0,200 Z"
                                    fill="url(#chartGradient)"></path>
                                <defs>
                                    <lineargradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stop-color="#003f87"></stop>
                                        <stop offset="100%" stop-color="#003f87" stop-opacity="0"></stop>
                                    </lineargradient>
                                </defs>
                            </svg>
                            <div
                                className="absolute bottom-2 w-full flex justify-between px-4 text-[0.6875rem] font-medium text-outline">
                                <span>08:00 AM</span>
                                <span>12:00 PM</span>
                                <span>04:00 PM</span>
                                <span>08:00 PM</span>
                            </div>
                        </div>
                    </section>

                    <section
                        className="col-span-12 lg:col-span-4 bg-surface-container rounded-xl p-6 ambient-glow h-full flex flex-col items-center justify-center text-center">
                        <div className="w-full text-left mb-6">
                            <p className="text-[13px] font-bold text-on-surface-variant uppercase tracking-0.1em mb-1">
                                Tanque de Presión 4</p>
                            <h2 className="text-sm text-on-surface">Estado del Sistema PSI</h2>
                        </div>

                        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle className="text-surface-container-high" cx="96" cy="96" fill="transparent" r="80"
                                    stroke="currentColor" stroke-width="12"></circle>
                                <circle className="text-primary" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor"
                                    stroke-dasharray="502" stroke-dashoffset="125" stroke-linecap="round" stroke-width="12">
                                </circle>
                            </svg>
                            <div className="z-10">
                                <span className="text-4xl font-black text-on-surface">752</span>
                                <p className="text-xs font-bold text-on-surface-variant uppercase">PSI</p>
                            </div>
                        </div>

                        <div className="w-full flex justify-between gap-4">
                            <div className="bg-surface-container px-4 py-2 rounded-lg flex-1">
                                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Mínimo</p>
                                <p className="text-[15px] font-bold text-on-surface">450</p>
                            </div>
                            <div className="bg-surface-container px-4 py-2 rounded-lg flex-1">
                                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Pico</p>
                                <p className="text-[15px] font-bold text-error">920</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

        </div>
    )
}

export default Dashboard
