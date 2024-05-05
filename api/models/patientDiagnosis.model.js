import mongoose from "mongoose";

const patientDiagnosisSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    diagnosis:{
        type: String,
    },
    type:{
        type: String,
        enum: ["Provincial", "Principal"],
    },
    ICD10:{
        type: String,
    },
    Symptoms:{
        type: String,
    },
    level:{
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const PatientDiagnosis = mongoose.model("PatientDiagnosis", patientDiagnosisSchema);
export default PatientDiagnosis;