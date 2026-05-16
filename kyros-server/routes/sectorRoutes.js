const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const sectorModel = require('../models/sectorModel.js');
const verifyToken = require('../middlewares/auth.js');

// 1. OBTENER TODOS LOS SECTORES DE LA EMPRESA (El que ya tenían)
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

// 2. OBTENER UN SECTOR ESPECÍFICO (Para cargar datos en EditSector.jsx)
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const sector = await sectorModel.findById(req.params.id);
        if (!sector) return res.status(404).json({ error: "Sector no encontrado" });
        res.status(200).json(sector);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 3. EDITAR UN SECTOR (Guardar nombre e icono nuevo)
router.put('/edit/:id', verifyToken, async (req, res) => {
    try {
        const { Name, Icon } = req.body;
        
        // Actualiza y devuelve el documento nuevo
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

// 4. ELIMINAR/DESVINCULAR UN SECTOR
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const sector = await sectorModel.findByIdAndDelete(req.params.id);
        if (!sector) return res.status(404).json({ error: "Sector no encontrado" });
        res.status(200).json({ message: "Sector eliminado y Core desvinculado" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5. VINCULAR NUEVO KYROSYS CORE (Desde LinkDevice.jsx)
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
            Icon: "precision_manufacturing", // Ícono industrial por defecto
            Devices: 0,
            Status: "Activo"
        });

        await nuevoSector.save();
        res.status(201).json({ message: "KYROSYS Core detectado y vinculado con éxito", sector: nuevoSector });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;