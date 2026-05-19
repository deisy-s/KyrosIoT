const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const sectorModel = require('../models/sectorModel.js');
const verifyToken = require('../middlewares/auth.js');

// Obtener todos los sectores de la empresa
router.post('/sectors-info', verifyToken, async (req, res) => {
    try{
        const userId = req.user.id; 
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const sectors = await sectorModel.find({ CompanyID: user.CompanyID });

        if(!sectors){
            return res.status(404).json({ error: "No sectors found for this company" });
        }

        res.status(200).json({ sectors });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener un sector específico por ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const sector = await sectorModel.findById(req.params.id);
        if (!sector) return res.status(404).json({ error: "Sector no encontrado" });
        res.status(200).json(sector);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Editar un sector
router.put('/edit/:id', verifyToken, async (req, res) => {
    try {
        const { Name, Icon } = req.body;
        
        const sector = await sectorModel.findByIdAndUpdate(
            req.params.id, 
            { Name, Icon }, 
            { new: true }
        );
        
        if (!sector) return res.status(404).json({ error: "Sector no encontrado" });
        res.status(200).json({ message: "Sector actualizado correctamente", sector });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Actualizar contador de dispositivos en un sector
router.put('/update-devices/:id', verifyToken, async (req, res) => {
    try {
        const { Devices } = req.body; // Nuevo número de dispositivos
        const sector = await sectorModel.findByIdAndUpdate(
            req.params.id,
            { Devices },
            { new: true }
        );
        if (!sector) return res.status(404).json({ error: "Sector no encontrado" });
        res.status(200).json({ message: "Contador de dispositivos actualizado", sector });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar un sector
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const sector = await sectorModel.findByIdAndDelete(req.params.id);
        if (!sector) return res.status(404).json({ error: "Sector no encontrado" });
        res.status(200).json({ message: "Sector eliminado y Core desvinculado" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Vincular sector nuevo
router.post('/link', verifyToken, async (req, res) => {
    try {
        const { codigoVinculacion, nombreSector } = req.body;
        const userId = req.user.id;
        
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        // Validar si ese PIN/SectorID ya fue registrado por otra empresa
        const existe = await sectorModel.findOne({ SectorID: codigoVinculacion });
        if (existe) {
            return res.status(400).json({ error: "Este KYROSYS Core ya está vinculado a una planta activa." });
        }

        // Crear el nuevo sector asignado a la empresa del usuario
        const nuevoSector = new sectorModel({
            Name: nombreSector,
            CompanyID: user.CompanyID,
            SectorID: codigoVinculacion,
            Icon: "precision_manufacturing",
            Devices: 0,
            Status: "active"
        });

        await nuevoSector.save();
        res.status(201).json({ message: "KYROSYS Core detectado y vinculado con éxito", sector: nuevoSector });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;