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