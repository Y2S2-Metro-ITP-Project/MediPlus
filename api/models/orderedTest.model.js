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
      enums: ["sampleCollection", "inStorage", "Processing", "Complete"],
      default: "inStorage",
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

const testOrder = mongoose.model("testOrder", orderedTestSchema);

export default testOrder;
