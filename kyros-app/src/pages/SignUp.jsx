import React, { useState } from 'react';
import kyrosLogo from '../assets/kyros.png'
import { NavLink, useNavigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import '../App.css'

const SignUp = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showPin, setShowPin] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        password: '',
        confirmPassword: '',
        adminPin: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password.length < 8) {
            withReactContent(Swal).fire({
                title: <i>La contraseña es muy corta</i>,
                text: "La contraseña debe contener al menos 8 caracteres",
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#003f87',
            })
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            withReactContent(Swal).fire({
                title: <i>Las contraseñas no coinciden</i>,
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#003f87',
            })
            return;
        }

        try {
            const { data, error } = await insforge.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        companyName: formData.companyName,
                        companyId: `OP-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
                        adminPin: formData.adminPin
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                await insforge.from('user_profiles').insert({
                    id: data.user.id,
                    company_name: formData.companyName,
                    admin_pin: formData.adminPin,
                });

                withReactContent(Swal).fire({
                    title: <i>Cuenta creada exitosamente</i>,
                    text: "Bienvenido a KYROSYS, " + formData.companyName,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#003f87',
                })
                navigate('/signin');
            }
        } catch (error) {
            console.error("Error:", error);
            withReactContent(Swal).fire({
                title: <i>Error al crear cuenta</i>,
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#ba1a1a',
            })
        }
    };

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
                                <h1 className="font-headline text-headline-md text-3xl font-black text-on-surface tracking-tight mb-2">Crear cuenta</h1>
                                <p className="text-on-surface-variant font-body text-body-md tracking-normal">Ingrese la información requerida para crear su cuenta.</p>
                            </header>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label className="block font-label text-label-sm font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="company-name">Nombre de la empresa</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-[20px]!">account_circle</span>
                                        </div>
                                        <input name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-on-surface-variant/6 text-on-surface font-body text-body-md rounded-lg focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200 outline-none" placeholder="e.g. KyrosSys" required type="text" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block font-label text-label-sm font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="email">Correo electrónico</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-[20px]!">mail</span>
                                        </div>
                                        <input name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-on-surface-variant/6 text-on-surface font-body text-body-md rounded-lg focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200 outline-none" placeholder="e.g. usuario@empresa.com" required type="email" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block font-label text-label-sm font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="password">Contraseña</label>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-[20px]!">lock</span>
                                        </div>
                                        <input name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-on-surface-variant/6 text-on-surface font-body text-body-md rounded-lg focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200 outline-none" placeholder="••••••••••••" required type={showPassword ? "text" : "password"} />
                                    </div>

                                    <div className="flex justify-between">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input checked={showPassword}
                                                        onChange={() => setShowPassword(!showPassword)}
                                                        className="peer h-5 w-5 rounded border-outline-variant/50 text-primary focus:ring-primary/20 transition-all duration-200 bg-surface-container" type="checkbox" />
                                                </div>
                                                <span className="ml-3 font-body text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                                                    Mostrar contraseña
                                                </span>
                                            </label>
                                        </div>
                                        <label>
                                            <span className="text-xs text-on-surface-variant">*Mínimamente 8 caracteres</span>
                                        </label>
                                    </div>
                                </div>



                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block font-label text-label-sm font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="confirm-password">Ingrese de nuevo su contraseña</label>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-[20px]!">lock</span>
                                        </div>
                                        <input name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3.5 bg-on-surface-variant/6 text-on-surface font-body text-body-md rounded-lg focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200 outline-none" placeholder="••••••••••••" required type="password" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block font-label text-label-sm font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="admin-pin">PIN de administrador</label>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-[20px]!">dialpad</span>
                                        </div>
                                        <input name="adminPin"
                                            value={formData.adminPin}
                                            onChange={handleChange}
                                                className="block w-full pl-11 pr-4 py-3.5 bg-on-surface-variant/6 text-on-surface font-body text-body-md rounded-lg focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200 outline-none" placeholder="••••••••••••" required type={showPin ? "text" : "password"} />
                                    </div>

                                    <div className="flex justify-between">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input checked={showPin}
                                                        onChange={() => setShowPin(!showPin)}
                                                        className="peer h-5 w-5 rounded border-outline-variant/50 text-primary focus:ring-primary/20 transition-all duration-200 bg-surface-container" type="checkbox" />
                                                </div>
                                                <span className="ml-3 font-body text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                                                    Mostrar pin
                                                </span>
                                            </label>
                                        </div>

                                        <label>
                                            <span className="text-xs text-on-surface-variant">*Mínimamente 4 digitos</span>
                                        </label>
                                    </div>
                                </div>

                                <button className="w-full flex justify-center items-center gap-2 py-4 px-6 cursor-pointer bg-linear-to-br from-brand-blue to-brand-light text-white font-headline font-bold text-lg rounded-lg shadow-lg shadow-brand-blue/20 hover:scale-[1.01] active:scale-95 transition-all duration-200 group" type="submit">
                                    <span>Registrarse</span>
                                    <span className="material-symbols-outlined text-[20px]! group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>

                                <div className="text-center">
                                    <NavLink to="/signin"
                                        className="font-label text-label-sm font-bold text-brand-blue hover:text-brand-light transition-colors tracking-wide text-xs">
                                        ¿Ya tiene una cuenta? <br></br> Inicie sesión aquí
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

export default SignUp;