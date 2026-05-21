const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.js');
const automationRuleModel = require('../models/automationRuleModel.js');

router.get('/rules', verifyToken, async (req, res) => {
    try {
        const rules = await automationRuleModel.find({ CompanyID: req.user.companyID }).sort({ createdAt: -1 });
        res.status(200).json(rules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/rules', verifyToken, async (req, res) => {
    try {
        const { metrica, condicion, valor, accion, actuador } = req.body;
        const rule = await automationRuleModel.create({
            CompanyID: req.user.companyID,
            metrica, condicion, valor: Number(valor), accion, actuador: Number(actuador)
        });
        res.status(201).json(rule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/rules/:id/toggle', verifyToken, async (req, res) => {
    try {
        const rule = await automationRuleModel.findOne({ _id: req.params.id, CompanyID: req.user.companyID });
        if (!rule) return res.status(404).json({ error: 'Regla no encontrada' });
        rule.activa = !rule.activa;
        await rule.save();
        res.status(200).json(rule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/rules/:id', verifyToken, async (req, res) => {
    try {
        await automationRuleModel.findOneAndDelete({ _id: req.params.id, CompanyID: req.user.companyID });
        res.status(200).json({ message: 'Regla eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
