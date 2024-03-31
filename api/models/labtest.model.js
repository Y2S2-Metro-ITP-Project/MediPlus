import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    sampleType: {
      type: String,
      required: true,
    },

    sampleVolume: {
      type: String,
      required: true,
    },

    completionTime: {
      type: String,
      required: true,
    },

    price: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const LabTest = mongoose.model("LabTest", testSchema);
export default LabTest;
