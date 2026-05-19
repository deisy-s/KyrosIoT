import React, { useState } from 'react';
import kyrosLogo from '../assets/kyros.png'
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import '../App.css'

const SignIn = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();
            if (response.ok) {
                withReactContent(Swal).fire({
                    title: <i>Se ha iniciado sesión</i>,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#003f87',
                })
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                withReactContent(Swal).fire({
                    title: <i>Error al iniciar sesión</i>,
                    text: 'Usuario o contraseña incorrectos. Por favor, intente de nuevo.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#ba1a1a',
                })
            }

        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full grow flex items-center justify-center">
                <div className="z-10 w-full max-w-120">
                    <div className="flex flex-col items-center mb-10">
                        <img alt="Kyros IoT Logo" className="h-20 w-auto object-contain" src={kyrosLogo} />
                    </div>

                    <div className="bg-surface-container rounded-xl overflow-hidden">
                        <div className="p-10 md:p-12">
                            <header className="mb-8">
                                <h1 className="font-headline text-headline-md text-3xl font-black text-on-surface tracking-tight mb-2">Inicio de sesión</h1>
                                <p className="text-on-surface-variant font-body text-body-md tracking-normal">Ingrese sus credenciales de operador para acceder al sistema.</p>
                            </header>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label className="block font-label text-label-sm font-bold text-on-surface-variant uppercase tracking-wider" for="operator-id">Usuario / Correo electrónico</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-[20px]!">account_circle</span>
                                        </div>
                                        <input name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-on-surface-variant/6 text-on-surface font-body text-body-md rounded-lg focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200 outline-none"
                                            placeholder="e.g. OP-8829-X"
                                            required
                                            type="text" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block font-label text-label-sm font-bold text-on-surface-variant uppercase tracking-wider" for="security-key">Contraseña</label>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-[20px]!">lock</span>
                                        </div>
                                        <input name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-on-surface-variant/6 text-on-surface font-body text-body-md rounded-lg focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200 outline-none" 
                                            id="security-key" 
                                            placeholder="••••••••••••" 
                                            required
                                            type={showPassword ? "text" : "password"} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input checked={showPassword}
                                                onChange={() => setShowPassword(!showPassword)}
                                                className="peer h-5 w-5 rounded border-outline-variant/50 text-primary focus:ring-primary/20 transition-all duration-200 bg-surface-container" type="checkbox" />
                                        </div>
                                        <span className="ml-3 font-body text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Mostrar contraseña</span>
                                    </label>
                                </div>

                                <button className="w-full flex justify-center items-center gap-2 py-4 px-6 cursor-pointer bg-linear-to-br from-brand-blue to-brand-light text-white font-headline font-bold text-lg rounded-lg shadow-lg shadow-brand-blue/20 hover:scale-[1.01] active:scale-95 transition-all duration-200 group" type="submit">
                                    <span>Iniciar sesión</span>
                                    <span className="material-symbols-outlined text-[20px]! group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>

                                <div className="text-center">
                                    <NavLink to="/signup"
                                        className="font-label text-label-sm font-bold text-brand-blue hover:text-brand-light transition-colors tracking-wide text-xs">
                                        ¿No tiene una cuenta? <br></br> Regístrese aquí
                                    </NavLink>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default SignIn;