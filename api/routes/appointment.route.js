const express = require('express');

const router = express.Router();

// GET all appointments
router.get('/appointment', (req, res) => {
    
    res.send('Get all appointments');
});

// GET a specific appointment by ID
router.get('/appointment/:id', (req, res) => {
    const appointmentId = req.params.id;
    // Logic to fetch the appointment with the given ID
    // from the database and send the response
    res.send(`Get appointment with ID ${appointmentId}`);
});

// POST a new appointment
router.post('/appointment', (req, res) => {
    const appointmentData = req.body;
    // Logic to create a new appointment in the database
    // using the provided data and send the response
    res.send('Create a new appointment');
});

// PUT/update an existing appointment
router.put('/appointment/:id', (req, res) => {
    const appointmentId = req.params.id;
    const updatedAppointmentData = req.body;
    // Logic to update the appointment with the given ID
    // in the database using the provided data and send the response
    res.send(`Update appointment with ID ${appointmentId}`);
});

// DELETE an appointment
router.delete('/appointment/:id', (req, res) => {
    const appointmentId = req.params.id;
    // Logic to delete the appointment with the given ID
    // from the database and send the response
    res.send(`Delete appointment with ID ${appointmentId}`);
});

module.exports = router;