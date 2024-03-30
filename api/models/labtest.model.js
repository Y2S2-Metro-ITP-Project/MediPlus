import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    sampleType: 
      {
        type: String, // String is a place holder and will have to be updated with test ID
        required: true,
      },
 

    sampleVolume: {
      type: Number, //number is a place holder
      required: true,
    },

    completionTime: {
        type: String, //storing time as a string until better solution
        required: true,
      },

    price: {
      type: Number, // number is a place holder
      required: true,
    },
  },
  { timestamps: true }
);

const LabTest = mongoose.model("LabTest", sampleSchema);
export default LabTest;