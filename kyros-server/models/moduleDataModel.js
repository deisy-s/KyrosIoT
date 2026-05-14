const mongoose = require('mongoose');

const moduleDataSchema = new mongoose.Schema({
    ModuleID: String,
    Timestamp: { type: Date, default: Date.now },
    Type: String,
    Value: String,
})

const moduleDataModel = mongoose.model('moduleData', moduleDataSchema);

module.exports = moduleDataModel;