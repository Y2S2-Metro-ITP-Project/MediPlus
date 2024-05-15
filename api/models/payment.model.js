import mongoose from "mongoose";

//create a payment model
const paymentSchema = new mongoose.Schema(
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
    patientEmail:{
        type:String
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
      enum: ["Cash", "Card", "Insurance","Pending"],
      default: "Pending",
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

const Payment = mongoose.model("payment", paymentSchema);

export default Payment;
