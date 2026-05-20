import React, { useState, useEffect } from 'react'
import kyrosLogo from '../assets/kyrosLogo.jpeg'
import { Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import SignIn from './SignIn.jsx';
import SignUp from './SignUp.jsx';
import Dashboard from './Dashboard.jsx';
import Telemetry from './Telemetry.jsx';
import EditSector from './EditSector.jsx';
import Modules from './Modules.jsx';
import Shop from './Shop.jsx';
import Help from './Help.jsx';
import ModuleInfo from './ModuleInfo.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Automation from './Automation.jsx';
import LinkDevice from './LinkDevice.jsx';
import '../App.css'


const App = () => {
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const isTelemetryActive =
        location.pathname.includes('/telemetry') ||
        location.pathname.includes('/edit-sector') ||
        location.pathname.includes('/modules') ||
        location.pathname.includes('/module-info') ||
        location.pathname.includes('/link-device');

    const user = JSON.parse(localStorage.getItem('user'));
    const isLoggedIn = !!user;

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = async () => {
        await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('user');
        window.location.href = '/signin';
    };

    const loadNotifs = async () => {
        try {
            const token = localStorage.getItem('token');

            const respuesta = await axios.post(
                (import.meta.env.VITE_API_URL || '') + '/api/notifs/notifs-info',
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const datos = respuesta.data;

            if (datos && Array.isArray(datos.alerts)) {
                const alertasFormateadas = datos.alerts.map(a => ({
                    id: a._id,
                    msg: a.Message || "Alerta de sistema",
                    fecha: a.Timestamp ? new Date(a.Timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
                    tipo: a.Type || 'advertencia'
                }));

                setNotifications(alertasFormateadas);
            } else {
                console.warn("No se encontraron alertas o la estructura no es un array válido.");
                setNotifications([]);
            }
        } catch (error) {
            console.error("Error al sincronizar notificaciones:", error);
        }
    };

    useEffect(() => {
        if (!isLoggedIn) return;

        loadNotifs();

        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

        socket.on('sector-estado-cambio', (data) => {
            console.log(`Cambio en sector ${data.sectorId}`);
            loadNotifs();
            setTimeout(() => window.location.reload(), 600);
        });

        socket.on('modulo-estado-cambio', (data) => {
            console.log(`Cambio en módulo ${data.mac}`);
            loadNotifs();
            setTimeout(() => window.location.reload(), 600);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!isLoggedIn) return;

        loadNotifs();
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

        socket.on('sector-estado-cambio', (data) => {
            // data = { sectorId, status } ('Activo' o 'Desconectado')

            if (data.status === 'inactive') {
                setNotifications(prev => {
                    if (prev.some(n => n.id === `sector-${data.sectorId}`)) return prev;

                    const nuevaAlerta = {
                        id: `sector-${data.sectorId}`,
                        msg: `Alerta Crítica: El Core del sector con ID ${data.sectorId} se ha desconectado.`,
                        fecha: new Date().toLocaleTimeString(),
                        tipo: 'critico'
                    };
                    return [nuevaAlerta, ...prev];
                });
            }
            else if (data.status === 'active') {
                setNotifications(prev => prev.filter(n => n.id !== `sector-${data.sectorId}`));
            }
        });

        socket.on('modulo-estado-cambio', (data) => {
            // data = { mac, isActive, sectorId }

            if (!data.isActive) {
                setNotifications(prev => {
                    if (prev.some(n => n.id === `mod-${data.mac}`)) return prev;

                    const nuevaAlerta = {
                        id: `mod-${data.mac}`,
                        msg: `Satélite fuera de línea (MAC: ${data.sensorName}) en Sector ${data.sectorId}.`,
                        fecha: new Date().toLocaleTimeString(),
                        tipo: 'advertencia'
                    };
                    return [nuevaAlerta, ...prev];
                });
            }
            else if (data.isActive) {
                setNotifications(prev => prev.filter(n => n.id !== `mod-${data.mac}`));
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="bg-surface min-h-screen">
            <header
                className="fixed top-0 inset-x-0 z-50 bg-[#ffffff] shadow-[0_32px_48px_rgba(25,28,30,0.06)] border-none">
                <div className="max-w-full flex justify-between items-center h-16 px-8 md:px-12">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center">
                            <img alt="KYROS Logo" className="h-15 w-15 object-contain"
                                src={kyrosLogo}
                            />
                        </div>

                        <nav
                            className="hidden md:flex gap-6 items-center text-brand-blue dark:text-blue-400 font-manrope tracking-tight">
                            <NavLink to="/dashboard"
                                className={({ isActive }) =>
                                    `text-base py-4 transition-colors ${isActive
                                        ? "text-brand-blue dark:text-blue-400 font-bold border-b-2 border-brand-blue"
                                        : "text-slate-500 dark:text-slate-400 hover:text-brand-blue"
                                    }`
                                }>Dashboard</NavLink>
                            <NavLink to="/telemetry"
                                className={`text-base py-4 transition-colors ${isTelemetryActive
                                    ? "text-brand-blue dark:text-blue-400 font-bold border-b-2 border-brand-blue"
                                    : "text-slate-500 dark:text-slate-400 hover:text-brand-blue"
                                    }`
                                }>Telemetría</NavLink>
                            <NavLink to="/automation"
                                className={({ isActive }) =>
                                    `text-base py-4 transition-colors ${isActive
                                        ? "text-brand-blue dark:text-blue-400 font-bold border-b-2 border-brand-blue"
                                        : "text-slate-500 dark:text-slate-400 hover:text-brand-blue"
                                    }`
                                }>Automatización</NavLink>
                            <NavLink to="/shop"
                                className={({ isActive }) =>
                                    `text-base py-4 transition-colors ${isActive
                                        ? "text-brand-blue dark:text-blue-400 font-bold border-b-2 border-brand-blue"
                                        : "text-slate-500 dark:text-slate-400 hover:text-brand-blue"
                                    }`
                                }>Catálogo</NavLink>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className='relative'>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="h-10 w-10 items-center text-on-surface-variant cursor-pointer rounded-xl active:scale-95 hover:bg-zinc-400/10 transition-colors">
                                <span className="align-middle material-symbols-outlined text-2xl!">notifications</span>
                                {notifications.length > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white animate-pulse">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl z-50 dark:bg-zinc-900 dark:border-zinc-800">

                                    {/* Encabezado del Dropdown */}
                                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2 px-2 dark:border-zinc-800">
                                        <span className="font-semibold text-xs text-zinc-700 dark:text-zinc-300">
                                            Alertas Activas en Planta
                                        </span>
                                    </div>

                                    <div className="max-h-64 overflow-y-auto space-y-1">
                                        {notifications.length === 0 ? (
                                            <p className="text-xs text-center py-4 text-zinc-400">
                                                Sistema operando sin fallas de red.
                                            </p>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-2 rounded-lg text-[11px] border-l-4 ${notif.tipo === 'critico'
                                                        ? 'bg-red-50 text-red-800 border-red-500 dark:bg-red-950/20 dark:text-red-300'
                                                        : 'bg-amber-50 text-amber-800 border-amber-500 dark:bg-amber-950/20 dark:text-amber-300'
                                                        }`}
                                                >
                                                    <p className="font-medium leading-tight">{notif.msg}</p>
                                                    <span className="text-[9px] opacity-60 block mt-1">
                                                        Sincronizado: {notif.fecha}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <NavLink to="/help"
                            className={({ isActive }) =>
                                `h-10 w-10 items-center cursor-pointer rounded-xl hover:bg-zinc-400/10 active:scale-95 transition-colors ${isActive
                                    ? "text-brand-blue dark:text-blue-400" :
                                    "text-on-surface-variant"}`
                            }>
                            <span className="p-1 pl-2 material-symbols-outlined text-2xl!">help_outline</span>
                        </NavLink>
                        <div className="relative">
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="h-9 w-9 items-center cursor-pointer text-on-surface-variant rounded-xl overflow-hidden border border-outline-variant/10 ml-2 active:scale-95 hover:bg-zinc-400/10 transition-colors">
                                <span className="align-middle material-symbols-outlined text-2xl!">person</span>
                            </button>

                            {isProfileOpen && (
                                <>
                                    <div
                                        class="rounded-md border border-on-surface-variant/10 bg-surface-container p-1 shadow-md grid min-w-40 absolute right-0 mt-2">
                                        {isLoggedIn ? (
                                            <Link
                                                onClick={handleLogout}
                                                className="px-4 py-2 text-sm text-error hover:bg-on-surface-variant/10 rounded-sm transition-colors active:scale-95 cursor-pointer"
                                            >Cerrar sesión</Link>
                                        ) : (
                                            <Link to="/signin"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="px-4 py-2 text-sm text-on-surface hover:bg-on-surface-variant/10 rounded-sm transition-colors active:scale-95 cursor-pointer"
                                            >Iniciar sesión</Link>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div>
                <Routes>
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard onOpenPanel={() => setIsPanelOpen(true)} />
                        </ProtectedRoute>
                    } />
                    <Route path="/telemetry" element={
                        <ProtectedRoute>
                            <Telemetry />
                        </ProtectedRoute>
                    } />
                    <Route path="/edit-sector" element={
                        <ProtectedRoute>
                            <EditSector />
                        </ProtectedRoute>
                    } />

                    <Route path="/modules" element={
                        <ProtectedRoute>
                            <Modules />
                        </ProtectedRoute>
                    } />
                    <Route path="/module-info" element={
                        <ProtectedRoute>
                            <ModuleInfo />
                        </ProtectedRoute>
                    } />
                    <Route path="/link-device" element={
                        <ProtectedRoute>
                            <LinkDevice />
                        </ProtectedRoute>
                    } />
                    <Route path="/help" element={<Help />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/automation" element={<Automation />} />
                    <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/signin"} replace />} />

                </Routes>
            </div>
        </div>
    )
}

export default App;
