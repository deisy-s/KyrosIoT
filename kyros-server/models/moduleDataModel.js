const mongoose = require('mongoose');

const moduleDataSchema = new mongoose.Schema({
    ModuleID: String,
    SectorID: String,
    CompanyID: String,
    Timestamp: Date,
    Type: String,
    Value: String,
})

const moduleDataModel = mongoose.model('moduleData', moduleDataSchema);

module.exports = moduleDataModel;