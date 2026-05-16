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

    const handleVinculacion = async (e) => {
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
                    text: `El dispositivo ha sido asignado al sector: ${nombre}.`,
                    icon: 'success',
                    confirmButtonColor: '#0056D2'
                }).then(() => {
                    navigate('/telemetry'); // Lo regresamos a ver su nueva máquina
                });
            }, 1500);

        } catch (error) {
            setLoading(false);
            MySwal.fire('Error de Vinculación', error.message, 'error');
        }
    };

    return (
        <div className="bg-surface min-h-screen pt-25 px-6 md:px-12 flex flex-col items-center">
            
            <div className="w-full max-w-md flex justify-start mb-4">
                <button 
                    onClick={() => navigate('/telemetry')}
                    className="flex items-center gap-2 text-brand-blue font-bold text-sm hover:underline cursor-pointer transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Volver a Telemetría
                </button>
            </div>

            <div className="w-full max-w-md bg-surface-container border border-outline-variant/10 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-blue/20">
                        <span className="material-symbols-outlined text-brand-blue text-4xl">qr_code_scanner</span>
                    </div>
                    <h1 className="text-2xl font-bold text-on-surface tracking-tight">Vincular Nuevo Core</h1>
                    <p className="text-on-surface-variant text-sm mt-2">
                        Introduce el PIN de 6 dígitos que se encuentra en la etiqueta trasera de tu KYROSYS Core.
                    </p>
                </div>

                <form onSubmit={handleVinculacion} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                            PIN de Dispositivo
                        </label>
                        <input 
                            type="text" 
                            placeholder="Ej: KY-F6A4"
                            className="w-full bg-surface border border-outline-variant/20 rounded-lg p-4 text-on-surface font-mono tracking-widest text-center text-lg focus:border-brand-blue outline-none transition-all uppercase"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                            required
                            maxLength={8}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                            Nombre del Sector
                        </label>
                        <input 
                            type="text" 
                            placeholder="Ej: Planta Procesado A"
                            className="w-full bg-surface border border-outline-variant/20 rounded-lg p-3 text-on-surface focus:border-brand-blue outline-none transition-all"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">sync</span>
                                Verificando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">link</span>
                                Confirmar Vinculación
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}