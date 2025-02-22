// models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    age: { type: Number }
});

module.exports = mongoose.model('Patient', patientSchema);