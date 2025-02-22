const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor'); // Assuming you have a Mongoose model for doctors

router.get('/', async (req, res) => {
    try {
        let query = {};

        if (req.query.name) {
            query.name = new RegExp(req.query.name, 'i'); // Case-insensitive search
        }
        if (req.query.speciality) {
            query.specialization = new RegExp(req.query.speciality, 'i');
        }
        if (req.query.location) {
            query.address = new RegExp(req.query.location, 'i');
        }

        const doctors = await Doctor.find(query);
        res.render('finddoctors', { doctors }); // Pass data to EJS
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching doctors');
    }
});

module.exports = router;
