import mongoose from "mongoose";
import Test from "./labtest.model.js";

const orderedTestSchema = new mongoose.Schema(
  {
    testId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LabTest"
      },
    ],
 
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Patient"
   
    },
  

    DoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User"
    
    },

    highPriority: {
      type: Boolean,
      default: false,
    },

    paymentComplete: {
      type: Boolean,
      default: false,
    },

    orderStages: {
      type: String,
      enums: [
        "awaitingPayment",
        "sampleCollection",
        "inStorage",
        "Processing",
        "Complete",
      ],
      default: "awaitingPayment",
    },

    orderCompletionTime: {
      type: String,
    },

    totalPrice: {
      type: String,
    },
  },
  { timestamps: true }
);

const TestOrder = mongoose.model("TestOrder", orderedTestSchema);

export default TestOrder;