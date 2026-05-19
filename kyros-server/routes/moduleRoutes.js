const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const sectorModel = require('../models/sectorModel.js');
const moduleModel = require('../models/moduleModel.js');
const verifyToken = require('../middlewares/auth.js');

// Obtener todos los módulos de un sector
router.post('/modules-info', verifyToken, async (req, res) => {
    try{
        const userId = req.user.id; 
        const user = await userModel.findById(userId);
        const { SectorID } = req.body; 

        if (!SectorID) {
            return res.status(400).json({ error: "Sector ID is required" });
        }

        if (!user) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const modules = await moduleModel.find({ CompanyID: user.CompanyID, SectorID: SectorID });

        if (modules.length === 0) {
            return res.status(400).json({ error: "No modules found for this company and sector" });
        }

        res.status(200).json({ modules });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar un módulo
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const module = await moduleModel.findByIdAndDelete(req.params.id);

        if (!module) return res.status(404).json({ error: "Módulo no encontrado" });

        res.status(200).json({ message: "Módulo eliminado" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;