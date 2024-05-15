import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: false,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: false,
    },
    status: {
      type: String,
      default: "Not Booked",
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: false,
    },
    roomNo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: false,
    },
    isChanged: {
      type: Boolean,
      default: false,
    },
    meetLink: {
      type: String,
      required: false,
    },
    // Add the history attribute
    history: [
      {
        action: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        details: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;