import { useState } from 'react';
import '../App.css';

const Shop = () => {
    const [esPremium, setEsPremium] = useState(false);

    // CATÁLOGO DE HARDWARE OFICIAL KYROS
    const productos = [
        { 
            id: 1, 
            nombre: "KYROSYS Core v1", 
            tag: "Puerta de Enlace",
            precio: "$2,499", 
            icono: "router", 
            desc: "Gateway industrial con soporte para 20 nodos y conectividad Wi-Fi Dual Band." 
        },
        { 
            id: 2, 
            nombre: "Pack Monitoreo Base", 
            tag: "Esencial",
            precio: "$3,200", 
            icono: "package_2", 
            desc: "1 Core v1 + 2 Sensores de Temperatura/Humedad. Ideal para áreas pequeñas." 
        },
        { 
            id: 3, 
            nombre: "Pack Monitoreo Premium", 
            tag: "Popular",
            precio: "$5,450", 
            icono: "inventory_2", 
            desc: "1 Core v1 + 4 Sensores (Temp/Hum/Gas). Incluye kit de montaje en riel DIN." 
        },
        { 
            id: 4, 
            nombre: "Pack Monitoreo Ultra", 
            tag: "Industrial",
            precio: "$8,900", 
            icono: "deployed_code", 
            desc: "Sistema completo: Core v1 + 8 Sensores mixtos + Licencia Enterprise por 3 meses." 
        },
        { 
            id: 5, 
            nombre: "Sensor Gas-Humo", 
            tag: "Seguridad",
            precio: "$680", 
            icono: "detector_smoke", 
            desc: "Nodo inalámbrico autónomo con sensor MQ-2 para detección de fugas y principios de incendio." 
        },
        { 
            id: 6, 
            nombre: "Sensor Temperatura-Humedad", 
            tag: "Ambiente",
            precio: "$550", 
            icono: "thermostat", 
            desc: "Módulo de alta precisión para control climático en racks y líneas de producción." 
        },
        { 
            id: 7, 
            nombre: "Sensor de Movimiento", 
            tag: "Intrusión",
            precio: "$620", 
            icono: "motion_sensor", 
            desc: "Sensor PIR de largo alcance para detección de presencia en áreas restringidas." 
        },
        { 
            id: 8, 
            nombre: "Sensor LDR (Luz)", 
            tag: "Eficiencia",
            precio: "$480", 
            icono: "light_mode", 
            desc: "Medición de intensidad lumínica para automatización de luminarias industriales." 
        }
    ];

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                
                {/* ENCABEZADO */}
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-on-surface tracking-[-0.04em] leading-tight">Catálogo de Hardware y Servicios</h1>
                        <p className="text-on-surface-variant text-base mt-2 max-w-xl">
                            Equipa tu planta con dispositivos KYROS de última generación y gestiona tus analíticas.
                        </p>
                    </div>

                    <button 
                        onClick={() => setEsPremium(!esPremium)}
                        className={`px-4 py-2 rounded-full font-bold text-[10px] transition-all border cursor-pointer uppercase tracking-widest ${
                            esPremium ? 'bg-green-500/10 text-green-600 border-green-500/30' : 'bg-brand-blue/10 text-brand-blue border-brand-blue/30'
                        }`}
                    >
                        {esPremium ? "Licencia Enterprise" : "Licencia Starter"}
                    </button>
                </header>

                {/* --- CATÁLOGO DE DISPOSITIVOS --- */}
                <h2 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">inventory</span>
                    Hardware & Sensores Satélite
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {productos.map((prod) => (
                        <div key={prod.id} className="bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden hover:shadow-lg transition-all flex flex-col">
                            <div className="h-36 bg-surface-container-low flex items-center justify-center relative">
                                <span className="material-symbols-outlined text-5xl text-brand-blue/20">
                                    {prod.icono}
                                </span>
                                <span className="absolute top-4 left-4 bg-brand-blue/10 text-brand-blue text-[8px] font-black uppercase px-2 py-1 rounded tracking-tighter">
                                    {prod.tag}
                                </span>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-on-surface font-bold text-sm mb-1">{prod.nombre}</h3>
                                <p className="text-[11px] text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">{prod.desc}</p>
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-on-surface font-black text-sm">{prod.precio} <span className="text-[10px] font-normal text-on-surface-variant">MXN</span></span>
                                    <button className="p-2 bg-brand-blue text-white rounded-lg hover:scale-110 transition-transform cursor-pointer">
                                        <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- PLANES DE SERVICIO --- */}
                <h2 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">cloud_done</span>
                    Planes de Suscripción (SaaS)
                </h2>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-surface-container p-8 rounded-2xl border border-outline-variant/10 flex flex-col justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Plan Actual</span>
                            <h2 className="text-3xl font-black text-on-surface mt-2 tracking-tighter">KYROS Starter</h2>
                            <ul className="mt-6 space-y-3 text-xs text-on-surface">
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-brand-blue text-sm">check_circle</span> Telemetría en vivo</li>
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-brand-blue text-sm">check_circle</span> 3 Cores Máximo</li>
                                <li className="flex items-center gap-2 text-on-surface-variant/30"><span className="material-symbols-outlined text-sm">cancel</span> Analítica de Big Data</li>
                            </ul>
                        </div>
                        <button disabled className="mt-8 w-full py-3 bg-surface-container-low text-on-surface-variant/40 rounded-xl font-bold text-xs border border-outline-variant/10">Licencia en Uso</button>
                    </div>

                    <div className="bg-surface-container p-8 rounded-2xl border-2 border-brand-blue relative overflow-hidden flex flex-col justify-between shadow-xl shadow-brand-blue/5">
                        <div className="absolute top-0 right-0 bg-brand-blue text-white px-4 py-1 text-[9px] font-black uppercase rounded-bl-xl tracking-widest">Enterprise</div>
                        <div>
                            <h2 className="text-3xl font-black text-on-surface mt-2 tracking-tighter">KYROS Enterprise</h2>
                            <ul className="mt-6 space-y-3 text-xs text-on-surface">
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-brand-blue text-sm">check_circle</span> Cores Ilimitados</li>
                                <li className="flex items-center gap-2 font-bold"><span className="material-symbols-outlined text-brand-blue text-sm">psychology</span> Motor Predictivo de Big Data</li>
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-brand-blue text-sm">check_circle</span> Automatización Autónoma</li>
                            </ul>
                        </div>
                        <button className="mt-8 w-full py-3 bg-brand-blue text-white rounded-xl font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">Actualizar Licencia</button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Shop;