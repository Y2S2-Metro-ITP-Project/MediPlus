import mongoose from "mongoose";
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
  payment:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "payment",
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

import Prescription from "./prescription.model.js";