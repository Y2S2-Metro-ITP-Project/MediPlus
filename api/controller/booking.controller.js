import { errorHandler } from "../utils/error.js";
import Booking from "../models/booking.model.js";
import { authorize, createSpace } from "../utils/googleMeet.js";

export const createBooking = async (req, res, next) => {
  const {
    type,
    doctorId,
    patientId,
    date,
    time,
    roomNo,
    reason,
    slotId,
  } = req.body;

  console.log("Booking request received with data:", {
    type,
    doctorId,
    patientId,
    date,
    time,
    roomNo,
    reason,
    slotId,
  });

  if (!type || !doctorId || !date || !time) {
    console.log("Required fields missing in the booking request");
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    let meetLink = "";
    console.log("Booking request type:", type);
    if (type === "Online Appointment") {
      const authClient = await authorize();
      const response = await createSpace(authClient);
      meetLink = response[0].meetingUri;
      console.log("Meet link generated:", meetLink);
    }

    const newBooking = new Booking({
      type,
      doctorId,
      patientId,
      date,
      time,
      roomNo,
      reason,
      slotId,
      meetLink,
    });

    await newBooking.save();
    console.log("Booking saved to the database");
    res.status(201).json(newBooking);
    console.log("Booking created successfully");
  } catch (error) {
    console.error("Error creating booking:", error);
    next(error);
  }
};


export const getBookings = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isReceptionist) {
    return next(
      errorHandler(403, "You are not allowed to view all the bookings")
    );
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;

    const bookings = await Booking.find()
      .populate("doctorId", "username")
      .populate("patientId", "username")
      .populate("roomNo", "description")
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: sortDirection });
    console.log("Bookings fetched:", bookings); 
    const totalBookings = await Booking.countDocuments();

    const updatedBookings = bookings.map((booking) => ({
      ...booking.toObject(),
      doctorName: booking.doctorId ? booking.doctorId.username : "Unknown",
      patientName: booking.patientId ? booking.patientId.name : "Unknown",
      roomName: booking.roomNo ? booking.roomNo.description : "Online Appointment",
    }));
    console.log(" fetched successfully");
    res.status(200).json({ bookings: updatedBookings, totalBookings });
  } catch (error) {
    next(error);
  }
};

// ... (rest of the code remains the same)

export const getBookingsForScheduling = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isReceptionist) {
    return next(
      errorHandler(403, "You are not allowed to view all the bookings")
    );
  }

  try {
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;
    const bookings = await Booking.find().sort({ createdAt: sortDirection });
    const totalBookings = await Booking.countDocuments();

    res.status(200).json({ bookings, totalBookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingsForDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const bookings = await Booking.find({ doctorId });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings for doctor:", error);
    res.status(500).json({ message: "Failed to fetch bookings for doctor" });
  }
};

export const deleteBooking = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isReceptionist) {
    return next(
      errorHandler(403, "You are not allowed to delete this booking")
    );
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
    return next(
      errorHandler(403, "You are not allowed to access these resources")
    );
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
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isReceptionist) {
    return res
      .status(403)
      .json({ message: "You are not allowed to update bookings" });
  }

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      {
        $set: req.body,
      },
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bookAppointment = async (req, res) => {
  console.log("Request received:", req.body);

  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isReceptionist) {
    console.log("User not authorized to book appointments:", req.user);
    return res
      .status(403)
      .json({ message: "You are not allowed to book appointments" });
  }

  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      {
        $set: { patientId: req.body.patientId, status: "Pending Payment" },
      },
      { new: true }
    );
    console.log("Booking updated:", booking);

    // if (!booking) {
    //   console.log("Booking not found for ID:", req.params.bookingId);
    //   return res.status(404).json({ message: "Booking not found" });
    // }

    // console.log("Checking for existing orders...");

    // const patientFind = await Booking.findById(booking.patientId._id);
    // const patientName = patientFind.name;
    // const patientEmail = patientFind.contactEmail;
    // const payment = await Payment.create({
    //   patientId: booking.patientId._id,
    //   patientName: patientName,
    //   patientEmail: patientEmail,
    //   OrderType: "Consultation Fee",
    //   totalPayment: 50000,
    // });

    // try {
    //   await createOrUpdatePaymentOrder(
    //     booking.patientId._id,
    //     patientName,
    //     patientEmail,
    //     payment._id
    //   );
    // } catch (error) {
    //   res.status(500).json({ message: error.message });
    // }

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const cancelSelectedBookings = async (req, res) => {
  try {
    // Extract the array of booking IDs from the request body
    const { bookingIds } = req.body;

    // Check if bookingIds array is provided and not empty
    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid or empty booking IDs array" });
    }

    // Update the status of selected bookings to "Cancelled"
    await Booking.updateMany(
      { _id: { $in: bookingIds } }, // Find bookings by their IDs
      { $set: { status: "Cancelled" } } // Set the status to "Cancelled"
    );

    // Respond with success message
    res.json({ message: "Selected bookings cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel selected bookings" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { bookingId, status, patientId } = req.body; // Extract patientId from request body
    console.log("Request received:", req.body);

    // Find the booking by ID and update its status and patientId
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status, patientId }, // Include patientId in the update object
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// const createOrUpdatePaymentOrder = async (

//   patientId,
//   patientName,
//   patientEmail,
//   paymentId,
//   paymentStatus
// ) => {
//   try {
//     // Find the payment order for the patient ID
//     let paymentOrder = await PaymentOrder.findOne({ PatientID: patientId });

//     if (paymentOrder) {
//       // If a payment order exists, check if it has a pending status
//       if (paymentOrder.status === "Pending") {
//         // If it's pending, push the payment into its Payment array
//         paymentOrder.Payment.push(paymentId);
//       } else {
//         // If it's not pending, create a new payment order
//         paymentOrder = new PaymentOrder({
//           PatientID: patientId,
//           PatientName: patientName,
//           PatientEmail: patientEmail,
//           Payment: [paymentId],
//           status: "Pending",
//         });
//       }
//     } else {
//       // If no payment order exists, create a new one
//       paymentOrder = new PaymentOrder({
//         PatientID: patientId,
//         PatientName: patientName,
//         PatientEmail: patientEmail,
//         Payment: [paymentId],
//         Status: paymentStatus === "Pending" ? "Pending" : "Completed", // Set status based on payment status
//       });
//     }

//     // Save the payment order
//     await paymentOrder.save();

//     return paymentOrder;
//   } catch (error) {
//     throw new Error("Failed to create or update payment order");
//   }
// };
