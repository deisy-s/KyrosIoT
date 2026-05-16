import { useNavigate } from 'react-router-dom';
import '../App.css';

const Help = () => {
    const navigate = useNavigate();

    const faqs = [
        {
            q: "¿Cómo vinculo un nuevo KYROSYS Core a mi planta?",
            a: "Dirígete a la pestaña de 'Telemetría', haz clic en 'Vincular Nuevo Core' e ingresa el PIN de 6 dígitos (ej. KY-F6A4) que se encuentra impreso en la carcasa trasera de tu hardware."
        },
        {
            q: "¿Cómo organizo los widgets en mi Dashboard?",
            a: "En la pantalla principal, presiona el botón 'Personalizar'. Esto activará el modo edición donde podrás usar las flechas para mover los paneles, eliminarlos o instalar nuevos desde la biblioteca."
        },
        {
            q: "¿Qué significa el estado 'Mantenimiento Requerido'?",
            a: "Indica que uno de tus sensores satélite (ej. Gas o Temperatura) ha registrado parámetros fuera del rango nominal o ha perdido conexión ESP-NOW con el Core. Revisa la pestaña de Módulos para localizar la falla."
        },
        {
            q: "¿Cómo elimino un sector o máquina completa?",
            a: "En 'Telemetría', presiona el ícono de basurero en el sector correspondiente. Por seguridad de la planta, el sistema requerirá tu PIN de Administrador antes de desvincular el hardware."
        }
    ];

    return (
        <div className="bg-surface min-h-screen">
            <main className="pt-25 px-6 md:px-12 pb-12 w-full max-w-5xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-on-surface tracking-[-0.04em] leading-tight text-4xl font-bold">Centro de Soporte</h1>
                    <p className="text-on-surface-variant text-base mt-2">
                        Manual de usuario y respuestas a preguntas frecuentes sobre el ecosistema KYROS.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* COLUMNA IZQUIERDA: ACCIONES RÁPIDAS */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                        <div className="bg-brand-blue text-white rounded-2xl p-6 shadow-lg shadow-brand-blue/20">
                            <span className="material-symbols-outlined text-4xl mb-4">support_agent</span>
                            <h3 className="text-lg font-bold mb-2">Soporte Directo</h3>
                            <p className="text-sm text-white/80 mb-6">Si tienes problemas físicos con tu KYROSYS Core, contacta a nuestro equipo de ingenieros.</p>
                            <button className="w-full bg-white text-brand-blue py-3 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
                                Solicitar Asistencia
                            </button>
                        </div>
                        <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6">
                            <span className="material-symbols-outlined text-brand-blue text-3xl mb-3">menu_book</span>
                            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-1">Documentación</h3>
                            <p className="text-xs text-on-surface-variant mb-4">Manual técnico de integración IIoT.</p>
                            <button className="text-brand-blue text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer">
                                Descargar PDF <span className="material-symbols-outlined text-[16px]">download</span>
                            </button>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: FAQ */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                        <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">help</span>
                            Preguntas Frecuentes
                        </h2>
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-surface-container border border-outline-variant/10 rounded-xl p-5 hover:border-brand-blue/30 transition-colors">
                                <h4 className="text-on-surface font-bold text-base mb-2">{faq.q}</h4>
                                <p className="text-sm text-on-surface-variant leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Help;