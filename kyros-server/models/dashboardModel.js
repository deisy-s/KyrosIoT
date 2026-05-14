const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
    CompanyID: String,
    SectorID: String,
    ModuleID: String,
    GraphType: String,
    Status: String,
})

const dashboardModel = mongoose.model('dashboards', dashboardSchema);

module.exports = dashboardModel;