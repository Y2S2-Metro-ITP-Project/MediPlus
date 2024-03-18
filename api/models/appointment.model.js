import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    doctor: {
        type: String,
        required: true
    },
    patient: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "PENDING"
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
