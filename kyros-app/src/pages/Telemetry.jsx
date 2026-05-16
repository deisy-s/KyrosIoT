import React, { useState, useEffect } from 'react'
import { BrowserRouter, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import '../App.css'

const SectorCards = ({ handleEditClick, btnDelClick, handleDivClick }) => {
    const navigate = useNavigate();
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post('http://localhost:5000/api/sectors/sectors-info', {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setSectors(response.data.sectors);
            } catch (error) {
                console.error("Error fetching sectors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSectors();
    }, []);

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
                    <div key={sector._id} className="md:col-span-4 bg-surface-container rounded-xl overflow-hidden ambient-glow flex flex-col">
                        <div onClick={() => handleDivClick(sector._id)}
                            className="relative h-48 cursor-pointer">
                            <div className={`absolute inset-0 ${bgColor} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-8xl! ${isAlert ? 'text-maintenance/20' : 'text-brand-blue/30'}`}>
                                    {sector.Icon || 'precision_manufacturing'}
                                </span>
                            </div>

                            <div className="absolute top-4 right-4">
                                <span className={`${badgeColor} px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-widest`}>
                                    {isAlert ? 'Mantenimiento requerido' : 'Activo'}
                                </span>
                            </div>

                            <div className="absolute bottom-4 left-4 bg-surface/80 px-3 py-1 rounded backdrop-blur-sm">
                                <h2 className="text-on-surface text-xl font-inter font-bold">{sector.Name || sector.SectorName}</h2>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-on-surface-variant text-sm">Dispositivos activos</span>
                                <span className="text-on-surface font-bold bg-surface-container-high px-3 py-1 rounded-full">{sector.Devices || 0}</span>
                            </div>

                            <div className="mt-auto flex gap-3">
                                <button onClick={() => handleEditClick(sector._id)}
                                    className="flex-1 py-2 text-brand-blue font-bold text-sm bg-brand-blue/10 rounded-md cursor-pointer hover:bg-brand-blue hover:text-white active:scale-95 transition-all">
                                    Editar sector
                                </button>
                                <button onClick={() => btnDelClick(sector._id, sector.Name || sector.SectorName)}
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

    // --- ESTADOS DE HARDWARE (PLUG & PLAY) ---
    const [nodoDescubierto, setNodoDescubierto] = useState(null);
    const [vinculando, setVinculando] = useState(false);

    // --- EFECTO PARA BUSCAR NUEVOS SENSORES ESP-NOW ---
    useEffect(() => {
        const buscarNuevosSensores = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/iot/sensores/pendientes');
                const pendientes = await res.json();
                if (pendientes.length > 0) setNodoDescubierto(pendientes[0]);
                else setNodoDescubierto(null);
            } catch (error) {
                console.error("Error buscando nodos pendientes", error);
            }
        };

        buscarNuevosSensores();
        const intervaloPendientes = setInterval(buscarNuevosSensores, 3000);
        return () => clearInterval(intervaloPendientes);
    }, []);

    const aceptarVinculacion = async () => {
        setVinculando(true);
        try {
            await fetch('http://localhost:5000/api/iot/sensores/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mac: nodoDescubierto.mac, sector: 'Planta Principal' })
            });
            setVinculando(false);
            setNodoDescubierto(null);
            MySwal.fire('¡Vinculado!', 'Módulo registrado en KYROS', 'success');
        } catch (error) {
            console.error("Error al registrar", error);
            setVinculando(false);
        }
    };

    const handleDivClick = (sectorId) => {
        navigate(`/modules/${sectorId}`);
    };

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
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('http://localhost:5000/api/auth/admin-verify', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({ pin: inputPin })
                    });

                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.error || 'PIN Incorrecto');
                    }
                    return data;
                } catch (error) {
                    Swal.showValidationMessage(`Error: ${error.message}`);
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (pin) {
            onSuccess();
        }
    }

    const handleEditClick = (sectorId) => {
        handleAdminAction(() => navigate(`/edit-sector/${sectorId}`));
    };

    const btnDelClick = (sectorId, sectorName) => {
        handleAdminAction(async () => {
            // Aquí irá la llamada axios para borrar el sector cuando Deisy haga la ruta
            MySwal.fire({
                title: 'Sector Eliminado',
                text: `El KYROSYS Core de ${sectorName || 'este sector'} ha sido desvinculado.`,
                icon: 'success'
            }).then(() => {
                window.location.reload(); // Recarga temporal para actualizar la vista
            });
        });
    };

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-on-surface tracking-[-0.04em] leading-tight text-4xl font-bold">Telemetría de Planta</h1>
                        <p className="text-on-surface-variant text-base max-w-xl mt-2">Monitorización del estado en tiempo real para todos los sectores de fabricación</p>
                    </div>
                    {/* BOTÓN MEJORADO Y ELEGANTE */}
                    <button 
                        onClick={() => navigate('/link-device')} 
                        className="px-5 py-2.5 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-brand-blue hover:text-white active:scale-95 transition-all cursor-pointer shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-surface-container p-6 rounded-xl ambient-glow">
                        <p className="text-on-surface-variant text-[0.6875rem] font-bold tracking-[3%] mb-1 uppercase">Dispositivos en planta</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-extrabold text-on-surface leading-none">1,234</span>
                            <span className="text-on-surface text-sm mb-1">Sensores</span>
                        </div>
                    </div>
                    <div className="bg-surface-container p-6 rounded-xl ambient-glow">
                        <p className="text-on-surface-variant text-[0.6875rem] font-bold tracking-[3%] mb-1 uppercase">Alertas Críticas</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-extrabold text-error leading-none">1</span>
                            <span className="text-on-surface text-sm mb-1">Mantenimiento Requerido</span>
                        </div>
                    </div>
                </div>

                <SectorCards
                    handleEditClick={handleEditClick}
                    btnDelClick={btnDelClick}
                    handleDivClick={handleDivClick}
                />
            </main>
        </div>
    )
}

export default Telemetry;