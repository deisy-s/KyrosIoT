import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import '../App.css'

const SectorCards = ({ sectors, loading, handleEditClick, btnDelClick, handleDivClick }) => {
    if (loading) return <div className="text-white">Cargando sectores...</div>;

    if (sectors.length === 0) {
        return <div className="text-on-surface-variant p-10 text-center">No se encontraron sectores vinculados a esta empresa.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {sectors.map((sector) => {
                const isAlert = sector.status === 'alert' || sector.status === 'maintenance';

                const themeColor = isAlert ? 'error' : 'brand-blue';
                const bgColor = isAlert ? 'bg-maintenance/10' : 'bg-brand-blue/10';
                const badgeColor = isAlert ? 'bg-maintenance' : 'bg-brand-blue';

                return (
                    <div key={sector.id} className="md:col-span-4 bg-surface-container border border-brand-blue/10 shadow-sm rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-all">
                        <div onClick={() => handleDivClick(sector.id)}
                            className="relative h-48 cursor-pointer">
                            <div className={`absolute inset-0 ${bgColor} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-8xl! ${isAlert ? 'text-maintenance/20' : 'text-brand-blue/30'}`}>
                                    {sector.icon || 'precision_manufacturing'}
                                </span>
                            </div>

                            <div className="absolute top-4 right-4">
                                <span className={`${badgeColor} px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-widest`}>
                                    {isAlert ? 'Mantenimiento requerido' : 'Activo'}
                                </span>
                            </div>

                            <div className="absolute bottom-4 left-4 px-3 py-1 rounded backdrop-blur-sm">
                                <h2 className="text-on-surface text-xl font-inter font-bold">{sector.name}</h2>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-on-surface-variant text-sm">Dispositivos activos</span>
                                <span className="text-on-surface font-bold bg-surface-container-high px-3 py-1 rounded-full">{sector.devices_count || 0}</span>
                            </div>

                            <div className="mt-auto flex gap-3">
                                <button onClick={() => handleEditClick(sector.id)}
                                    className="flex-1 py-2 text-brand-blue font-bold text-sm bg-brand-blue/10 rounded-md cursor-pointer hover:bg-brand-blue hover:text-white active:scale-95 transition-all">
                                    <span className="material-symbols-outlined text-base! mr-2">edit</span>
                                    Editar sector
                                </button>
                                <button onClick={() => btnDelClick(sector.id, sector.name)}
                                    className="px-3 py-2 text-outline cursor-pointer hover:bg-error/10 hover:text-error rounded-md transition-colors">
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const Telemetry = () => {
    const navigate = useNavigate();
    const MySwal = withReactContent(Swal);

    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [telemetry, setTelemetry] = useState([]);
    const [rules, setRules] = useState([]);

    // Plug & Play
    const [nodoDescubierto, setNodoDescubierto] = useState(null);
    const [vinculando, setVinculando] = useState(false);

    const _u = JSON.parse(localStorage.getItem('user'));
    const user = _u ? { ..._u, companyId: _u.companyId ?? _u.id } : null;

    // Simular detección de hardware (Plug & Play) despues de 5 segundos
    useEffect(() => {
        const timer = setTimeout(() => {
            setNodoDescubierto({
                tipo: 'KYROS Satélite - Sensor Temp/Hum',
                mac: 'AC:67:B2:11:44:EE'
            });
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const aceptarVinculacion = async () => {
        setVinculando(true);
        
        try {
            const newSector = {
                name: "Nuevo Sector " + (sectors.length + 1),
                sector_id: "SEC-" + Math.floor(1000 + Math.random() * 9000),
                status: 'online',
                devices_count: 1,
                company_id: user?.companyId
            };

            const { error } = await insforge
                .from('sectors')
                .insert([newSector]);

            if (error) throw error;

            MySwal.fire({
                title: 'Dispositivo Vinculado',
                text: 'El sensor ha sido registrado exitosamente en un nuevo sector.',
                icon: 'success',
                confirmButtonText: 'Genial',
                confirmButtonColor: '#003f87',
            });

            setSectors([...sectors, newSector]);
            setNodoDescubierto(null);
        } catch (error) {
            console.error("Error vinculando:", error);
        } finally {
            setVinculando(false);
        }
    };

    // Obtener todos los sectores vinculados
    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const { data, error } = await insforge
                    .from('sectors')
                    .select('*')
                    .eq('company_id', user?.companyId);
                
                if (error) throw error;
                setSectors(data || []);
            } catch (error) {
                console.error("Error fetching sectors:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchRules = async () => {
            try {
                const { data, error } = await insforge
                    .from('rules')
                    .select('*')
                    .eq('company_id', user?.companyId)
                    .eq('activa', true);
                
                if (error) throw error;
                setRules(data || []);
            } catch (error) {
                console.error("Error fetching rules:", error);
            }
        };

        fetchSectors();
        fetchRules();
    }, []);

    // Polling de telemetría cada 10s
    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const { data, error } = await insforge
                    .from('telemetry')
                    .select('*')
                    .limit(50);
                
                if (error) throw error;
                setTelemetry(data || []);
            } catch (error) {
                console.error("Error fetching telemetry:", error);
            }
        };

        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 10000);
        return () => clearInterval(interval);
    }, []);

    // Agrupar telemetría por tipo para mostrar el último valor de cada "sensor"
    const latestSensors = telemetry.reduce((acc, curr) => {
        if (!acc[curr.type]) {
            acc[curr.type] = curr;
        }
        return acc;
    }, {});

    // Evaluar si un sensor tiene una alerta activa basada en las reglas
    const checkAlert = (sensorType, value) => {
        const rule = rules.find(r => r.metrica === sensorType);
        if (!rule) return false;

        const val = Number(value);
        const threshold = Number(rule.valor);

        switch (rule.condicion) {
            case '>': return val > threshold;
            case '<': return val < threshold;
            case '==': return val === threshold;
            case '>=': return val >= threshold;
            case '<=': return val <= threshold;
            default: return false;
        }
    };

    // Num total de sensores
    const totalSensors = sectors.reduce((sum, sector) => sum + (Number(sector.devices_count) || 0), 0);

    // Num de alertas (alert o maintenance)
    const totalAlerts = sectors.filter(sector =>
        sector.status === 'alert' || sector.status === 'maintenance'
    ).length;

    // Redireccionar a la vista de módulos del sector específico
    const handleDivClick = (sectorId) => {
        const sectorInfo = sectors.find(s => s.id === sectorId); 

        navigate('/modules', {
            state: { sector: sectorInfo } 
        });
    };

    // Validar los permisos de administrador antes de editar o eliminar
    const handleAdminAction = async (onSuccess) => {
        const { value: pin } = await withReactContent(Swal).fire({
            title: <i>Ingrese el PIN de administrador</i>,
            input: 'password',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            confirmButtonText: 'Verificar',
            confirmButtonColor: '#003f87',
            showLoaderOnConfirm: true,
            preConfirm: async (inputPin) => {
                // Validación local contra los metadatos de InsForge
                if (inputPin === user?.adminPin) {
                    return { success: true };
                } else {
                    Swal.showValidationMessage(`PIN Incorrecto`);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (pin) {
            onSuccess();
        }
    }

    // Redireccionar a la vista de edición del sector específico (si es admin)
    const handleEditClick = (sectorId) => {
        const sectorToEdit = sectors.find(s => s.id === sectorId); 

        handleAdminAction(() => {
            navigate('/edit-sector', {
                state: { sector: sectorToEdit } 
            });
        });
    };

    // Eliminar el sector específico (si es admin)
    const btnDelClick = (sectorId, sectorName) => {
        handleAdminAction(async () => {
            try {
                const { error } = await insforge
                    .from('sectors')
                    .delete()
                    .eq('id', sectorId);

                if (error) throw error;

                MySwal.fire({
                    title: 'Sector Eliminado',
                    text: `El KYROSYS Core de "${sectorName}" ha sido desvinculado de su empresa.`,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#003f87',
                }).then(() => {
                    setSectors(sectors.filter(s => s.id !== sectorId));
                });
            } catch (error) {
                MySwal.fire({
                    title: <i>Error</i>,
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#ba1a1a',
                })
            }
        });
    };

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                {/* --- BANNER PLUG & PLAY (HARDWARE) --- */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-on-surface tracking-[-0.04em] leading-tight font-bold">Telemetría de Planta</h1>
                        <p className="text-on-surface-variant text-base max-w-xl mt-2">Monitorización del estado en tiempo real para todos los sectores de fabricación.</p>
                    </div>

                    <button
                        onClick={() => navigate('/link-device')}
                        className="px-5 py-2.5 technical-gradient text-white rounded-lg font-bold text-sm flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm"
                    >
                        <span className="material-symbols-outlined text-base!">add_circle</span>
                        Vincular Nuevo Core
                    </button>
                </header>

                {/* --- BANNER PLUG & PLAY (HARDWARE) --- */}
                {nodoDescubierto && (
                    <div className="mb-10 bg-brand-blue/10 border-2 border-brand-blue/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse-slow relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-brand-blue"></div>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-full bg-brand-blue/20 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-brand-blue text-3xl">sensors</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping"></span>
                                    <h3 className="text-sm font-bold text-brand-blue uppercase tracking-widest">Nuevo Satélite Detectado</h3>
                                </div>
                                <h2 className="text-xl font-bold text-on-surface">{nodoDescubierto.tipo}</h2>
                                <p className="text-sm text-on-surface-variant">MAC: <span className="font-mono">{nodoDescubierto.mac}</span></p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setNodoDescubierto(null)} className="px-6 py-3 rounded-lg font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer">Ignorar</button>
                            <button onClick={aceptarVinculacion} disabled={vinculando} className="px-8 py-3 bg-brand-blue text-white rounded-lg font-bold shadow-lg shadow-brand-blue/20 cursor-pointer">
                                {vinculando ? "Vinculando..." : "Registrar Sensor"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Tarjetas de sensores y alertas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-surface-container border border-brand-blue/10 shadow-sm p-6 rounded-xl ambient-glow">
                        <p className="text-on-surface-variant text-[0.6875rem] font-bold tracking-[3%] mb-1 uppercase">Dispositivos en planta</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-extrabold text-on-surface leading-none">{loading ? "0" : totalSensors.toLocaleString()}</span>
                            <span className="text-on-surface text-sm mb-1">Sensores</span>
                        </div>
                    </div>

                    <div className="bg-surface-container p-6 border border-brand-blue/10 shadow-sm rounded-xl ambient-glow">
                        <p className="text-on-surface-variant text-[0.6875rem] font-bold tracking-[3%] mb-1 uppercase">Alertas Críticas</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-extrabold text-error leading-none">{loading ? "0" : totalAlerts}</span>
                            <span className="text-on-surface text-sm mb-1">Alertas críticas</span>
                        </div>
                    </div>
                </div>

                {/* --- SECCIÓN SENSORES EN VIVO (G4) --- */}
                <h2 className="text-base font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl!">sensors</span>
                    Sensores en Vivo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
                    {Object.values(latestSensors).map((sensor) => {
                        const isAlert = checkAlert(sensor.type, sensor.value);
                        return (
                            <div key={sensor.type} className={`p-4 rounded-xl border transition-all ${isAlert ? 'bg-error/10 border-error/30' : 'bg-surface-container border-brand-blue/10'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{sensor.type}</span>
                                    {isAlert && (
                                        <span className="flex h-2 w-2 rounded-full bg-error animate-pulse"></span>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl font-black ${isAlert ? 'text-error' : 'text-on-surface'}`}>{sensor.value}</span>
                                    <span className="text-xs text-on-surface-variant">
                                        {sensor.type === 'temperatura' ? '°C' : (sensor.type === 'presion' ? 'PSI' : '')}
                                    </span>
                                </div>
                                {isAlert && (
                                    <div className="mt-2 px-2 py-0.5 bg-error text-white text-[9px] font-black uppercase rounded text-center tracking-tighter">
                                        Umbral Superado
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {Object.keys(latestSensors).length === 0 && (
                        <div className="col-span-full py-10 text-center text-on-surface-variant italic">
                            Esperando datos de telemetría...
                        </div>
                    )}
                </div>

                {/* Cargar los sectores de manera dinámica */}
                <h2 className="text-base font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl!">factory</span>
                    Sectores Industriales
                </h2>
                <SectorCards
                    sectors={sectors}
                    loading={loading}
                    handleEditClick={handleEditClick}
                    btnDelClick={btnDelClick}
                    handleDivClick={handleDivClick}
                />
            </main>
        </div>
    )
}

export default Telemetry;