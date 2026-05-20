const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const notifsModel = require('../models/notifsModel');
const verifyToken = require('../middlewares/auth.js');

router.post('/notifs-info', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const alerts = await notifsModel.find({ 
            Solved: false, 
            CompanyID: user.CompanyID 
        }).sort({ Timestamp: -1 });

        console.log(`Alertas encontradas para la compañía ${user.CompanyID}: ${alerts.length}`);

        res.status(200).json({ alerts });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;