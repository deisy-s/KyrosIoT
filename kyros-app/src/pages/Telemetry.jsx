import { useState } from 'react'
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import '../App.css'

const Telemetry = () => {
    const navigate = useNavigate();

    const handleEditClick = () => {
        navigate('/edit-sector');
    };

    const handleDivClick = () => {
        navigate('/modules');
    };

    const MySwal = withReactContent(Swal);

    const btnDelClick = () => {
        withReactContent(Swal).fire({
            title: <i>Ingrese el PIN de administrador</i>,
            input: 'text',
            inputValue,
            preConfirm: () => {
                setInputValue(Swal.getInput()?.value || '')
            },
        })
    }

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

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div
                        className="md:col-span-4 bg-surface-container rounded-xl overflow-hidden ambient-glow flex flex-col">
                        <div className="relative h-48 cursor-pointer" onClick={handleDivClick}>
                            <div className="absolute inset-0 bg-maintenance/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-maintenance/20 text-6xl!">cable</span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <span
                                    className="bg-maintenance px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-widest">Mantenimiento
                                    requerido</span>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <h2 className="text-on-surface text-xl font-inter">Montaje de cables</h2>
                            </div>
                        </div>
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-on-surface-variant text-sm">Dispositivos activos</span>
                                <span className="text-on-surface font-bold">8</span>
                            </div>
                            <div className="mt-auto flex gap-3">
                                <button
                                    className="flex-1 py-2 text-brand-blue font-bold text-sm bg-brand-blue/10 rounded-md cursor-pointer hover:bg-brand-blue hover:text-white active:scale-95 transition-all"
                                    id="btnEditSector"
                                    onClick={handleEditClick}>
                                    Editar sector</button>
                                <button className="px-3 py-2 text-outline cursor-pointer hover:text-error transition-colors" onClick={btnDelClick}>
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className="md:col-span-4 bg-surface-container rounded-xl overflow-hidden ambient-glow flex flex-col">
                        <div className="relative h-48 cursor-pointer">
                            <div className="absolute inset-0 bg-brand-blue/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-brand-blue/30 text-6xl!">inventory_2</span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <span
                                    className="bg-brand-blue px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-widest">Activo</span>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <h2 className="text-on-surface text-xl font-inter">Almacén de componentes</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-on-surface-variant text-sm">Dispositivos activos</span>
                                <span className="text-on-surface font-bold">3</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 py-2 text-brand-blue font-bold text-sm cursor-pointer bg-brand-blue/10 rounded-md hover:bg-brand-blue hover:text-white active:scale-95 transition-all">Editar
                                    sector</button>
                                <button className="px-3 py-2 text-outline cursor-pointer hover:text-error transition-colors">
                                    <span className="material-symbols-outlined text-sm cursor-pointer">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className="md:col-span-4 bg-surface-container rounded-xl overflow-hidden ambient-glow flex flex-col">
                        <div className="relative h-48 cursor-pointer">
                            <div className="absolute inset-0 bg-brand-blue/10 flex items-center justify-center">
                                <span
                                    className="material-symbols-outlined text-brand-blue/30 text-6xl!">precision_manufacturing</span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <span
                                    className="bg-brand-blue px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-widest">Activo</span>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <h2 className="text-on-surface text-xl font-inter">Línea de producción 1</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-on-surface-variant text-sm">Dispositivos activos</span>
                                <span className="text-on-surface font-bold">3</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 py-2 text-brand-blue font-bold text-sm cursor-pointer bg-brand-blue/10 rounded-md hover:bg-brand-blue hover:text-white active:scale-95 transition-all">Editar
                                    sector</button>
                                <button className="px-3 py-2 text-outline cursor-pointer hover:text-error transition-colors">
                                    <span className="material-symbols-outlined text-sm cursor-pointer">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Telemetry;