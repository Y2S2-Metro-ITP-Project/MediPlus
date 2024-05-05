import mongoose from "mongoose";

const wardSchema = new mongoose.Schema(
  {
    doctorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
    },
    generalBeds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bed",
      },
    ],
    emergencyBeds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bed",
      },
    ],
  },
  { timestamps: true }
);

const Ward = mongoose.model("Ward", wardSchema);
export default Ward;