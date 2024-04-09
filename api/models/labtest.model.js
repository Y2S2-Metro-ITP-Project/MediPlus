import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    sampleType: {
      type: String,
      enum: ["BLOOD", "URINE", "STOOL", "SALIVA", "MUCUS"],
      required: true,
      default: "BLOOD",
    },

    sampleVolume: {
      type: String,
      required: true,
    },

    completionTime: {
      type: String, //time should be set in seconds only and no other format
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
