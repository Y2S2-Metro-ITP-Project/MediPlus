import mongoose from "mongoose";

//create a payment model
const paymentSchema = mongoose.Schema(
  {
    dateAndTime: {
      type: String,
      default: new Date(),
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients",
    },
    patientName: {
      type: String,
    },
    patientEmail: {
      type: String,
    },

    OrderType: {
      type: String,
      enum: ["Laboratory", "Pharmacy", "Consultation", "Ward"],
    },

    totalPayment: {
      type: Number,
    },
    paymentType: {
      type: String,
      enum: ["Cash", "Card", "Insurance"],
      default: "Cash",
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model("payments", paymentSchema);
