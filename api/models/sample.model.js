import mongoose from "mongoose";

const sampleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },

    testsOrderedOnSample: [
      {
        type: String, // String is a place holder and will have to be updated with test ID
        required: true,
      },
    ],

    patientId: {
      type: Number, //number is a place holder
      required: true,
    },

    collectionEmployeeId: {
      type: Number, 
      required: true,
    },

    sampleStatus: {
      type: String, 
      required: true,
    },


    AssignedStorage: {
      type: String, 
      required: true,
    },


  },
  { timestamps: true }
);

const Sample = mongoose.model("Sample", sampleSchema);
export default Sample;
