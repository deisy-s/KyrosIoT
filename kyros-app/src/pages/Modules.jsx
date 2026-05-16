import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../App.css'

const Modules = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Rescatamos el ID del sector

    // --- ESTADOS ---
    const [sectorName, setSectorName] = useState("");
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- SIMULACIÓN: Obtener los módulos del sector ---
    useEffect(() => {
        if (id) {
            // Aquí se hará la petición real: fetch(`http://localhost:5000/api/sectors/${id}/modules`)
            setSectorName("Línea de Producción"); // Simula el nombre que llega de la DB
            
            // Simula los sensores satélite vinculados a este Core
            setModules([
                { id: 'm1', name: 'Módulo de Temperatura', icon: 'thermostat', status: 'maintenance', detailType: 'Alerta desde', detailValue: '10/05/2026 12:23 PM' },
                { id: 'm2', name: 'Módulo de Gas (MQ-2)', icon: 'detector_co', status: 'active', detailType: 'Lecturas por minuto', detailValue: '12' },
                { id: 'm3', name: 'Módulo de Humedad', icon: 'humidity_mid', status: 'active', detailType: 'Lecturas por minuto', detailValue: '12' }
            ]);
            setLoading(false);
        }
    }, [id]);

    // Ahora le pasamos el ID del módulo específico
    const handleModuleClick = (moduleId) => {
        navigate(`/module-info`); // Si Deisy hace dinámica esta vista, cambiar a: navigate(`/module-info/${moduleId}`)
    };

    const handleTelemetryClick = () => {
        navigate('/telemetry');
    };

    if (loading) return <div className="min-h-screen bg-surface text-white p-10">Cargando módulos...</div>;

    const alertasCriticas = modules.filter(m => m.status === 'maintenance').length;

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                <div className="col-span-12 mb-10 flex justify-between items-end">
                    <div>
                        <nav className="flex items-center gap-2 text-xs font-bold text-brand-blue mb-2 tracking-widest uppercase">
                            <span onClick={handleTelemetryClick} className="text-brand-blue cursor-pointer mr-3 material-symbols-outlined text-[20px]! active:scale-95">arrow_back</span>
                            <span>{sectorName}</span>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span className="text-outline text-on-surface">Módulos</span>
                        </nav>
                        <h1 className="text-4xl font-inter text-on-surface tracking-tighter">Módulos: {sectorName}</h1>
                    </div>
                </div>

                {/* --- TARJETAS DE MÉTRICAS --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-surface-container p-6 rounded-xl ambient-glow">
                        <p className="text-[0.6875rem] text-on-surface-variant font-bold tracking-[3%] mb-1 uppercase">Dispositivos conectados</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-headline font-extrabold text-on-surface leading-none">{modules.length}</span>
                            <span className="text-sm mb-1 text-on-surface">Sensores</span>
                        </div>
                    </div>
                    <div className="bg-surface-container p-6 rounded-xl ambient-glow">
                        <p className="text-[0.6875rem] font-bold text-on-surface-variant tracking-[3%] mb-1 uppercase">Alertas Críticas</p>
                        <div className="flex items-end gap-2">
                            <span className={`text-3xl font-headline font-extrabold leading-none ${alertasCriticas > 0 ? 'text-error' : 'text-green-500'}`}>
                                {alertasCriticas}
                            </span>
                            <span className="text-sm text-on-surface mb-1">
                                {alertasCriticas === 1 ? 'Mantenimiento Requerido' : alertasCriticas > 1 ? 'Mantenimientos Requeridos' : 'Todo en orden'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- LISTA DINÁMICA DE MÓDULOS --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {modules.map((mod) => {
                        const isAlert = mod.status === 'maintenance';
                        const bgColor = isAlert ? 'bg-maintenance/10' : 'bg-brand-blue/10';
                        const iconColor = isAlert ? 'text-maintenance/20' : 'text-brand-blue/30';
                        const badgeBg = isAlert ? 'bg-maintenance' : 'bg-brand-blue';
                        const badgeText = isAlert ? 'Mantenimiento requerido' : 'Activo';

                        return (
                            <div key={mod.id} onClick={() => handleModuleClick(mod.id)}
                                className="md:col-span-4 cursor-pointer bg-surface-container rounded-xl overflow-hidden ambient-glow flex flex-col hover:-translate-y-1 transition-transform">
                                <div className="relative h-48">
                                    <div className={`absolute inset-0 ${bgColor} flex items-center justify-center`}>
                                        <span className={`material-symbols-outlined ${iconColor} text-6xl!`}>{mod.icon}</span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <span className={`${badgeBg} px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-widest`}>
                                            {badgeText}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-surface/80 px-3 py-1 rounded backdrop-blur-sm">
                                        <h2 className="text-on-surface text-xl font-bold">{mod.name}</h2>
                                    </div>
                                </div>
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-on-surface-variant text-sm">{mod.detailType}</span>
                                        <span className="text-on-surface font-bold">{mod.detailValue}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    )
}

export default Modules;