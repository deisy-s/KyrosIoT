import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../App.css'

const MySwal = withReactContent(Swal);

const EditSector = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Rescatamos el ID del sector desde la URL

    // --- ESTADOS DEL FORMULARIO ---
    const [sectorName, setSectorName] = useState("");
    const [selectedIcon, setSelectedIcon] = useState(0);
    const [loading, setLoading] = useState(false);

    const icons = [
        "settings_input_component",
        "bolt",
        "precision_manufacturing",
        "conveyor_belt",
        "forklift"
    ];

    // --- SIMULACIÓN: Cargar datos actuales (Mientras Deisy hace la ruta) ---
    useEffect(() => {
        if (id) {
            // Aquí en el futuro harás un fetch al backend para traer los datos reales de este ID
            // fetch(`http://localhost:5000/api/sectors/${id}`) ...
            console.log("Editando el sector con ID:", id);
            setSectorName("Línea de Producción (Ejemplo)");
        }
    }, [id]);

    const handleTelemetryClick = () => {
        navigate('/telemetry');
    };

    // --- GUARDAR CAMBIOS ---
    const handleSaveClick = async () => {
        if (!sectorName.trim()) {
            MySwal.fire('Error', 'El nombre del sector no puede estar vacío.', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/sectors/edit/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    Name: sectorName, 
                    Icon: icons[selectedIcon] 
                })
            });
            if (!response.ok) throw new Error('Error al guardar');
        

            // Simulación de guardado exitoso
            setTimeout(() => {
                setLoading(false);
                MySwal.fire('¡Actualizado!', 'Los cambios del sector se han guardado.', 'success').then(() => {
                    navigate('/telemetry');
                });
            }, 1000);

        } catch (error) {
            setLoading(false);
            MySwal.fire('Error', 'No se pudieron guardar los cambios.', 'error');
        }
    };

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
                    <div className="col-span-12 mb-4 flex justify-between items-end">
                        <div>
                            <nav className="flex items-center gap-2 text-xs font-bold text-brand-blue mb-2 tracking-widest uppercase">
                                <span onClick={handleTelemetryClick} className="text-brand-blue cursor-pointer mr-3 material-symbols-outlined text-[20px]! active:scale-95">arrow_back</span>
                                <span>{sectorName || 'Cargando...'}</span>
                                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                                <span className="text-on-surface">Editar</span>
                            </nav>
                            <h1 className="text-on-surface tracking-[-0.04em] leading-tight text-4xl font-bold">
                                Sector: {sectorName || '...'}
                            </h1>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleTelemetryClick}
                                className="px-6 py-2.5 font-bold text-brand-blue border border-brand-blue/20 cursor-pointer rounded-lg active:scale-95 hover:bg-on-surface-variant/6 transition-all">
                                Cancelar</button>
                            <button onClick={handleSaveClick} disabled={loading}
                                className="w-full bg-linear-to-br from-brand-blue to-brand-light text-white py-3 pl-4 pr-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 cursor-pointer active:scale-95 transition-all">
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>

                    {/* COLUMNA IZQUIERDA: FORMULARIO */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
                        <div className="bg-surface-container p-8 rounded-xl shadow-sm relative overflow-hidden group border border-outline-variant/10">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-6xl!">{icons[selectedIcon]}</span>
                            </div>
                            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-6">Información del Sector</h3>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase flex justify-between">
                                        Nombre del sector
                                        <span className="text-brand-blue/60 font-medium lowercase italic">Requerido</span>
                                    </label>
                                    <input
                                        value={sectorName}
                                        onChange={(e) => setSectorName(e.target.value)}
                                        className="w-full bg-on-surface-variant/6 border border-outline-variant/20 rounded-lg px-4 py-3 font-medium text-on-surface focus:ring-2 focus:ring-brand-blue/50 outline-none transition-all"
                                        placeholder="Ingrese nombre..." 
                                        type="text" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 mt-6">
                                <label className="text-xs font-bold text-on-surface-variant">ÍCONO DEL SECTOR</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {icons.map((icon, index) => {
                                        const isSelected = selectedIcon === index;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedIcon(index)}
                                                className={`aspect-square flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${isSelected
                                                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30"
                                                    : "bg-on-surface-variant/10 text-outline-variant hover:bg-on-surface-variant/20"
                                                }`}>
                                                <span className="material-symbols-outlined">{icon}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: SENSORES SATÉLITES */}
                    <div className="col-span-6 lg:col-span-7 flex flex-col gap-6">
                        <div className="bg-surface-container rounded-xl shadow-sm flex flex-col min-h-125 border border-outline-variant/10">
                            <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Módulos de sensores</h3>
                                    <p className="text-xs text-on-surface-variant font-medium mt-1">Nodos ESP-NOW vinculados a este KYROSYS Core</p>
                                </div>
                            </div>
                            
                            <div className="p-4 grow overflow-y-auto space-y-3">
                                {/* Sensor 1 */}
                                <div className="group flex items-center justify-between p-4 bg-on-surface-variant/5 hover:bg-on-surface-variant/10 rounded-xl transition-all border border-transparent hover:border-brand-blue/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-brand-blue shadow-sm">
                                            <span className="material-symbols-outlined">thermostat</span>
                                        </div>
                                        <div>
                                            <p className="font-inter font-bold text-on-surface">Módulo de Temperatura</p>
                                            <div className="flex gap-3 items-center mt-1">
                                                <span className="text-[10px] font-bold text-green-500 tracking-wider uppercase flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Conectado
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 text-xl! text-outline-variant cursor-pointer hover:text-error hover:bg-error/10 rounded-xl transition-all" title="Desvincular nodo">
                                        <span className="align-middle material-symbols-outlined">delete</span>
                                    </button>
                                </div>

                                {/* Sensor 2 */}
                                <div className="group flex items-center justify-between p-4 bg-on-surface-variant/5 hover:bg-on-surface-variant/10 rounded-xl transition-all border border-transparent hover:border-brand-blue/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-brand-blue shadow-sm">
                                            <span className="material-symbols-outlined">detector_co</span>
                                        </div>
                                        <div>
                                            <p className="font-inter font-bold text-on-surface">Módulo de Gas (MQ-2)</p>
                                            <div className="flex gap-3 items-center mt-1">
                                                <span className="text-[10px] font-bold text-green-500 tracking-wider uppercase flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Conectado
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 text-xl! text-outline-variant cursor-pointer hover:text-error hover:bg-error/10 rounded-xl transition-all" title="Desvincular nodo">
                                        <span className="align-middle material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    )
}

export default EditSector;