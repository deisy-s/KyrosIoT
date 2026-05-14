const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    Name: String,
    Type: String,
    CompanyID: String,
    SectorID: String,
    Status: String,
    AlertTime: Date,
})

const moduleModel = mongoose.model('modules', moduleSchema);

module.exports = moduleModel;