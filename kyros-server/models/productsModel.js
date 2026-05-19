const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
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
    MAC: String
})

const productsModel = mongoose.model('products', productsSchema);

module.exports = productsModel;