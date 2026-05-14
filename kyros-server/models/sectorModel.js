const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema({
    Name: String,
    CompanyID: String,

})

const sectorModel = mongoose.model('sectors', sectorSchema);

module.exports = sectorModel;