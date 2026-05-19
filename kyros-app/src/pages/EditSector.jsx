import { useNavigate, useParams, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../App.css'

const ModuleCards = ({ modules, loading, btnDelClick }) => {
    if (loading) return <div className="text-white">Cargando módulos...</div>;

    if (modules.length === 0) {
        return <div className="text-on-surface-variant p-10 text-center">No se encontraron módulos vinculados a este sector.</div>;
    }

    return (
        <div className="pt-4">
            {modules.map((module) => {
                const isAlert = module.Status === 'alert' || module.Status === 'maintenance';

                const themeColor = isAlert ? 'bg-error' : 'bg-brand-blue';
                const textColor = isAlert ? 'text-error' : 'text-brand-blue';

                if (!module.Icon) {
                    module.Icon = 'thermostat';
                }

                return (
                    <div key={module._id || module.ModuleID} className="pl-4 pr-4 pb-4 grow">
                        <div className="group flex items-center justify-between p-4 bg-on-surface-variant/5 hover:bg-on-surface-variant/10 rounded-xl transition-all border border-transparent cursor-default">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-brand-blue shadow-sm">
                                    <span className="material-symbols-outlined text-2xl!">{module.Icon}</span>
                                </div>
                                <div>
                                    <p className="font-inter font-bold text-on-surface">{module.Name}</p>
                                    <div className="flex gap-3 items-center mt-1">
                                        <span className={`text-[10px] font-bold ${textColor} tracking-wider uppercase flex items-center gap-1`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${themeColor}`}></span> {module.Status === 'active' ? 'Activo' : module.Status === 'maintenance' ? 'Mantenimiento requerido' : 'Alerta'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => btnDelClick(module._id, module.Name)}
                                className="p-2 text-2xl! text-outline-variant cursor-pointer hover:text-error hover:bg-error/10 rounded-xl transition-all" title="Desvincular nodo" >
                                <span className="align-middle material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

const EditSector = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const sector = location.state?.sector; // Obtener el sector pasado desde Telemetría
    const [loading, setLoading] = useState(false);
    const [modules, setModules] = useState([]);

    const MySwal = withReactContent(Swal);

    const [formData, setFormData] = useState({
        name: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Lista de íconos disponibles
    const icons = [
        "settings_input_component",
        "bolt",
        "precision_manufacturing",
        "conveyor_belt",
        "forklift"
    ];

    // Garantizar que no intentan acceder al cambiar la URL, tienen que seleccionar un sector desde Telemetría
    if (!sector) {
        return (
            <div className="p-40 text-center text-white">
                <p className="text-lg text-on-surface">Acceso denegado. Favor de seleccionar un sector desde el panel de Telemetría.</p>
                <button onClick={() => navigate(-1)} className="mt-4 technical-gradient px-4 py-2 rounded cursor-pointer text-white active:scale-95 transition-all">
                    Volver
                </button>
            </div>
        );
    }

    const [selectedIcon, setSelectedIcon] = useState(sector?.Icon || icons[0]);

    // Redireccionar a la vista de telemetría general
    const handleTelemetryClick = () => {
        navigate('/telemetry');
    };

    // Obtener todos los módulos vinculados
    useEffect(() => {
        const fetchModules = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post('/api/modules/modules-info', {
                    SectorID: sector.SectorID // Enviar el ID del sector para obtener solo sus módulos vinculados
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setModules(response.data.modules);
            } catch (error) {
                console.error("Error fetching modules:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchModules();
    }, [sector]);

    // Editar el sector
    const handleSaveClick = async () => {
        if (formData.name.trim() === '') {
            MySwal.fire({
                title: <i>Error</i>,
                text: 'El nombre del sector no puede estar vacío.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#ba1a1a',
            })
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/sectors/edit/${sector._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Name: formData.name,
                    Icon: selectedIcon
                })
            });

            if (!response.ok) {
                MySwal.fire({
                    title: <i>Error</i>,
                    text: 'Error al actualizar el sector en el servidor.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#ba1a1a',
                })
            }

            MySwal.fire({
                title: <i>Sector actualizado</i>,
                text: 'Los cambios del sector se han guardado.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#003f87',
            }).then(() => {
                navigate('/telemetry');
            });

        } catch (error) {
            setLoading(false);
            MySwal.fire({
                title: <i>Error</i>,
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#ba1a1a',
            })
        }
    };

    const btnDelClick = async (moduleID, moduleName) => {
        try {
            MySwal.fire({
                title: <i>Confirmar</i>,
                text: `¿Estás seguro de que deseas eliminar el módulo "${moduleName}"?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Eliminar',
                confirmButtonColor: '#ba1a1a',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`/api/modules/delete/${moduleID}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Error al eliminar el módulo en el servidor');
                    }

                    const response1 = await fetch(`/api/sectors/update-devices/${sector._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            Devices: sector.Devices - 1
                        })
                    });

                    if (!response1.ok) {
                        throw new Error('Error al actualizar el contador de dispositivos en el servidor');
                    }

                    MySwal.fire({
                        title: 'Módulo Eliminado',
                        text: `El módulo sensor "${moduleName}" ha sido desvinculado de su empresa.`,
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#003f87',
                    }).then(() => {
                        window.location.reload();
                    });
                }
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
    };

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
                    <div className="col-span-12 mb-4 flex justify-between items-end">
                        <div>
                            <nav className="flex items-center gap-2 text-xs font-bold text-brand-blue mb-2 tracking-widest uppercase">
                                <span onClick={handleTelemetryClick} className="text-brand-blue cursor-pointer mr-3 material-symbols-outlined text-[20px]! rounded-full hover:bg-brand-blue/10 active:scale-95">arrow_back</span>
                                <span>{sector.Name || 'Cargando...'}</span>
                                <span className="material-symbols-outlined text-[16px]!">chevron_right</span>
                                <span className="text-on-surface">Editar</span>
                            </nav>
                            <h1 className="text-on-surface tracking-[-0.04em] leading-tight font-bold">
                                Sector: {sector.Name || '...'}
                            </h1>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleTelemetryClick}
                                className="px-6 py-2.5 font-bold text-brand-blue border border-brand-blue/20 cursor-pointer rounded-lg active:scale-95 hover:bg-on-surface-variant/6 transition-all">
                                Cancelar</button>
                            <button onClick={handleSaveClick} disabled={loading}
                                className="w-full technical-gradient text-white py-3 pl-4 pr-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 cursor-pointer active:scale-95 transition-all">
                                <span className="material-symbols-outlined text-base! mr-2">check_circle</span>
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>

                    {/* Nombre e Ícono */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
                        <div className="bg-surface-container p-8 rounded-xl shadow-sm relative overflow-hidden group border border-brand-blue/10">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-7xl!">{sector.Icon}</span>
                            </div>
                            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-6">Información del Sector</h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase flex justify-between">
                                        Nombre del sector
                                        <span className="text-brand-blue/60 font-medium lowercase italic">Requerido</span>
                                    </label>
                                    <input name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-4 pr-4 py-3.5 bg-on-surface-variant/6 text-on-surface font-body text-body-md rounded-lg focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200 outline-none"
                                        placeholder="Ingrese nombre..."
                                        required
                                        type="text"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 mt-6">
                                <label className="text-xs font-bold text-on-surface-variant">ÍCONO DEL SECTOR</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {icons.map((icon, index) => {
                                        const isSelected = selectedIcon === icon;

                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setSelectedIcon(icon)} // Guardar el valor string
                                                className={`aspect-square flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${isSelected
                                                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30"
                                                    : "bg-on-surface-variant/10 text-outline hover:bg-on-surface-variant/18"
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-2xl!">{icon}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sensores vinculados */}
                    <div className="col-span-6 lg:col-span-7 flex flex-col gap-6">
                        <div className="bg-surface-container rounded-xl shadow-sm flex flex-col min-h-125 border border-brand-blue/10">
                            <div className="p-8 border-b border-on-surface-variant/30 flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Módulos de sensores</h3>
                                    <p className="text-xs text-on-surface-variant font-medium mt-1">Nodos ESP-NOW vinculados a este KYROSYS Core</p>
                                </div>
                            </div>

                            <ModuleCards
                                modules={modules}
                                loading={loading}
                                btnDelClick={btnDelClick}
                            />
                        </div>
                    </div>
                </div>
            </main >
        </div >
    )
}

export default EditSector;