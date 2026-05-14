import { useState } from 'react'
import kyrosLogo from '../assets/kyros.png'
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import SignIn from './SignIn.jsx';
import SignUp from './SignUp.jsx';
import Dashboard from './Dashboard.jsx';
import Telemetry from './Telemetry.jsx';
import EditSector from './EditSector.jsx';
import Modules from './Modules.jsx';
import Help from './Help.jsx';
import ModuleInfo from './ModuleInfo.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import '../App.css'

const App = () => {
    const location = useLocation();

    const isTelemetryActive =
        location.pathname.includes('/telemetry') ||
        location.pathname.includes('/edit-sector') ||
        location.pathname.includes('/modules') ||
        location.pathname.includes('/module-info');

    const user = JSON.parse(localStorage.getItem('user'));
    const isLoggedIn = !!user;

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        localStorage.removeItem('user');
        window.location.href = '/signin';
    };

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
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            className="h-10 w-10 items-center text-on-surface-variant cursor-pointer rounded-xl active:scale-95 hover:bg-zinc-400/10 transition-colors">
                            <span className="align-middle material-symbols-outlined text-2xl!">notifications</span>
                        </button>
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
                                        class="rounded-md border bg-surface-container p-1 shadow-md grid min-w-40 absolute right-0 mt-2">
                                        {isLoggedIn ? (
                                            <Link
                                                onClick={handleLogout}
                                                className="px-4 py-2 text-sm text-error hover:bg-on-surface-variant/10 rounded-sm transition-colors active:scale-95 cursor-pointer"
                                            >Cerrar sesión</Link>
                                        ):(
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
                    <Route path="/help" element={
                        <ProtectedRoute>
                            <Help />
                        </ProtectedRoute>
                    } />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />

                </Routes>
            </div>
        </div>
    )
}

export default App;
