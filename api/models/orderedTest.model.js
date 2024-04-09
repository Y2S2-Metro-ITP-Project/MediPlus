import mongoose from "mongoose";

const orderedTestSchema = new mongoose.Schema(
  {
    testId: [
      {
        type: String,
        required: true,
      },
    ],

    patientId: {
      type: String,
      required: true,
    },

    hightPriority: {
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
