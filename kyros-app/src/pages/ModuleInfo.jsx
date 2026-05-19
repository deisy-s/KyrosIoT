import { useNavigate, useParams, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Chart from 'react-apexcharts';
import '../App.css'

const ModuleInfo = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const module = location.state?.module; // Obtener la información del módulo desde el estado de navegación

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
                    <nav className="flex items-center gap-2 text-xs font-bold text-brand-blue mb-2 tracking-widest uppercase">
                        <span onClick={() => navigate(-1)} className="text-brand-blue cursor-pointer mr-3 material-symbols-outlined text-[20px]! rounded-full hover:bg-brand-blue/10 active:scale-95">arrow_back</span>
                        <span>Módulos de {module.SectorName}</span>
                        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                        <span className="text-outline text-on-surface">{module.Name}</span>
                    </nav>
                    <h1 className="text-on-surface tracking-[-0.04em] leading-tight text-4xl font-bold">{module.Name}</h1>
                    <p className="text-on-surface-variant text-base mt-1">MAC: {module.MAC} • Sector: {module.SectorName}</p>
                </div>

                <div className="flex gap-3">
                    <span className="px-4 py-2 bg-brand-blue/10 text-brand-blue font-bold text-sm rounded-2xl flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></span>
                        En línea
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* TARJETA DE LA GRÁFICA GIGANTE */}
                <div className="lg:col-span-2 bg-surface-container border border-brand-blue/10 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Histórico de Telemetría</h2>
                    <div className="w-full h-87.5">
                        <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
                    </div>
                </div>

                {/* PANEL LATERAL DE MÉTRICAS ACTUALES */}
                <div className="flex flex-col gap-6">
                    <div className="bg-surface-container border border-brand-blue/10 rounded-2xl p-6 shadow-sm">
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

                    <div className="bg-surface-container border border-brand-blue/10 rounded-2xl p-6 shadow-sm">
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