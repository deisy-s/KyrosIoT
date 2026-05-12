import '../App.css'

const Modules = () => {
    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full">
                <div className="col-span-12 mb-10 flex justify-between items-end">
                    <div>
                        <nav className="flex items-center gap-2 text-xs font-bold text-brand-blue mb-2 tracking-widest uppercase">
                            <span>Montaje de cables</span>
                            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                            <span className="text-outline text-on-surface">Módulos</span>
                        </nav>
                        <h1 className="text-4xl font-inter text-on-surface tracking-tighter">Módulos: Montaje de cables
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-surface-container p-6 rounded-xl ambient-glow">
                        <p className="text-[0.6875rem] text-on-surface-variant font-bold tracking-[3%] mb-1 uppercase">Dispositivos conectados
                        </p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-headline font-extrabold text-on-surface leading-none">3</span>
                            <span className="text-sm mb-1 text-on-surface">Sensores</span>
                        </div>
                    </div>
                    <div className="bg-surface-container p-6 rounded-xl ambient-glow">
                        <p className="text-[0.6875rem] font-bold text-on-surface-variant tracking-[3%] mb-1 uppercase">Alertas Críticas</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-headline font-extrabold text-error leading-none">1</span>
                            <span className="text-sm text-on-surface mb-1">Mantenimiento Requerido</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div
                        className="md:col-span-4 cursor-pointer bg-surface-container rounded-xl overflow-hidden ambient-glow flex flex-col">
                        <div className="relative h-48">
                            <div className="absolute inset-0 bg-maintenance/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-maintenance/20 text-6xl!">thermostat</span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <span
                                    className="bg-maintenance px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-widest">Mantenimiento
                                    requerido</span>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <h2 className="text-on-surface text-xl font-inter">Módulo de Temperatura</h2>
                            </div>
                        </div>
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant text-sm">Alerta desde</span>
                                <span className="text-on-surface font-bold">10/05/2026 12:23 PM</span>
                            </div>
                        </div>
                    </div>

                    <div
                        className="md:col-span-4 cursor-pointer bg-surface-container rounded-xl overflow-hidden ambient-glow flex flex-col">
                        <div className="relative h-48">
                            <div className="absolute inset-0 bg-brand-blue/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-brand-blue/30 text-6xl!">detector_co</span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <span
                                    className="bg-brand-blue px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-widest">Activo</span>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <h2 className="text-on-surface text-xl font-bold">Módulo de Gas</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant text-sm">Lecturas por minuto</span>
                                <span className="text-on-surface font-bold">12</span>
                            </div>
                        </div>
                    </div>
                    <div
                        className="md:col-span-4 cursor-pointer bg-surface-container rounded-xl overflow-hidden ambient-glow flex flex-col">
                        <div className="relative h-48">
                            <div className="absolute inset-0 bg-brand-blue/10 flex items-center justify-center">
                                <span
                                    className="material-symbols-outlined text-brand-blue/30 text-6xl!">humidity_mid</span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <span
                                    className="bg-brand-blue px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-widest">Activo</span>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <h2 className="text-on-surface text-xl font-bold">Módulo de Humedad</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant text-sm">Lecturas por minuto</span>
                                <span className="text-on-surface font-bold">12</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Modules;