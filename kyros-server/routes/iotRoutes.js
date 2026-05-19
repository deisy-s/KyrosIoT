const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const sectorModel = require('../models/sectorModel.js'); 

const telemetrySchema = new mongoose.Schema({
    mac: String,
    tipo: String,
    valor: Number,
    timestamp: { type: Date, default: Date.now }
});

const telemetryModel = mongoose.model('telemetry', telemetrySchema);

// Memorias temporales para alta velocidad (Ideal para el control de relés en tiempo real)
let estadoRelevadores = { 1: false, 2: false, 3: false, 4: false };
let sensoresPendientes = [];

router.post('/telemetria', async (req, res) => {
    try {
        const { mac_origen, tipo, valor } = req.body;
        
        const nuevaLectura = new telemetryModel({
            mac: mac_origen,
            tipo: tipo,
            valor: Number(valor)
        });

        // TODO : Save on BD

        console.log(`[IIoT] Dato guardado de ${mac_origen}: ${tipo} -> ${valor}`);

        res.status(200).send({ mensaje: "Guardado en DB exitosamente" });
    } catch (error) {
        console.error("Error en telemetría:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/telemetria/:mac', async (req, res) => {
    try {
        // Últimas 20 lecturas de la gráfica
        const lecturas = await telemetryModel.find({ mac: req.params.mac }).sort({ timestamp: -1 }).limit(20);
        
        res.status(200).json(lecturas.reverse());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Override manual
router.post('/control', (req, res) => {
    const { rele, estado } = req.body;
    if (rele >= 1 && rele <= 4) {
        estadoRelevadores[rele] = estado;
        // TODO : Connect to bds
        console.log(`[OVERRIDE] Relé ${rele} -> ${estado ? 'ON' : 'OFF'}`);
        res.status(200).send({ mensaje: "Comando registrado" });
    } else {
        res.status(400).send({ error: "Relé inválido" });
    }
});

// El ESP32 consulta esta ruta periódicamente para saber si debe prender un relé
router.get('/control', (req, res) => {
    res.status(200).json(estadoRelevadores);
});

// Descubrir ESP-NOW (Sensores Nuevos) (Plug & Play)
router.post('/sensores/descubrir', (req, res) => {
    const { mac, tipo } = req.body;
    const yaPendiente = sensoresPendientes.find(s => s.mac === mac);
    
    if (!yaPendiente) {
        sensoresPendientes.push({ mac, tipo: tipo || "Módulo Sensor Satélite", bateria: "100%" });
        console.log(`[PLUG & PLAY] NUEVO NODO DETECTADO: MAC ${mac}`);
    }
    res.status(200).send({ status: "ok" });
});

// TODO : Figure out what this is
router.get('/sensores/pendientes', (req, res) => {
    res.status(200).json(sensoresPendientes);
});

// Figure out what this is
router.post('/sensores/registrar', async (req, res) => {
    try {
        const { mac, sector } = req.body;
        
        // Lo sacamos de la memoria temporal para que el banner de React desaparezca
        sensoresPendientes = sensoresPendientes.filter(s => s.mac !== mac);
        
        console.log(`[KYROS] Nodo ${mac} registrado exitosamente en el sector: ${sector}`);
        
        // Aquí podrías agregar un update a sectorModel si deseas asociarlo estrictamente en DB
        
        res.status(200).send({ mensaje: "Sensor registrado y vinculado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 5. SISTEMA DE ALERTAS Y WATCHDOG (PERRO GUARDIÁN) ---

// Memoria temporal para llevar el registro de los "Latidos" de los Cores
let latidosCores = {};

// Ruta que el ESP32 debe consumir cada 10 segundos para decir "Estoy vivo"
router.post('/ping', async (req, res) => {
    const { sectorId } = req.body;
    if (sectorId) {
        latidosCores[sectorId] = Date.now();
        
        // Si el sector estaba marcado como "Desconectado", lo regresamos a "Activo" (Auto-Recuperación)
        await sectorModel.findOneAndUpdate(
            { SectorID: sectorId, Status: 'Desconectado' },
            { Status: 'Activo' }
        );
        
        res.status(200).send({ status: "alive" });
    } else {
        res.status(400).send({ error: "Falta SectorID" });
    }
});

// WATCHDOG: Un proceso que corre en el servidor cada 15 segundos buscando Cores muertos
setInterval(async () => {
    const tiempoActual = Date.now();
    const tiempoLimite = 30000; // 30 segundos sin reportar = Core Muerto

    // Buscamos todos los sectores activos en la Base de Datos
    const sectoresActivos = await sectorModel.find({ Status: 'Activo' });

    for (let sector of sectoresActivos) {
        const ultimoLatido = latidosCores[sector.SectorID];
        
        // Si nunca ha latido o si su último latido fue hace más de 30 segundos...
        if (!ultimoLatido || (tiempoActual - ultimoLatido > tiempoLimite)) {
            console.log(`[ALERTA CRÍTICA] Se perdió conexión con el KYROSYS Core: ${sector.Name}`);
            
            // 1. Lo marcamos como caído en la base de datos para que el Dashboard parpadee en rojo
            sector.Status = 'Desconectado';
            await sector.save();

            // 2. Aquí en el futuro puedes meter código para mandar un Email con Nodemailer o un SMS con Twilio
        }
    }
}, 15000);

module.exports = router;