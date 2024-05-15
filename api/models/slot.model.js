import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  session:{
    type: String,
    enum: ["Morning", "Afternoon", "Evening"],
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: false,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["Hospital Booking", "Online Appointment", "MACS"],
    required: true,
  },
});



const Slot = mongoose.model("Slot", slotSchema);

export default Slot;