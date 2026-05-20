const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userModel = require('../models/userModel');
const sectorModel = require('../models/sectorModel.js');
const moduleModel = require('../models/moduleModel.js');
const moduleDataModel = require('../models/moduleDataModel.js');
const notifsMode = require('../models/notifsModel.js');
const verifyToken = require('../middlewares/auth.js');
const notifsModel = require('../models/notifsModel.js');

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

// Memoria temporal para llevar el registro de los "Latidos" de los Cores
let latidosCores = {};
const latidosSensores = {};

router.post('/telemetria', async (req, res) => {
    try {
        const { mac_origen, tipo, valor } = req.body;
        const io = req.app.get('socketio');

        const moduloAsociado = await moduleModel.findOne({ MAC: mac_origen });

        if (!moduloAsociado) {
            console.warn(`Lectura recibida de MAC ${mac_origen} no vinculada a ningún sector.`);
            return;
        }

        const timestampActual = new Date();

        if (tipo === "temperatura") {
            const { temp, hum } = req.body;

            const lecturaTemp = new moduleDataModel({
                MAC: mac_origen,
                Type: "temperatura",
                Value: Number(temp),
                Timestamp: timestampActual,
                SectorName: moduloAsociado?.SectorName,
                CompanyID: moduloAsociado?.CompanyID
            });
            await lecturaTemp.save();

            io.emit(`telemetria-${mac_origen}`, {
                mac: mac_origen,
                tipo: "temperatura",
                valor: Number(temp),
                fecha: timestampActual.toISOString()
            });

            const lecturaHum = new moduleDataModel({
                MAC: mac_origen,
                Type: "humedad",
                Value: Number(hum),
                Timestamp: timestampActual,
                SectorName: moduloAsociado?.SectorName,
                CompanyID: moduloAsociado?.CompanyID
            });
            await lecturaHum.save();

            io.emit(`telemetria-${mac_origen}`, {
                mac: mac_origen,
                tipo: "humedad",
                valor: Number(hum),
                fecha: timestampActual.toISOString()
            });

            await moduleModel.findOneAndUpdate(
                { MAC: mac_origen },
                {
                    DetailType: 'Últimas Lecturas: ',
                    DetailValue: `${Number(temp).toFixed(1)}°C / ${Number(hum).toFixed(0)}%`,
                    AlertTime: timestampActual
                }
            );

            return res.status(200).send({ mensaje: "Métricas compuestas procesadas e indexadas" });
        } else {

            const nuevaLectura = new moduleDataModel({
                MAC: mac_origen,
                Type: tipo,
                Value: Number(valor),
                Timestamp: timestampActual,
                SectorID: moduloAsociado.SectorID,
                SectorName: moduloAsociado.SectorName,
                CompanyID: moduloAsociado.CompanyID
            });

            await nuevaLectura.save();

            if (moduloAsociado) {
                await moduleModel.findOneAndUpdate(
                    { MAC: mac_origen },
                    {
                        DetailType: 'Última Lectura: ',
                        DetailValue: String(valor),
                        AlertTime: timestampActual
                    }
                );
            }

            io.emit(`telemetria-${mac_origen}`, {
                mac: mac_origen,
                tipo: tipo,
                valor: Number(valor),
                fecha: timestampActual.toISOString()
            });

            console.log(`[TELEMETRÍA] ${tipo} = ${valor} (MAC: ${mac_origen})`);
        }

        latidosSensores[mac_origen] = Date.now();
        await moduleModel.findOneAndUpdate({ MAC: mac_origen }, { IsActive: true });

        await notifsModel.updateMany({ DeviceID: mac_origen, IsResolved: false }, { IsResolved: true });

        res.status(200).send({ mensaje: "Guardado en DB exitosamente" });
    } catch (error) {
        console.error("Error en telemetría:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/telemetria/:mac', async (req, res) => {
    try {
        // Calcular la fecha límite restando exactamente 10 minutos
        const diezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000);

        const lecturas = await moduleDataModel.find({
            MAC: req.params.mac,
            Timestamp: { $gte: diezMinutosAtras }
        }).sort({ Timestamp: 1 });

        const respuestaEstandarizada = lecturas.map(l => ({
            mac: l.MAC,
            tipo: l.Type,
            valor: l.Value,
            fecha: l.Timestamp
        }));

        res.status(200).json(respuestaEstandarizada);
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
router.post('/sensores/descubrir', async (req, res) => {
    const { mac, tipo, detectadoPor } = req.body;
    const yaPendiente = sensoresPendientes.find(s => s.mac === mac);

    const ifExists = await moduleModel.findOne({ MAC: mac });

    if (!yaPendiente && !ifExists) {
        let nombreLegible = "Sensor Satélite";
        if (tipo == "humo") nombreLegible = "Módulo Sensor de Humo y Gas";
        if (tipo == "temperatura") nombreLegible = "Módulo Sensor de Temperatura y Humedad";
        if (tipo == "movimiento") nombreLegible = "Módulo Sensor PIR de Movimiento";

        let type = "Temperatura y Humedad";
        if (tipo == "humo") type = "Humo y Gas";
        if (tipo == "temperatura") type = "Temperatura y Humedad";
        if (tipo == "movimiento") type = "Movimiento";

        sensoresPendientes.push({
            mac,
            nombre: nombreLegible,
            tipo: type,
            bateria: "100%",
            detectadoPor: detectadoPor
        });
        console.log(`[PLUG & PLAY] NUEVO NODO DETECTADO: MAC ${mac}`);
    }
    res.status(200).send({ status: "ok" });
});

// Guardar los sensores sin asignar
router.get('/sensores/pendientes', verifyToken, (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json(sensoresPendientes);
});

// Guardar el sensor en la base de datos
router.post('/sensores/registrar', verifyToken, async (req, res) => {
    try {
        const { mac, sector, tipo, nombre } = req.body;
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        if (!user) return res.status(404).json({ error: "User not found" });

        // Lo sacamos de la memoria temporal para que el banner de React desaparezca
        sensoresPendientes = sensoresPendientes.filter(s => s.mac !== mac);
        let icon = "thermostat";
        if (tipo === "Humo y Gas") icon = "detector_smoke";
        if (tipo === "Temperatura y Humedad") icon = "thermostat";
        if (tipo === "Movimiento") icon = "person";

        const sectorDoc = await sectorModel.findOne({ SectorID: sector });

        if (!sectorDoc) {
            return res.status(404).json({ error: "Sector no encontrado" });
        }

        const finalSectorName = sectorDoc.Name || sectorDoc.nombre || "Sector General";

        // Subir a bds
        const sensorVinculado = await moduleModel.findOneAndUpdate(
            { MAC: mac },
            {
                MAC: mac,
                Name: nombre || "Módulo Sensor",
                Type: tipo,
                SectorID: sector,
                CompanyID: user.CompanyID,
                Status: 'active',
                Icon: icon,
                SectorName: finalSectorName
            },
            { upsert: true, new: true }
        );

        const sectorUpdate = await sectorModel.findOneAndUpdate(
            { SectorID: sector },
            {
                Devices: sectorDoc.Devices + 1
            }
        )

        console.log(`[KYROS] Nodo ${mac} registrado exitosamente en el sector: ${sector}`);

        res.status(200).send({ mensaje: "Sensor registrado y vinculado" });
    } catch (error) {
        console.error("❌ ERROR CRÍTICO EN REGISTRAR SENSOR:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- 5. SISTEMA DE ALERTAS Y WATCHDOG (PERRO GUARDIÁN) ---
let ioGlobal = null;
// Ruta que el ESP32 debe consumir cada 10 segundos para decir "Estoy vivo"
router.post('/ping', async (req, res) => {
    const { sectorId } = req.body;
    if (sectorId) {
        latidosCores[sectorId] = Date.now();

        // Si el sector estaba marcado como "Desconectado", lo regresamos a "Activo" (Auto-Recuperación)
        const sectorActualizado = await sectorModel.findOneAndUpdate(
            { SectorID: sectorId, Status: 'Desconectado' },
            { Status: 'active' }
        );

        if (!ioGlobal) {
            ioGlobal = req.app.get('socketio');
        }

        if (sectorActualizado) {
            const io = req.app.get('socketio');
            io.emit('sector-estado-cambio', { sectorId, status: 'active' });
            
            await Alert.updateMany({ DeviceID: sectorId, IsResolved: false }, { IsResolved: true });
        }

        res.status(200).send({ status: "alive" });
    } else {
        res.status(400).send({ error: "Falta SectorID" });
    }
});

// WATCHDOG: Un proceso que corre en el servidor cada 15 segundos buscando Cores muertos
setInterval(async () => {
    const tiempoActual = Date.now();
    const tiempoLimite = 30000; // 30 segundos sin reportar = Core Muerto
    const io = ioGlobal;

    // Buscamos todos los sectores activos en la Base de Datos
    try {
        const sectoresActivos = await sectorModel.find({ Status: 'active' });

        for (let sector of sectoresActivos) {
            const ultimoLatido = latidosCores[sector.SectorID];

            // Si nunca ha latido o si su último latido fue hace más de 30 segundos...
            if (!ultimoLatido || (tiempoActual - ultimoLatido > tiempoLimite)) {
                console.log(`[ALERTA CRÍTICA] Se perdió conexión con el KYROSYS Core: ${sector.Name}`);

                // 1. Lo marcamos como caído en la base de datos para que el Dashboard parpadee en rojo
                sector.Status = 'inactive';
                await sector.save();

                const alertaExistente = await notifsModel.findOne({
                    DeviceID: sector.SectorID,
                    Solved: false
                });

                if (!alertaExistente) {
                    await notifsModel.create({
                        DeviceID: sector.SectorID,
                        DeviceType: 'core',
                        Message: `Alerta Crítica: El Core del sector "${sector.Name}" se ha desconectado.`,
                        Type: 'critico',
                        CompanyID: sector.CompanyID,
                        Solved: false
                    });
                }

                if (io) io.emit('sector-estado-cambio', {
                    sectorId: sector.SectorID,
                    status: 'inactive'
                });

                // 2. Aquí en el futuro puedes meter código para mandar un Email con Nodemailer o un SMS con Twilio
            }
        }
    } catch (error) {
        console.error("Error en Watchdog de Cores:", error);
    }

    // watchdog para los sensores
    try {
        // buscar los sensores que figuran como conectados en MongoDB
        const sensoresActivos = await moduleModel.find({ Status: "active" });

        for (let sensor of sensoresActivos) {
            const ultimoLatidoSensor = latidosSensores[sensor.MAC];

            // Si el sensor pasó más de 30 segundos sin mandar telemetría...
            if (!ultimoLatidoSensor || (tiempoActual - ultimoLatidoSensor > tiempoLimite)) {
                console.log(`[ALERTA IOT] Satélite desconectado -> MAC: ${sensor.MAC} ${sensor.Name} [${sensor.Type}]`);

                sensor.Status = "inactive";
                await sensor.save();

                const alertaExistente = await notifsModel.findOne({ DeviceID: sensor.MAC, Solved: false });
                if (!alertaExistente) {
                    await notifsModel.create({
                        DeviceID: sensor.MAC,
                        DeviceType: 'sensor',
                        Message: `Satélite ${sensor.Name} fuera de línea en el Sector ${sensor.SectorName}.`,
                        Type: 'advertencia',
                        CompanyID: sensor.CompanyID,
                        Solved: false
                    });
                }

                const coreUpdate = await sectorModel.findOneAndUpdate(
                    { SectorID: sensor.SectorID },
                    { Status: 'maintenance' }
                )

                if (io) io.emit('modulo-estado-cambio', {
                    mac: sensor.MAC,
                    status: 'inactive',
                    sectorId: sensor.SectorID
                });
            }
        }
    } catch (err) {
        console.error("Error en Watchdog de Sensores:", err);
    }
}, 15000);

module.exports = router;