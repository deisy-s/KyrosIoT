import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import '../App.css'

const EditSector = () => {
    const navigate = useNavigate();

    const [selectedIcon, setSelectedIcon] = useState(0);

    const icons = [
        "settings_input_component",
        "bolt",
        "precision_manufacturing",
        "conveyor_belt",
        "forklift"
    ];

    const handleTelemetryClick = () => {
        navigate('/telemetry');
    };

    const handleCancelClick = () => {
        navigate('/telemetry');
    };

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
                    <div className="col-span-12 mb-4 flex justify-between items-end">
                        <div>
                            <nav className="flex items-center gap-2 text-xs font-bold text-brand-blue mb-2 tracking-widest uppercase">
                                <span onClick={handleTelemetryClick} className="text-brand-blue cursor-pointer mr-3 material-symbols-outlined text-[20px]! active:scale-95">arrow_back</span>
                                <span>Montaje de cables</span>
                                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                                <span className="text-on-surface">Editar</span>
                            </nav>
                            <h1 className="text-on-surface tracking-[-0.04em] leading-tight">Sector: Montaje de
                                cables
                            </h1>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleCancelClick}
                                className="px-6 py-2.5 font-bold text-brand-blue border border-brand-blue/20 cursor-pointer rounded-lg active:scale-95 hover:bg-on-surface-variant/6 transition-all">
                                Cancelar</button>
                            <button
                                className="w-full bg-linear-to-br from-brand-blue to-brand-light text-white py-3 pl-4 pr-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 cursor-pointer active:scale-95 transition-all">
                                Guardar Cambios</button>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
                        <div
                            className="bg-surface-container p-8 rounded-xl shadow-[0_32px_48px_rgba(25,28,30,0.06)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-6xl!">settings_input_component</span>
                            </div>
                            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-6">Información del Sector</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-variant uppercase flex justify-between">
                                        Nombre del sector
                                        <span className="text-brand-blue/60 font-medium lowercase italic">Requerido</span>
                                    </label>
                                    <input
                                        className="w-full bg-on-surface-variant/6 border-none rounded-lg px-4 py-3 font-medium text-on-surface focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Ingrese nombre..." type="text" />
                                </div>
                            </div>

                            <div className="space-y-3 mt-2">
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
                                                    : "bg-on-surface-variant/10 text-outline hover:bg-on-surface-variant/18"
                                                    }
                                                `}>
                                                <span className="material-symbols-outlined">{icon}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-6 lg:col-span-7 flex flex-col gap-6">
                        <div
                            className="bg-surface-container rounded-xl shadow-[0_32px_48px_rgba(25,28,30,0.06)] flex flex-col min-h-125">
                            <div className="p-8 border-b border-surface-container flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest">Módulos de sensores</h3>
                                    <p className="text-xs text-on-surface-variant font-medium mt-1">3 módulos vinculados a este sector
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 grow overflow-y-auto custom-scrollbar space-y-3">
                                <div
                                    className="group flex items-center justify-between p-4 bg-on-surface-variant/6 hover:bg-on-surface-variant/9 rounded-xl transition-all border border-transparent hover:border-brand-blue/30">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-brand-blue shadow-sm">
                                            <span className="material-symbols-outlined">thermostat</span>
                                        </div>
                                        <div>
                                            <p className="font-inter font-bold text-on-surface">Módulo de Temperatura</p>
                                            <div className="flex gap-3 items-center mt-1">
                                                <span
                                                    className="text-[10px] font-bold text-brand-blue tracking-wider uppercase">Conectado</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="p-2 text-xl! text-outline-variant cursor-pointer hover:text-error hover:bg-error/10 rounded-xl transition-all"
                                        id="btnDeleteTemp">
                                        <span className="align-middle material-symbols-outlined">delete</span>
                                    </button>
                                </div>

                                <div
                                    className="group flex items-center justify-between p-4 bg-on-surface-variant/6 hover:bg-on-surface-variant/9 rounded-xl transition-all border border-transparent hover:border-brand-blue/30">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-brand-blue shadow-sm">
                                            <span className="material-symbols-outlined">detector_co</span>
                                        </div>
                                        <div>
                                            <p className="font-inter font-bold text-on-surface">Módulo de Gas</p>
                                            <div className="flex gap-3 items-center mt-1">
                                                <span
                                                    className="text-[10px] font-bold text-brand-blue tracking-wider uppercase">Conectado</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="p-2 text-xl! text-outline-variant cursor-pointer hover:text-error hover:bg-error/10 rounded-xl transition-all">
                                        <span className="align-middle material-symbols-outlined">delete</span>
                                    </button>
                                </div>

                                <div
                                    className="group flex items-center justify-between p-4 bg-on-surface-variant/6 hover:bg-on-surface-variant/9 rounded-xl transition-all border border-transparent hover:border-brand-blue/30">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-brand-blue shadow-sm">
                                            <span className="material-symbols-outlined">humidity_mid</span>
                                        </div>
                                        <div>
                                            <p className="font-inter font-bold text-on-surface">Módulo de Humedad</p>
                                            <div className="flex gap-3 items-center mt-1">
                                                <span
                                                    className="text-[10px] font-bold text-brand-blue tracking-wider uppercase">Conectado</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="p-2 text-xl! text-outline-variant cursor-pointer hover:text-error hover:bg-error/10 rounded-xl transition-all">
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