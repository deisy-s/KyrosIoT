import { useState, useEffect } from 'react'
import kyrosLogo from '../assets/kyrosLogo.jpeg'
import { Routes, Route, Link, NavLink, useLocation, Navigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { Menu, X, Bell, HelpCircle, User, LayoutDashboard, Activity, Cpu, ShoppingBag } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import SignIn from './SignIn.jsx';
import SignUp from './SignUp.jsx';
import Dashboard from './Dashboard.jsx';
import Telemetry from './Telemetry.jsx';
import EditSector from './EditSector.jsx';
import Modules from './Modules.jsx';
import Sectors from './Sectors.jsx';
import Shop from './Shop.jsx';
import Help from './Help.jsx';
import ModuleInfo from './ModuleInfo.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Automation from './Automation.jsx';
import LinkDevice from './LinkDevice.jsx';
import '../App.css'

const MySwal = withReactContent(Swal);

const App = () => {
    const location = useLocation();

    const isTelemetryActive =
        location.pathname.includes('/telemetry') ||
        location.pathname.includes('/edit-sector') ||
        location.pathname.includes('/modules') ||
        location.pathname.includes('/module-info') ||
        location.pathname.includes('/link-device');

    // Usar estado para isLoggedIn para evitar redirecciones en fase de render
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [pendingDevices, setPendingDevices] = useState([]);

    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem('user'));
        setUser(localUser);
        setIsLoggedIn(!!localUser);
    }, [location.pathname]);

    // Polling de dispositivos pendientes
    useEffect(() => {
        if (!isLoggedIn) return;

        const checkPending = async () => {
            try {
                const { data, error } = await insforge
                    .from('modules')
                    .select('id, name, mac_address, type')
                    .eq('status', 'pending');
                
                if (error) throw error;
                setPendingDevices(data || []);
            } catch (err) {
                console.error("Error consultando pendientes:", err);
            }
        };

        checkPending();
        const interval = setInterval(checkPending, 5000);
        return () => clearInterval(interval);
    }, [isLoggedIn]);

    // Cerrar menú móvil al cambiar de ruta
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await insforge.auth.signOut();
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        window.location.href = '/signin';
    };

    const handleOnboardDevice = async (device) => {
        try {
            // Obtener sectores para el select
            const { data: sectors, error: sError } = await insforge.from('sectors').select('sector_id, name');
            if (sError) throw sError;

            const sectorOptions = sectors.map(s => `<option value="${s.sector_id}">${s.name}</option>`).join('');

            const { value: formValues } = await MySwal.fire({
                title: 'Configurar Nuevo Dispositivo',
                html: `
                    <div class="text-left space-y-4 font-manrope">
                        <p class="text-xs text-slate-500 mb-4">MAC: ${device.mac_address}</p>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Nombre del Dispositivo</label>
                            <input id="onboard-name" class="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all" value="${device.name}">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Asignar a Sector</label>
                            <select id="onboard-sector" class="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all">
                                <option value="">-- Seleccionar Sector --</option>
                                ${sectorOptions}
                            </select>
                        </div>
                    </div>
                `,
                confirmButtonText: 'Activar Dispositivo',
                confirmButtonColor: '#0061FF',
                showCancelButton: true,
                cancelButtonText: 'Más tarde',
                customClass: {
                    popup: 'rounded-3xl',
                    confirmButton: 'rounded-xl px-6 py-3 font-bold',
                    cancelButton: 'rounded-xl px-6 py-3 font-bold'
                },
                preConfirm: () => {
                    const name = document.getElementById('onboard-name').value;
                    const sector_id = document.getElementById('onboard-sector').value;
                    if (!name || !sector_id) {
                        Swal.showValidationMessage('Todos los campos son obligatorios');
                    }
                    return { name, sector_id };
                }
            });

            if (formValues) {
                const { error: uError } = await insforge
                    .from('modules')
                    .update({ 
                        name: formValues.name, 
                        sector_id: formValues.sector_id, 
                        status: 'active' 
                    })
                    .eq('id', device.id);

                if (uError) throw uError;

                MySwal.fire({
                    title: '¡Listo!',
                    text: 'El dispositivo ya está activo y enviando datos.',
                    icon: 'success',
                    confirmButtonColor: '#0061FF',
                    customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl' }
                });
                
                // Forzar actualización de la lista
                setPendingDevices(prev => prev.filter(d => d.id !== device.id));
            }
        } catch (err) {
            console.error("Error en onboarding:", err);
            MySwal.fire('Error', 'No se pudo configurar el dispositivo', 'error');
        }
    };

    const handleOpenNotifications = () => {
        if (pendingDevices.length === 0) {
            MySwal.fire({
                title: 'Notificaciones',
                text: 'No tienes dispositivos pendientes de configuración.',
                icon: 'info',
                confirmButtonColor: '#0061FF',
                customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl' }
            });
            return;
        }

        MySwal.fire({
            title: 'Nuevos Dispositivos Detectados',
            html: `
                <div class="space-y-3 mt-4">
                    ${pendingDevices.map(device => `
                        <div class="flex items-center justify-between p-4 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl">
                            <div class="text-left">
                                <p class="font-bold text-on-surface">${device.name}</p>
                                <p class="text-[10px] text-slate-500 font-mono">${device.mac_address}</p>
                            </div>
                            <button onclick="window.onboardDevice('${device.id}')" class="bg-brand-blue text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-brand-blue/90 transition-colors cursor-pointer">
                                Configurar
                            </button>
                        </div>
                    `).join('')}
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            customClass: { popup: 'rounded-3xl' },
            didOpen: () => {
                window.onboardDevice = (id) => {
                    const device = pendingDevices.find(d => d.id === id);
                    if (device) {
                        Swal.close();
                        handleOnboardDevice(device);
                    }
                };
            }
        });
    };

    const navLinks = [
        { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, active: location.pathname === "/dashboard" },
        { to: "/telemetry", label: "Telemetría", icon: <Activity size={20} />, active: isTelemetryActive },
        { to: "/automation", label: "Automatización", icon: <Cpu size={20} />, active: location.pathname === "/automation" },
        { to: "/shop", label: "Catálogo", icon: <ShoppingBag size={20} />, active: location.pathname === "/shop" }
    ];

    return (
        <div className="bg-surface min-h-screen">
            <header
                className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-b border-on-surface-variant/5">
                <div className="max-w-full flex justify-between items-center h-16 px-6 md:px-12">
                    <div className="flex items-center gap-4 md:gap-8">
                        {/* Hamburger Button (Mobile Only) */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-colors cursor-pointer"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <div className="flex items-center">
                            <img alt="KYROS Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain"
                                src={kyrosLogo}
                            />
                        </div>

                        {/* Desktop Navigation */}
                        <nav
                            className="hidden md:flex gap-6 items-center text-brand-blue font-manrope tracking-tight">
                            {navLinks.map((link) => (
                                <NavLink 
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `text-sm py-5 transition-all border-b-2 ${link.active || isActive
                                            ? "text-brand-blue font-bold border-brand-blue"
                                            : "text-slate-500 border-transparent hover:text-brand-blue"
                                        }`
                                    }>{link.label}</NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={handleOpenNotifications}
                            className="relative sm:flex h-10 w-10 items-center justify-center text-on-surface-variant cursor-pointer rounded-xl active:scale-95 hover:bg-zinc-400/10 transition-colors">
                            <Bell size={20} />
                            {pendingDevices.length > 0 && (
                                <span className="absolute top-2 right-2 w-4 h-4 bg-error text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                                    {pendingDevices.length}
                                </span>
                            )}
                        </button>
                        <NavLink to="/help"
                            className={({ isActive }) =>
                                `h-10 w-10 flex items-center justify-center cursor-pointer rounded-xl hover:bg-zinc-400/10 active:scale-95 transition-colors ${isActive
                                    ? "text-brand-blue" :
                                    "text-on-surface-variant"}`
                            }>
                            <HelpCircle size={20} />
                        </NavLink>
                        
                        <div className="relative">
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="h-10 w-10 flex items-center justify-center cursor-pointer text-on-surface-variant rounded-xl overflow-hidden border border-outline-variant/10 active:scale-95 hover:bg-zinc-400/10 transition-colors">
                                <User size={20} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-on-surface-variant/10 rounded-xl shadow-xl p-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                    {isLoggedIn ? (
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 text-sm text-error font-bold hover:bg-error/5 rounded-lg transition-colors cursor-pointer"
                                        >Cerrar sesión</button>
                                    ):(
                                        <Link to="/signin"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="block px-4 py-3 text-sm text-on-surface font-bold hover:bg-brand-blue/5 rounded-lg transition-colors cursor-pointer"
                                        >Iniciar sesión</Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-16 inset-x-0 bg-white border-b border-on-surface-variant/10 shadow-xl animate-in slide-in-from-top duration-300 z-40">
                        <nav className="flex flex-col p-4 gap-2">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-4 p-4 rounded-xl font-bold transition-all ${link.active || isActive
                                            ? "bg-brand-blue/10 text-brand-blue"
                                            : "text-slate-600 hover:bg-slate-50"
                                        }`
                                    }
                                >
                                    {link.icon}
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            <div className="transition-all duration-300">
                <Routes>
                    <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/signin"} replace />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/telemetry" element={
                        <ProtectedRoute>
                            <Telemetry />
                        </ProtectedRoute>
                    } />
                    <Route path="/sectors" element={
                        <ProtectedRoute>
                            <Sectors />
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

                </Routes>
            </div>
        </div>
    )
}

export default App;
