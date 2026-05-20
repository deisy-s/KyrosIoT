const mongoose = require('mongoose');

const notifsSchema = new mongoose.Schema({
    DeviceID: String,
    DeviceType: String,
    CompanyID: String,
    Message: String,
    Timestamp: { type: Date, default: Date.now },
    Solved: Boolean,
    Type: String
})

const notifsModel = mongoose.model('notifs', notifsSchema);

module.exports = notifsModel;