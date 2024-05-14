import mongoose from "mongoose";
import Slot from "./slot.model.js";

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
});

// Method to check the availability of the room for a given date and time
roomSchema.methods.isAvailable = async function (date, startTime, endTime) {
  const overlappingSlot = await mongoose.model("Slot").findOne({
    room: this._id,
    date: date,
    $or: [
      { startTime: { $lte: endTime }, endTime: { $gte: startTime } },
      { startTime: { $gte: startTime }, startTime: { $lte: endTime } },
    ],
  });

  return overlappingSlot ? false : true;
};

const Room = mongoose.model("Room", roomSchema);

export default Room;