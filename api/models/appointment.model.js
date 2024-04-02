import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    doctorId: {
        type: Number,
        required: true
    },
    patientId: {
        type: Number,
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
    },
    reason: {
        type: String,
        required: true
    },
    wardno: {
        type: Number,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    isChanged: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
