const mongoose = require('mongoose');

const moduleDataSchema = new mongoose.Schema({
    MAC: String,
    SectorID: String,
    SectorName: String,
    CompanyID: String,
    Timestamp: Date,
    Type: String,
    Value: Number,
})

const moduleDataModel = mongoose.model('moduleData', moduleDataSchema);

module.exports = moduleDataModel;