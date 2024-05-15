// booking.utils.js
import Booking from "../models/booking.model.js";

export const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status: "Not Booked", patientId: null }, // Set patientId to null
        { new: true }
      );
  
      if (!booking) {
        throw new Error(`Booking with ID ${bookingId} not found`);
      }
  
      console.log(`Booking ${bookingId} status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
    }
  };
  