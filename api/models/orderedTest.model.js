import mongoose from "mongoose";

const orderedTestSchema = new mongoose.Schema(
  {
    testId: {
      type: String,
      required: true,
    },

    patientId: {
      type: String,
      required: true,
    },

    orderPriority: {
      type: String,
      enums: ["High", "Normal"],
      default: "Normal",
    },

    orderStatus: {
      type: String,
      enums: ["OnHold", "Processing", "Complete"],
      default: "OnHold",
    },

    CompletionTime: {
      type: String,
    },
  },
  { timestamps: true }
);

const testOrder = mongoose.model("testOrder", orderedTestSchema);

export default testOrder;
