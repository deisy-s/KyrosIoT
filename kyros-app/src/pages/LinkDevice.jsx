import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../App.css';

const MySwal = withReactContent(Swal);

export default function LinkDevice() {
    const [codigo, setCodigo] = useState('');
    const [nombre, setNombre] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleVinculation = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            /* // LLAMADA REAL CUANDO DEISY CREE LA RUTA EN EL BACKEND
            const res = await fetch('http://localhost:5000/api/sectors/link', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ codigoVinculacion: codigo, nombreSector: nombre })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'PIN incorrecto o Core no encontrado');
            */

            // Simulación de conexión exitosa
            setTimeout(() => {
                setLoading(false);
                MySwal.fire({
                    title: '¡Core Vinculado!',
                    text: `El dispositivo ha sido asignado al sector: "${nombre}".`,
                    icon: 'success',
                    confirmButtonColor: '#003f87'
                }).then(() => {
                    navigate('/telemetry');
                });
            }, 1500);

        } catch (error) {
            setLoading(false);
            MySwal.fire({
                title: <i>Error de vinculación</i>,
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#ba1a1a',
            })
        }
    };

    return (
        <div className="bg-surface min-h-screen pt-25 px-6 md:px-12 flex flex-col items-center">

            <div className="w-full max-w-md flex justify-start mb-4">
                <button
                    onClick={() => navigate('/telemetry')}
                    className="flex items-center gap-2 text-brand-blue font-bold text-sm"
                >
                    <span className="material-symbols-outlined text-[20px]! hover:bg-brand-blue/10 transition-all active:scale-95 rounded-full cursor-pointer">arrow_back</span>
                    Volver a Telemetría
                </button>
            </div>

            <div className="w-full max-w-md bg-surface-container border border-brand-blue/10 shadow-sm p-8 rounded-2xl hover:shadow-md transition-shadow mb-10">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-blue/20">
                        <span className="material-symbols-outlined text-brand-blue text-4xl!">qr_code_scanner</span>
                    </div>
                    <h1 className="text-2xl font-bold text-on-surface tracking-tight">Vincular Nuevo Core</h1>
                    <p className="text-on-surface-variant text-sm mt-2">
                        Introduzca el PIN de 6 dígitos que se encuentra en la etiqueta trasera de su KYROSYS Core
                    </p>
                </div>

                <form onSubmit={handleVinculation} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block font-label text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                            PIN de Dispositivo
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                <span className="material-symbols-outlined text-[20px]!">fiber_pin</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Ej: KY-F6A4"
                                className="w-full pl-11 pr-4 py-3.5 bg-on-surface-variant/6 text-on-surface font-body text-body-md rounded-lg focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200 outline-none"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                                required
                                maxLength={8}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block font-label text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
                            Nombre del Sector
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                <span className="material-symbols-outlined text-[20px]!">description</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Ej: Planta Procesado A"
                                className="w-full pl-11 pr-4 py-3.5 bg-on-surface-variant/6 text-on-surface font-body text-body-md rounded-lg focus:ring-2 focus:ring-inset focus:ring-primary transition-all duration-200 outline-none"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full technical-gradient text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                Verificando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg!">link</span>
                                Confirmar Vinculación
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}