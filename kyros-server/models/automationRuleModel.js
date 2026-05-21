const mongoose = require('mongoose');

const automationRuleSchema = new mongoose.Schema({
    CompanyID: String,
    metrica: String,
    condicion: String,
    valor: Number,
    accion: String,
    actuador: Number,
    activa: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('automationRules', automationRuleSchema);
