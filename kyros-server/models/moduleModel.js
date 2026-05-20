const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    Name: String,
    Type: String,
    CompanyID: String,
    SectorID: String,
    SectorName: String,
    Status: String,
    AlertTime: Date,
    Icon: String,
    DetailType: String,
    DetailValue: String,
    MAC: String,
    LastHeartbeat: { type: Date, default: Date.now }
})

const moduleModel = mongoose.model('modules', moduleSchema);

module.exports = moduleModel;