import { useNavigate, useParams, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../App.css'

const ModuleCards = ({ modules, loading, handleModuleClick }) => {
    if (loading) return <div className="text-white">Cargando módulos...</div>;

    if (modules.length === 0) {
        return <div className="text-on-surface-variant p-10 text-center">No se encontraron módulos vinculados a este sector.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {modules.map((module) => {
                const isAlert = module.status === 'alert' || module.status === 'maintenance';
                const bgColor = isAlert ? 'bg-maintenance/10' : 'bg-brand-blue/10';
                const iconColor = isAlert ? 'text-maintenance/20' : 'text-brand-blue/30';
                const badgeBg = isAlert ? 'bg-maintenance' : 'bg-brand-blue';
                const badgeText = isAlert ? 'Mantenimiento requerido' : 'Activo';

                return (
                    <div key={module.id} onClick={() => handleModuleClick(module.id)}
                        className="md:col-span-4 cursor-pointer bg-surface-container rounded-xl border border-brand-blue/10 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-transform">
                        <div className="relative h-48">
                            <div className={`absolute inset-0 ${bgColor} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined ${iconColor} text-6xl!`}>{module.icon || 'device_hub'}</span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <span className={`${badgeBg} px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-widest`}>
                                    {badgeText}
                                </span>
                            </div>
                            <div className="absolute bottom-4 left-4 px-3 py-1 rounded backdrop-blur-sm">
                                <h2 className="text-on-surface text-xl font-bold">{module.name}</h2>
                            </div>
                        </div>
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant text-sm">{module.type}</span>
                                <span className="text-on-surface font-bold">{module.status === 'active' ? 'En línea' : 'Alerta'}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const Modules = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener el sector completo desde la navegación con fallback de seguridad
    const sector = location.state?.sector || { Name: "Sector", SectorID: "", name: "Sector", sector_id: "" };
    
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    // Obtener todos los módulos vinculados
    useEffect(() => {
        const fetchModules = async () => {
            if (!sector.sector_id && !sector.SectorID) {
                setLoading(false);
                return;
            }

            try {
                const sid = sector.sector_id || sector.SectorID;
                const { data, error } = await insforge
                    .from('modules')
                    .select('*')
                    .eq('sector_id', sid);
                
                if (error) throw error;
                setModules(data || []);
            } catch (error) {
                console.error("Error fetching modules:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchModules();
    }, [sector]);

    const handleModuleClick = (moduleId) => {
        const moduleInfo = modules.find(m => m.id === moduleId);
        navigate('/module-info', {
            state: { module: moduleInfo }
        });
    };

    const handleTelemetryClick = () => {
        navigate('/telemetry');
    };

    if (loading) return <div className="min-h-screen bg-surface text-white p-10">Cargando módulos...</div>;

    const totalAlerts = modules.filter(module =>
        module.status === 'alert' || module.status === 'maintenance'
    ).length;

    const currentSectorName = sector.name || sector.Name || "Sector";

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                <div className="col-span-12 mb-10 flex justify-between items-end">
                    <div>
                        <nav className="flex items-center gap-2 text-xs font-bold text-brand-blue mb-2 tracking-widest uppercase">
                            <span onClick={handleTelemetryClick} className="text-brand-blue cursor-pointer mr-3 material-symbols-outlined text-[20px]! rounded-full hover:bg-brand-blue/10 active:scale-95">arrow_back</span>
                            <span>{currentSectorName}</span>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span className="text-outline text-on-surface">Módulos</span>
                        </nav>
                        <h1 className="text-4xl font-inter text-on-surface tracking-tighter">Módulos de {currentSectorName}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-surface-container p-6 rounded-xl border border-brand-blue/10 shadow-sm ambient-glow">
                        <p className="text-[0.6875rem] text-on-surface-variant font-bold tracking-[3%] mb-1 uppercase">Dispositivos conectados</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-headline font-extrabold text-on-surface leading-none">{modules.length}</span>
                            <span className="text-sm mb-1 text-on-surface">Sensores</span>
                        </div>
                    </div>
                    <div className="bg-surface-container p-6 rounded-xl border border-brand-blue/10 shadow-sm ambient-glow">
                        <p className="text-[0.6875rem] font-bold text-on-surface-variant tracking-[3%] mb-1 uppercase">Alertas Críticas</p>
                        <div className="flex items-end gap-2">
                            <span className={`text-3xl font-headline font-extrabold leading-none ${totalAlerts > 0 ? 'text-error' : 'text-green-500'}`}>
                                {totalAlerts}
                            </span>
                            <span className="text-sm text-on-surface mb-1">
                                {totalAlerts === 1 ? 'Mantenimiento Requerido' : totalAlerts > 1 ? 'Mantenimientos Requeridos' : 'Todo en orden'}
                            </span>
                        </div>
                    </div>
                </div>

                <ModuleCards 
                    modules={modules} 
                    loading={loading} 
                    handleModuleClick={handleModuleClick}
                />
            </main>
        </div>
    )
}

export default Modules;