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
