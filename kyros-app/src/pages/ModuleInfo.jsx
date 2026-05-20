import { useNavigate, useParams, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import io from 'socket.io-client';
import Chart from 'react-apexcharts';
import '../App.css'
import API_BASE from '../lib/api.js';

const ModuleInfo = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const module = location.state?.module; // Obtener la información del módulo desde el estado de navegación

    // Configuración visual de la gráfica industrial
    const [baseChartOptions, setChartOptions] = useState({
        chart: {
            id: 'realtime-kyros',
            type: 'area',
            fontFamily: 'Inter, sans-serif',
            toolbar: { show: false },
            zoom: { enabled: false },
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: { speed: 500 }
            },
            background: 'transparent'
        },
        colors: ['#003F87', '#00B4D8'],
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
            type: 'datetime',
            labels: {
                datetimeUTC: false,
                format: 'HH:mm:ss',
                style: { colors: '#8E918F' }
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
            range: undefined
        },
        yaxis: { labels: { style: { colors: '#8E918F' } } },
        tooltip: {
            enabled: true,
            shared: true,
            x: {
                format: 'HH:mm:ss'
            },
            theme: 'light'
        }, grid: {
            borderColor: 'rgba(142, 145, 143, 0.1)',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } }
        },
        legend: { position: 'top', horizontalAlign: 'right' }
    });

    const tempChartOptions = {
        ...baseChartOptions,
        colors: ['#003f87'], 
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        },
        yaxis: {
            ...baseChartOptions.yaxis,
            labels: {
                ...baseChartOptions.yaxis.labels,
                formatter: (val) => `${val.toFixed(1)} °C` 
            }
        }
    };

    const humChartOptions = {
        ...baseChartOptions,
        colors: ['#06B6D4'], 
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        },
        yaxis: {
            ...baseChartOptions.yaxis,
            labels: {
                ...baseChartOptions.yaxis.labels,
                formatter: (val) => `${val.toFixed(0)} %` 
            }
        }
    };

    const generalChartOptions = {
        ...baseChartOptions,
        colors: ['#003f87'], 
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.3,
                opacityTo: 0.0,
                stops: [0, 100]
            }
        }
    };

    // Datos simulados
    // const [chartSeries] = useState([
    //     { name: 'Temperatura (°C)', data: [22, 24, 28, 35, 32, 29, 26] },
    //     { name: 'Humedad (%)', data: [45, 42, 38, 30, 35, 40, 44] }
    // ]);

    const [lecturasRaw, setLecturasRaw] = useState([]);

    const datosTemperatura = lecturasRaw
        .filter(l => l.tipo === "temperatura")
        .map(l => ({ x: new Date(l.fecha).getTime(), y: l.valor }));

    const datosHumedad = lecturasRaw
        .filter(l => l.tipo === "humedad")
        .map(l => ({ x: new Date(l.fecha).getTime(), y: l.valor }));

    // 1. Declaramos la variable que contendrá las series finales de la gráfica
    let chartSeries = [];

    // 2. Evaluamos de qué tipo es el módulo actual que se está visitando
    // (Asegúrate de usar la propiedad exacta de tu objeto de módulo, por ejemplo: module?.Type o module?.tipo)
    const tipoModulo = module?.Type || module?.tipo;

    // Leyendas y series de cada tipo de módulo
    let tempSeries = [];
    let humSeries = [];
    let generalSeries = [];

    switch (tipoModulo) {
        case "Temperatura y Humedad":
            tempSeries = [
                {
                    name: 'Temperatura (°C)',
                    data: lecturasRaw
                        .filter(l => l.tipo === "temperatura")
                        .map(l => ({ x: new Date(l.fecha).getTime(), y: l.valor }))
                }
            ];
            humSeries = [
                {
                    name: 'Humedad Relativa (%)',
                    data: lecturasRaw
                        .filter(l => l.tipo === "humidity" || l.tipo === "humedad")
                        .map(l => ({ x: new Date(l.fecha).getTime(), y: l.valor }))
                }
            ];
            break;

        case "Humo y Gas":
            generalSeries = [
                {
                    name: 'Presencia de Humo/Gas (ppm)',
                    data: lecturasRaw
                        .filter(l => l.tipo === "humo")
                        .map(l => ({ x: new Date(l.fecha).getTime(), y: l.valor }))
                }
            ];
            break;

        case "Movimiento":
            generalSeries = [
                {
                    name: 'Detección de Movimiento (Estado)',
                    data: lecturasRaw
                        .filter(l => l.tipo === "movimiento")
                        .map(l => ({ x: new Date(l.fecha).getTime(), y: l.valor }))
                }
            ];
            break;

        default:
            generalSeries = [
                {
                    name: 'Métrica General',
                    data: lecturasRaw.map(l => ({ x: new Date(l.fecha).getTime(), y: l.valor }))
                }
            ];
            break;
    }

    useEffect(() => {
        const cargarHistorial = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/iot/telemetria/${module.MAC}`);
                if (res.ok) {
                    const data = await res.json();
                    setLecturasRaw(data);
                }
            } catch (err) {
                console.error("Error cargando historial de telemetría", err);
            }
        };

        if (module) cargarHistorial();
    }, [module]);

    useEffect(() => {
        if (!module.MAC) return;

        // Conectar al WebSocket apuntando a tu puerto del backend
        const socket = io('http://localhost:5000');

        socket.on(`telemetria-${module.MAC}`, (nuevaLectura) => {
            setLecturasRaw((prevLecturas) => {
                const actualizadas = [...prevLecturas, nuevaLectura];

                const limiteTiempo = Date.now() - 10 * 60 * 1000;

                return actualizadas.filter(l => new Date(l.fecha).getTime() >= limiteTiempo);
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [module.MAC]);

    const SENSOR_CONFIGS = {
        temperatura: {
            titulo: "Temperatura Actual",
            unidad: "°C",
            iconoTendencia: "thermostat",
            colorIcono: "text-brand-blue",
            obtenerMensaje: (valor) => {
                if (valor > 35) return { texto: "¡ALERTA SOBRECALIENTO!", color: "text-error font-bold animate-pulse" };
                if (valor < 15) return { texto: "Temperatura baja detectada", color: "text-info" };
                return { texto: "Temperatura estable en sector", color: "text-green-500" };
            }
        },
        humedad: {
            titulo: "Humedad Relativa",
            unidad: "%",
            iconoTendencia: "humidity_percentage",
            colorIcono: "text-brand-blue",
            obtenerMensaje: (valor) => {
                if (valor > 70) return { texto: "¡HUMEDAD ALTA!", color: "text-error font-bold animate-pulse" };
                return { texto: "Niveles óptimos de operación", color: "text-green-500" };
            }
        },
        humo: {
            titulo: "Detección de Humo",
            unidad: " ppm",
            iconoTendencia: "detector_smoke",
            colorIcono: "text-brand-blue",
            obtenerMensaje: (valor) => {
                if (valor > 400) return { texto: "¡ALERTA CRÍTICA DE HUMO O GAS!", color: "text-error font-bold animate-pulse" };
                return { texto: "Atmósfera limpia y segura", color: "text-green-500" };
            }
        }
    };

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
                    <span className={`px-4 py-2 font-bold text-sm rounded-2xl flex items-center gap-2 ${module.Status === "active" ? "bg-brand-blue/10 text-brand-blue" : "bg-error/10 text-error"}`}>
                        <span className={'w-2 h-2 rounded-full animate-pulse ' + (module.Status === 'active' ? 'bg-brand-blue' : 'bg-red-500')}></span>
                        {module.Status === 'active' ? 'Activo' : module.Status === 'alert' ? 'Alerta' : module.Status === 'maintenance' ? 'Mantenimiento Requerido' : 'Inactivo'}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* TARJETA DE LA GRÁFICA GIGANTE */}
                {tipoModulo === "Temperatura y Humedad" ? (
                    <div className="lg:col-span-2 bg-surface-container border border-brand-blue/10 rounded-2xl p-6 shadow-sm">
                        {/* Gráfico de Temperatura */}
                        <div className="bg-surface-container border border-brand-blue/10 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Histórico de Temperatura</h2>
                            <div className="w-full h-87.5">
                                <Chart options={tempChartOptions} series={tempSeries} type="area" height="100%" />
                            </div>
                        </div>

                        {/* Gráfico de Humedad */}
                        <div className="bg-surface-container border border-brand-blue/10 rounded-2xl p-6 shadow-sm mt-5">
                            <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Histórico de Humedad Relativa</h2>
                            <div className="w-full h-87.5">
                                <Chart options={humChartOptions} series={humSeries} type="area" height="100%" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-2 bg-surface-container border border-brand-blue/10 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Histórico de Telemetría</h2>
                        <div className="w-full h-87.5">
                            <Chart options={generalChartOptions} series={generalSeries} type="area" height="100%" />
                        </div>
                    </div>
                )}

                {/* PANEL LATERAL DE MÉTRICAS ACTUALES */}
                <div className="flex flex-col gap-6">
                    {Object.keys(SENSOR_CONFIGS).map((tipoClave) => {
                        const lecturasFiltradas = lecturasRaw.filter(l => l.tipo === tipoClave);

                        if (lecturasFiltradas.length === 0 && module?.Type !== tipoClave) return null;

                        const ultimoRegistro = lecturasFiltradas[lecturasFiltradas.length - 1];
                        const valorActual = ultimoRegistro ? ultimoRegistro.valor : (Number(module?.DetailValue) || 0);

                        const config = SENSOR_CONFIGS[tipoClave];
                        const alerta = config.obtenerMensaje(valorActual);

                        return (
                            <div
                                key={tipoClave}
                                className="bg-surface-container border border-brand-blue/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <span className={`material-symbols-outlined text-2xl! ${config.colorIcono}`}>
                                            {config.iconoTendencia}
                                        </span>
                                        {config.titulo}
                                    </h3>

                                    <div className="flex items-end gap-2 mt-2">
                                        <span className="text-5xl font-black text-on-surface tracking-tight">
                                            {valorActual.toFixed(1)}
                                        </span>
                                        <span className="text-xl text-on-surface-variant font-bold mb-1">
                                            {config.unidad}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm text-on-surface-variant mt-4 flex items-center gap-1.5 border-t border-brand-blue/5 pt-3">
                                    <span className={`material-symbols-outlined text-xl! ${alerta.color}`}>
                                        {(tipoClave === 'temperatura' && valorActual > 35) ||
                                            (tipoClave === 'humo' && valorActual > 400) ||
                                            (tipoClave === 'humedad' && valorActual > 70)
                                            ? 'warning' : 'check_circle'}
                                    </span>
                                    <span className={alerta.color}>
                                        {alerta.texto}
                                    </span>
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ModuleInfo;  