import mongoose from "mongoose";

const vitalsSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    doctorId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bodyweight: {
      type: Number,
    },
    height: {
      type: Number,
    },
    temperature: {
      type: Number,
    },
    bloodPressureSystolic: {
      type: Number,
    },
    bloodPressureDiastolic: {
      type: Number,
    },
    heartRate: {
      type: Number,
    },
    respiratoryRate: {
      type: Number,
    },
    oxygenSaturation: {
      type: Number,
    },
    bloodGlucose: {
        type: Number,
    },
    BMI:{
        type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Vitals = mongoose.model("Vitals", vitalsSchema);
export default Vitals;
