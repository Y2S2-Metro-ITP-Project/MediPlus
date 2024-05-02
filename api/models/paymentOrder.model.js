import mongoose from "mongoose";
import Payment from "./payment.model.js";
const paymentOrderSchema = new mongoose.Schema({
  PatientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  PatientName: {
    type: String,
    required: true,
  },
  PatientEmail: {
    type: String,
    required: true,
  },
  Payment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Payment,
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "Pending",
  },
  paymentType: {
    type: String,
    enum: ["Cash", "Card", "Insurance","Pending"],
    default: "Pending",
  },
});

const PaymentOrder = mongoose.model("PaymentOrder", paymentOrderSchema);
export default PaymentOrder;
