import mongoose from "mongoose";
const wardSchema = new mongoose.Schema(
  {
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    doctorName:{
        type: String,
    },
    nurseId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    nurseName:{
        type: String,
    },
    WardName: {
      type: String,
      required: true,
    },
    WardType: {
        type:String,
        required: true,
    },
    WardCapacity: {
        type: Number,
        required: true,
    },
    beds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bed",
      },
    ],
    wardCharge: {
        type: Number,
        required: true,
        default: 0,
    },
  },
  { timestamps: true }
);

const ward = mongoose.model("Ward", wardSchema);
export default ward;