import mongoose from "mongoose";

const sampleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum:["BLOOD","URINE","STOOL","SALIVA","MUCUS"],
      required: true,
      default:"MUCUS"
    },

    testOrderId:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"TestOrder"
    },

    testId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LabTest" 
      },
    ],

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Patient"
    },

    collectionEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User"
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
