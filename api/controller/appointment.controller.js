import Appointment from '../models/appointment.model.js';

// Controller function to create a new appointment
export const createAppointment = async (req, res) => {
    try {
        const { type, doctor, patient, date, time } = req.body;
        const appointment = new Appointment({ type, doctor, patient, date, time });
        await appointment.save();
        res.status(201).json({ message: 'Appointment created successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create appointment', error: error.message });
    }
};

// Controller function to get all appointments
export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
    }
};

// Controller function to update appointment status
export const updateAppointmentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        appointment.status = status;
        await appointment.save();
        res.status(200).json({ message: 'Appointment status updated successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update appointment status', error: error.message });
    }
};

// Controller function to delete an appointment
export const deleteAppointment = async (req, res) => {
    const { id } = req.params;

    try {
        await Appointment.findByIdAndDelete(id);
        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete appointment', error: error.message });
    }
};
