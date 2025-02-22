require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const nodemailer = require('nodemailer');
const Doctor = require('./models/Doctor');
const session = require('express-session');


const app = express();

app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // ✅ Handles form data
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// session hanndling
app.use(session({
    secret: process.env.SESSIONSECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true in production with HTTPS
}));

// Middleware to make `req.session.user` available in all EJS files
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Home page request 
app.get('/', (req, res, next) => {
  res.render("home");
});

// Login page request
app.get('/login', (req, res, next) => {
    res.render("login"); // Renders views/login.ejs
});


// Find Doctors page request
app.use('/finddoctors', doctorRoutes);  // Using doctor routes

//Auth request handling
app.use('/auth', authRoutes);

// Logout request handling
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: "Logout failed" });
      }
      res.redirect('/'); // Redirect to homepage after logout
  });
});

// <----Booking Appointment ---->
// Handle appointment booking
app.post('/bookappointment', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const { doctorId, date, time } = req.body;
        const patientEmail = req.session.user.email;
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }
        console.log(patientEmail, doctor.name, date, time)
        // Send confirmation email
        await sendAppointmentEmail(patientEmail, doctor.name, date, time);
        

        res.status(200).json({ success: true, message: "Appointment booked successfully! A confirmation email has been sent." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL, // Replace with your email
        pass: process.env.PASSWORD // Use App Password if 2FA is enabled
    }
});

// Function to send email
async function sendAppointmentEmail(userEmail, doctorName, date, time) {
    const mailOptions = {
        from: process.env.EMAIL, // Replace with your email
        to: userEmail,
        subject: 'Appointment Booked',
        text: `Dear Patient,\n\nYour appointment with Dr. ${doctorName} has been successfully booked.\n\n📅 Date: ${date}\n🕒 Time: ${time}\n\nThank you for choosing our service!\n\nBest Regards,\nTeam CareLink`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

app.listen(3000, () => console.log('Server running on port 3000'));