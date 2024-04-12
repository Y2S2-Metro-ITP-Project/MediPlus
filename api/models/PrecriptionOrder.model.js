import mongoose from "mongoose";
import Prescription from "./prescription.model.js";
const prescriptionOrderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  prescriptions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Prescription,
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Rejected"],
    default: "Pending",
  },
});

const PrescriptionOrder = mongoose.model(
  "PrescriptionOrder",
  prescriptionOrderSchema
);
export default PrescriptionOrder;
