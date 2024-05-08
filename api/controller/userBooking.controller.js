import Booking from "../models/booking.model.js";
import { errorHandler } from "../utils/error.js";

export const getBookingsForUser = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const bookings = await Booking.find({ patientId });
    console.log(bookings);
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    errorHandler(res, error);
  }
}

export const getUpcomingBookingsForUser = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const currentDate = new Date();
    console.log("Patient ID:", patientId);
    const upcomingBookings = await Booking.find({
      patientId,
      date: { $gte: currentDate },
      status: "Booked", // Exclude cancelled bookings
    }).populate("doctorId");

    console.log(upcomingBookings);

    res.status(200).json({ success: true, upcomingBookings });
  } catch (error) {
    errorHandler(res, error);
  }
};