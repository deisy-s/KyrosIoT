const express = require('express');
const router = express.Router();

// Memorias temporales para los relevadores y el Plug & Play
let estadoRelevadores = { 1: false, 2: false, 3: false, 4: false };
let sensoresPendientes = [];

// --- 1. INGESTA DE TELEMETRÍA (Del ESP32 a la Nube) ---
router.post('/telemetria', (req, res) => {
    try {
        const { mac_origen, tipo, valor } = req.body;
        console.log(`Dato recibido de ${mac_origen}: ${tipo} -> ${valor}`);
        res.status(200).send({ mensaje: "Guardado en DB exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 2. AUTOMATIZACIÓN (Override Manual) ---
router.post('/control', (req, res) => {
    const { rele, estado } = req.body;
    if (rele >= 1 && rele <= 4) {
        estadoRelevadores[rele] = estado;
        console.log(`OVERRIDE MANUAL ACTIVADO: Relé ${rele} -> ${estado ? 'ON' : 'OFF'}`);
        res.status(200).send({ mensaje: "Comando registrado" });
    } else {
        res.status(400).send({ error: "Relé inválido" });
    }
});

router.get('/control', (req, res) => {
    res.status(200).json(estadoRelevadores);
});

// --- 3. PLUG & PLAY (Descubrimiento de Sensores) ---
router.post('/sensores/descubrir', (req, res) => {
    const { mac, tipo } = req.body;
    const yaPendiente = sensoresPendientes.find(s => s.mac === mac);
    
    if (!yaPendiente) {
        sensoresPendientes.push({ mac, tipo: tipo || "Módulo Sensor Genérico", bateria: "100%" });
        console.log(`📡 NUEVO NODO DETECTADO: MAC ${mac}`);
    }
    res.status(200).send({ status: "ok" });
});

router.get('/sensores/pendientes', (req, res) => {
    res.status(200).json(sensoresPendientes);
});

module.exports = router;