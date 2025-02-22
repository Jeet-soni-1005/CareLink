const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');

// Patient Registration
router.post('/register/patient', async (req, res) => {
    console.log("Received Data:", req.body); // 🔍 Debug: Check what data is actually received

    try {
        const { name, email, password, phone, address, age } = req.body;
        const existingUser = await Patient.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "Email already exists" });

        if (!name || !email || !password || !phone || !address || isNaN(age)) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const patient = new Patient({ name, email, password: hashedPassword, phone, address, age });
        await patient.save();
        res.status(201).json({ success: true, message: "Patient registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Doctor Registration
router.post('/register/doctor', async (req, res) => {
    try {
        const { name, email, password, phone, address, specialization, experience, qualification, availableDays, startTime, endTime } = req.body;
        const existingUser = await Doctor.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const doctor = new Doctor({ name, email, password: hashedPassword, phone, address, specialization, experience, qualification, availableDays, startTime, endTime });
        await doctor.save();
        res.status(201).json({ success: true, message: "Doctor registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// User Login (Both Doctor & Patient)
router.post('/login', async (req, res) => {
    try {
        const { email, password, userTypeInput } = req.body;
        const Model = userTypeInput.value === 'doctor' ? Doctor : Patient;
        let user = await Doctor.findOne({ email }) 
        if (!user){
            user = await Patient.findOne({ email });
            if (!user) return res.status(404).json({ success: false, message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect password" });


        console.log(userTypeInput.value);

        // Store user session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            userType: userTypeInput.value
        };
        res.json({
            success: true,
            message: `${userTypeInput.value} logged in successfully`,
            sessionSet: true  // Flag to indicate session is updated
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
