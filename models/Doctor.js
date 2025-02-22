// models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    specialization: { type: String },
    experience: { type: Number },
    qualification: { type: String },
    availableDays: [{ type: String }],
    startTime: { type: String },
    endTime: { type: String }
});
module.exports = mongoose.model('Doctor', doctorSchema);
