import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    qualifications: {
        type: String,
        required: true
    },
    availability: {
        type: [String],
        required: true
    },
    languagesSpoken: {
        type: [String],
        required: true
    },
    consultationFee: {
        type: Number,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    appointmentSlots: {
        type: [Date],
        required: true
    },
    reviews: [{
        rating: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            required: true
        }
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
