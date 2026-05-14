const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema({
    Name: String,
    CompanyID: String,
    SectorID: String,
    Icon: String,
    Devices: Number,
    Status: String,
})

const sectorModel = mongoose.model('sectors', sectorSchema);

module.exports = sectorModel;