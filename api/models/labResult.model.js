
import mongoose from "mongoose";

const labResultSchema = new mongoose.Schema(
  {


    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "patient",
    },

   
    testOrderId: {
      type: mongoose.Schema.ObjectId,
      ref: "orderedTest",
    },

    sampleId: {
      type: mongoose.Schema.ObjectId,
      ref: "sample",
    },

    resultPDF: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const labResult = mongoose.model("labResult", labResultSchema);
export default labResult;
