const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Email: String,
    Password: String,
    CompanyID: String,
    CompanyName: String,
    AdminPin: String,
    CreatedAt: { type: Date, default: Date.now },
})

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;