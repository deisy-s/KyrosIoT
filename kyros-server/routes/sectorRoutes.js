const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const sectorModel = require('../models/sectorModel.js');
const verifyToken = require('../middlewares/auth.js');

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

module.exports = router;