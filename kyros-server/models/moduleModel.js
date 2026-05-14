const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    Name: String,
    Type: String,
    SectorID: String,
    Status: String,
})

const moduleModel = mongoose.model('modules', moduleSchema);

module.exports = moduleModel;