import Booking from "../models/booking.model.js";
import { errorHandler } from "../utils/error.js";

export const createBooking = async (req, res, next) => {
  const {
    type,
    doctorId,
    patientId,
    date,
    time,
    roomNo,
    reason,
  } = req.body;

  // Check if all required fields are present
  if (!type || !doctorId || !date || !time) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Create a new booking instance
  const newBooking = new Booking({
    type,
    doctorId,
    patientId,
    date,
    time,
    roomNo,
    reason,
  });

  try {
    // Save the new booking to the database
    await newBooking.save();
    // Respond with the newly created booking
    res.status(201).json(newBooking);
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};


export const getBookings = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isReceptionist) {
    return next(errorHandler(403, "You are not allowed to view all the bookings"));
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;
    const bookings = await Booking.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalBookings = await Booking.countDocuments();
    res.status(200).json({ bookings, totalBookings });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isReceptionist) {
    return next(errorHandler(403, "You are not allowed to delete this booking"));
  }

  try {
    await Booking.findByIdAndDelete(req.params.bookingId);
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const searchBookings = async (req, res, next) => {
  try {
    const searchTerm = req.body.search;
    const bookings = await Booking.find({
      $or: [
        { type: { $regex: new RegExp(searchTerm, "i") } },
        { reason: { $regex: new RegExp(searchTerm, "i") } },
      ],
    });
    if (!bookings || bookings.length === 0) {
      return next(errorHandler(404, "No bookings found with this search term"));
    }
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const filterBookings = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isReceptionist) {
    return next(errorHandler(403, "You are not allowed to access these resources"));
  }

  try {
    let query = {};
    const filterOption = req.body.filterOption;
    const currentDate = new Date();
    let startDate, endDate;
  
    switch (filterOption) {
      case "today":
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "lastmonth":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0,
          23,
          59,
          59,
          999
        );
        break;
      case "lastyear":
        startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
        endDate = new Date(
          currentDate.getFullYear() - 1,
          11,
          31,
          23,
          59,
          59,
          999
        );
        break;
      case "Bydate":
        startDate = new Date(req.body.startDate);
        endDate = new Date(req.body.endDate);
        break;
      case "tomorrow":
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() + 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "comingweek":
        startDate = new Date(currentDate);
        endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "comingmonth":
        startDate = new Date(currentDate);
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        break;
      default:
        break;
    }
  
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
  
    const bookings = await Booking.find(query);
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

export const searchAppointments = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    // Fetch appointments matching the provided doctor ID and date
    const appointments = await Booking.find({ doctorId, date });

    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res) => {
  // Check user permissions
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isReceptionist) {
      return res.status(403).json({ message: "You are not allowed to update bookings" });
  }
  
  try {
      // Update the booking data
      const updatedBooking = await Booking.findByIdAndUpdate(
          req.params.bookingId, // Extract the booking ID from the request parameters
          {
              $set: req.body, // Update with the data from the request body
          },
          { new: true } // Return the updated document
      );
      
      // Check if the booking was found and updated successfully
      if (!updatedBooking) {
          return res.status(404).json({ message: "Booking not found" });
      }
      
      // If successful, return the updated booking
      res.status(200).json(updatedBooking);
  } catch (error) {
      // Handle any errors
      res.status(500).json({ message: error.message });
  }
};

