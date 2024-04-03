import mongoose from "mongoose";

const sampleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum:["BLOOD","URINE","STOOL","SALIVA","MUCUS"],
      required: true,
      default:"MUCUS"
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
      default: "Medical worker not assigned",
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
