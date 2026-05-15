import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { useNavigate } from 'react-router-dom';

const ModuleInfo = () => {
    const navigate = useNavigate();

    // Configuración visual de la gráfica industrial
    const [chartOptions] = useState({
        chart: {
            type: 'area',
            fontFamily: 'Inter, sans-serif',
            toolbar: { show: false },
            zoom: { enabled: false },
            background: 'transparent'
        },
        colors: ['#0056D2', '#00B4D8'], // Colores KYROS
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: {
            categories: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
            labels: { style: { colors: '#8E918F' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { style: { colors: '#8E918F' } }
        },
        grid: {
            borderColor: 'rgba(142, 145, 143, 0.1)',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } }
        },
        theme: { mode: 'light' }, // Cambiar a 'dark' si el dashboard principal es oscuro
        legend: { position: 'top', horizontalAlign: 'right' }
    });

    // Datos simulados (Aquí luego conectaremos tu ESP32)
    const [chartSeries] = useState([
        { name: 'Temperatura (°C)', data: [22, 24, 28, 35, 32, 29, 26] },
        { name: 'Humedad (%)', data: [45, 42, 38, 30, 35, 40, 44] }
    ]);

    return (
        <div className="bg-surface min-h-screen pt-25 px-6 md:px-12 pb-12 w-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-brand-blue font-bold text-sm mb-4 hover:underline cursor-pointer">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Volver al Sector
                    </button>
                    <h1 className="text-on-surface tracking-[-0.04em] leading-tight text-3xl font-bold">Módulo: Sensor DTH-22</h1>
                    <p className="text-on-surface-variant text-base mt-1">MAC: E4:B0:63:41:F6:A4 • Sector: Línea de Producción 1</p>
                </div>
                <div className="flex gap-3">
                    <span className="px-4 py-2 bg-green-500/10 text-green-600 font-bold text-sm rounded-lg border border-green-500/20 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        En línea
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* TARJETA DE LA GRÁFICA GIGANTE */}
                <div className="lg:col-span-2 bg-surface-container border border-outline-variant/10 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Histórico de Telemetría</h2>
                    <div className="w-full h-[350px]">
                        <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
                    </div>
                </div>

                {/* PANEL LATERAL DE MÉTRICAS ACTUALES */}
                <div className="flex flex-col gap-6">
                    <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Temperatura Actual</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-black text-on-surface">26.0</span>
                            <span className="text-xl text-brand-blue font-bold mb-1">°C</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-4 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-error">trending_up</span> 
                            +2.4°C desde la última hora
                        </p>
                    </div>

                    <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Humedad Relativa</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-black text-on-surface">44</span>
                            <span className="text-xl text-brand-blue font-bold mb-1">%</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-4 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-green-500">trending_down</span> 
                            Niveles óptimos de operación
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleInfo;