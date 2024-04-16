import mongoose from "mongoose";
import Booking from "./booking.model.js";
const bookingOrderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Booking,
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Rejected"],
    default: "Pending",
  },
});

const BookingOrder = mongoose.model("BookingOrder", bookingOrderSchema);

export default BookingOrder;
