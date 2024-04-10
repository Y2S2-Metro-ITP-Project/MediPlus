import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    itemId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
    },
    medicine:{
        type: String,
    },
    dosage:{
        type: Number,
    },
    dosageType:{
        type: String,
    },
    frequency:{
        type: Number,
    },
    duration:{
        type: Number,
    },
    foodRelation:{
        type: String,
    },
    instructions:{
        type: String,
    },
    route:{
        type: String,
    },
    status:{
        type: String,
        enum: ["Pending","Completed","Rejected"],
        default: "Pending",
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;