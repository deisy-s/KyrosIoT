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
                const response = await axios.post('/api/sectors/sectors-info', {}, {
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
        return <div className="text-on-surface-variant p-10">No se encontraron sectores.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {sectors.map((sector) => {
                const isAlert = sector.status === 'alert' || sector.status === 'maintenance';

                const themeColor = isAlert ? 'error' : 'brand-blue';
                const bgColor = isAlert ? 'bg-maintenance/10' : 'bg-brand-blue/10';
                const badgeColor = isAlert ? 'bg-maintenance' : 'bg-brand-blue';

                return (
                    <div key={sector.SectorID} className="md:col-span-4 bg-surface-container rounded-xl overflow-hidden ambient-glow flex flex-col">
                        <div onClick={handleDivClick}
                            className="relative h-48 cursor-pointer">
                            <div className={`absolute inset-0 ${bgColor} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-8xl! ${isAlert ? 'text-maintenance/20' : 'text-brand-blue/30'}`}>
                                    {sector.Icon || 'settings_input_component'}
                                </span>
                            </div>

                            <div className="absolute top-4 right-4">
                                <span className={`${badgeColor} px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-widest`}>
                                    {isAlert ? 'Mantenimiento requerido' : 'Activo'}
                                </span>
                            </div>

                            <div className="absolute bottom-4 left-4">
                                <h2 className="text-on-surface text-xl font-inter">{sector.Name}</h2>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-on-surface-variant text-sm">Dispositivos activos</span>
                                <span className="text-on-surface font-bold">{sector.Devices || 0}</span>
                            </div>

                            <div className="mt-auto flex gap-3">
                                <button onClick={handleEditClick}
                                    className="flex-1 py-2 text-brand-blue font-bold text-sm bg-brand-blue/10 rounded-md cursor-pointer hover:bg-brand-blue hover:text-white active:scale-95 transition-all">
                                    Editar sector
                                </button>
                                <button onClick={btnDelClick}
                                    className="px-3 py-2 text-outline cursor-pointer hover:text-error transition-colors">
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

    const handleDivClick = () => {
        navigate('/modules');
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
                    const response = await fetch('/api/auth/admin-verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
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

    const handleEditClick = () => {
        handleAdminAction(() => navigate('/edit-sector'));
    };

    const btnDelClick = () => {
        handleAdminAction(() => {

        });
    };

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-on-surface tracking-[-0.04em] leading-tight">Telemetría de Planta</h1>
                        <p className="text-on-surface-variant text-base max-w-xl">Monitorización del estado en tiempo real para todos
                            los sectores de fabricación</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-surface-container p-6 rounded-xl ambient-glow">
                        <p className="text-on-surface-variant text-[0.6875rem] font-bold tracking-[3%] mb-1 uppercase">Dispositivos en planta
                        </p>
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