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
      type: Number,
      required: true,
    },

    completionTime: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const LabTest = mongoose.model("LabTest", sampleSchema);
export default LabTest;
