import mongoose from "mongoose";

const sampleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum:["Blood","Urine","Stool","Saliva","Mucus"],
      required: true,
    },

    testsOrderedOnSample: [
      {
        type: String, 
        required: true,
        default: "No tests ordered",
      },
    ],

    patientId: {
      type: String, 
      required: true,
    },

    collectionEmployeeId: {
      type: String,
      required: true,
    },

    sampleStatus: {
      type: String,
      enums: ["inStorage","processing","complete"],
      default: 'inStorage',
      required: true,
    },

    AssignedStorage: {
      type: String,
      required: true,
      default: "No Storage Assigned",
    },
  },
  { timestamps: true }
);

const Sample = mongoose.model("Sample", sampleSchema);
export default Sample;
