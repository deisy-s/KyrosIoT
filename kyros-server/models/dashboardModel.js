const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
    CompanyID: String,
    AddedModules: [String],
    GraphTypes: [String],
})

const dashboardModel = mongoose.model('dashboards', dashboardSchema);

module.exports = dashboardModel;