import { errorHandler } from "../utils/error.js";
import Booking from "../models/booking.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";
import { createSpace } from "../utils/googleMeet.js";
import generatePDFFromHtml from "../utils/generatePDF.js";
import { authorize, sendEmail } from "../utils/bookingEmail.js";
import Slot from "../models/slot.model.js";

let isProcessing = false;

export const createBooking = async (req, res, next) => {
  const { type, doctorId, patientId, date, time, roomNo, reason, slotId } =
    req.body;
    const patient = Patient.findById(patientId, "name");
  const patientName = patient.name;
  const doctor =  User.findById(doctorId, "username");
  const doctorName = doctor.username;

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
  console.log("Patient Name:", patientName);
  console.log("Doctor Name:", doctorName);
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
      history: [
        {
          action: "Booking Created",
          timestamp: new Date(),
          user: req.user._id,
          details: `A new ${type} booking has been created for Dr. ${doctorName} on ${new Date(
            date
          ).toLocaleDateString()} at ${time}.`,
        },
      ],
    });

    await newBooking.save();
    console.log("Booking saved to the database");

    // Send email to the patient
    if (patientId) {
      const patient = await Patient.findById(patientId);
      if (patient) {
        const emailContent = `
          Dear ${patient.name},
    
          A new ${type} booking has been created for you with the following details:
    
          Date: ${new Date(date).toLocaleDateString()}
          Time: ${time}
          Doctor: Dr. ${doctorId.username}
          ${
            roomNo
              ? `Room: ${roomNo.description}`
              : "Location: Online Appointment"
          }
    
          Please arrive 15 minutes before your appointment time for check-in and registration.
    
          If you have any questions or need to reschedule, please contact our support team.
    
          Best regards,
          Your Healthcare Provider
        `;

        const auth = await authorize();
        await sendEmail(
          auth,
          patient.contactEmail,
          "New Booking Created",
          emailContent
        );
      }
    }

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
    const bookings = await Booking.find()
      .populate("doctorId", "username")
      .populate("patientId", "name contactPhone contactEmail")
      .populate("roomNo", "description");

    const updatedBookings = bookings.map((booking) => ({
      ...booking.toObject(),
      doctorName: booking.doctorId ? booking.doctorId.username : "Unknown",
      patientName: booking.patientId ? booking.patientId.name : "UnAssigned",
      roomName: booking.roomNo ? booking.roomNo.description : "Online Appointment",
    }));

    res.status(200).json({ bookings: updatedBookings });
  } catch (error) {
    next(error);
  }
};

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
    const bookings = await Booking.find({ doctorId }).populate("roomNo", "description").populate("patientId", "name contactEmail");
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
    const booking = await Booking.findByIdAndDelete(
      req.params.bookingId
    ).populate("patientId", "name contactEmail");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.history.push({
      action: "Booking Deleted",
      timestamp: new Date(),
      user: req.user._id,
      details: `The ${booking.type} booking for patient ${
        booking.patientId ? booking.patientId.name : "UnAssigned"
      } with Dr. ${booking.doctorId.username} on ${new Date(
        booking.date
      ).toLocaleDateString()} at ${booking.time} in ${
        booking.roomNo ? booking.roomNo.description : "Online Appointment"
      } has been deleted.`,
    });
    await booking.save();

    // Send email to the patient
    if (booking.patientId) {
      const emailContent = `
        Dear ${booking.patientId.name},
  
        Your ${
          booking.type
        } booking with the following details has been deleted:
  
        Date: ${new Date(booking.date).toLocaleDateString()}
        Time: ${booking.time}
        Doctor: Dr. ${booking.doctorId.username}
        ${
          booking.roomNo
            ? `Room: ${booking.roomNo.description}`
            : "Location: Online Appointment"
        }
  
        If you have any questions or need to reschedule, please contact our support team.
  
        Best regards,
        Your Healthcare Provider
      `;

      const auth = await authorize();
      await sendEmail(
        auth,
        booking.patientId.contactEmail,
        "Booking Deleted",
        emailContent
      );
    }

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
    const { patientId, status, doctorName, roomName } = req.body;
    let patientUpdateId = patientId || null;

    const booking = await Booking.findById(req.params.bookingId).populate(
      `patientId`,
      `name contactEmail`
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const previousPatientName = booking.patientId ? booking.patientId.name : null;
    const previousPatientEmail = booking.patientId ? booking.patientId.contactEmail : null;

    console.log("Previous patient name:", previousPatientName);
    console.log("Previous patient email:", previousPatientEmail);

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      {
        $set: {
          patientId: patientUpdateId,
          status,
        },
        $push: {
          history: {
            action: "Booking Updated",
            timestamp: new Date(),
            user: req.user._id,
            details: `Patient updated from ${
              previousPatientName || "UnAssigned"
            } to ${
              patientUpdateId ? patientUpdateId.name : "UnAssigned"
            }. Status updated to ${status}.`,
          },
        },
      },
      { new: true }
    ).populate("patientId", "name contactEmail");

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const { name, contactEmail } = updatedBooking.patientId || {};
    const { date, time } = updatedBooking;

    console.log("Updated patient name:", name);
    console.log("Updated patient email:", contactEmail);

    // Send email to the previous patient (if exists)
    if (previousPatientEmail) {
      const emailContentPreviousPatient = `
        Dear ${previousPatientName},
        Your appointment with the following details has been updated:
        Date: ${new Date(date).toLocaleDateString()}
        Time: ${time}
        Doctor: ${doctorName}
        Room: ${roomName}
        Please contact our support team for more information.
        Best regards,
        Your Healthcare Provider
      `;
      const auth = await authorize();
      await sendEmail(
        auth,
        previousPatientEmail,
        "Appointment Status Update",
        emailContentPreviousPatient
      );
    }

    // Send email to the new patient (if exists)
    if (contactEmail) {
      const emailContentNewPatient = `
        Dear ${name},
        The status of your appointment has been updated to: ${status}
        The appointment details are as follows:
        Date: ${new Date(date).toLocaleDateString()}
        Time: ${time}
        Doctor: ${doctorName}
        Room: ${roomName}
        If you have any questions, please contact our support team.
        Best regards,
        Your Healthcare Provider
      `;
      const auth = await authorize();
      await sendEmail(
        auth,
        contactEmail,
        "Appointment Status Update",
        emailContentNewPatient
      );
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: "Server error" });
  } finally {
    isProcessing = false;
  }
};

export const bookAppointment = async (req, res) => {
  if (isProcessing) {
    return res
      .status(429)
      .json({ message: "Please wait for the previous request to complete." });
  }
  isProcessing = true;
  try {
    const { patientId, roomName, doctorName} = req.body;
    const bookingId = req.params.bookingId;
    const patientName = await Patient.findById(patientId, "name");
    const name = patientName.name;
    console.log("Patient Name:", name);
    if (!patientId || !roomName || !doctorName || !patientName) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: { patientId, status: "Booked" },
        $push: {
          history: {
            action: "Appointment Booked",
            timestamp: new Date(),
            user: req.user._id,
            details: `Patient ${name} booked the appointment.`,
          },
        },
      },
      { new: true }
    ).populate("patientId", "name contactEmail");

    const { contactEmail } = booking.patientId;
    const { date, time } = booking;

    const emailContent = `
          Dear ${name},
      
          Here are the details of your upcoming appointment:
      
          <h3 style="color: #4CAF50; font-family: 'Roboto', sans-serif;">Appointment Details</h3>
      
          <p style="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;">
            <strong>Date:</strong> ${new Date(date).toLocaleDateString()}<br>
            <strong>Time:</strong> ${time}<br>
            <strong>Doctor:</strong> ${doctorName}<br>
            <strong>Room:</strong> ${roomName}<br>
            <strong>Status:</strong> Booked
          </p>
      
          <p style="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;">
            Please arrive 30 minutes before your appointment for check-in and registration.
          </p>
      
          <p style="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;">
            Thank you for choosing our healthcare services. If you have any questions or need to reschedule, please don't hesitate to contact us.
          </p>
      
          <p style="font-family: 'Roboto', sans-serif; font-size: 16px; line-height: 1.5;">
            Best regards,<br>
            Your Healthcare Provider
          </p>
        `;

    const auth = await authorize();
    await sendEmail(
      auth,
      contactEmail,
      "Your Booking Details at Ismail Hospital",
      emailContent
    );

    res.status(200).json(booking);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  } finally {
    isProcessing = false;
  }
};
export const reBookAppointment = async (req, res) => {
  if (isProcessing) {
    return res
      .status(429)
      .json({ message: "Please wait for the previous request to complete." });
  }
  isProcessing = true;
  try {
    const { patientId, roomName, doctorName } = req.body;
    const patientName = await Patient.findById(patientId, "name");
    const name = patientName.name;
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      {
        $set: { patientId: req.body.patientId, status: "ReBooked" },
        $push: {
          history: {
            action: "Appointment Rebooked",
            timestamp: new Date(),
            user: req.user._id,
            details: ` Patient ${name} rebooked the appointment.`,
          },
        },
      },
      { new: true }
    ).populate("patientId", "name contactEmail");
    const { contactEmail } = booking.patientId;
    const { date, time } = booking;
    const emailContent = `   Dear ${name},   Your appointment has been successfully rebooked with the following details:   Date: ${new Date(
      date
    ).toLocaleDateString()}   Time: ${time}   Doctor: ${doctorName}   Room: ${roomName}   Please arrive at the hospital 15 minutes prior to your appointment time.   If you have any questions or need to reschedule, please contact our support team.   Best regards,   Your Healthcare Provider`;
    const auth = await authorize();
    await sendEmail(
      auth,
      contactEmail,
      "Appointment Rebooking Confirmation",
      emailContent
    );
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  } finally {
    isProcessing = false;
  }
};
export const cancelSelectedBookings = async (req, res) => {
  if (isProcessing) {
    return res
      .status(429)
      .json({ message: "Please wait for the previous request to complete." });
  }
  isProcessing = true;
  try {
    const { bookingId } = req.params;
    const { reason, roomName, doctorName } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: { status: "Cancelled", reason: reason },
        $push: {
          history: {
            action: "Appointment Cancelled",
            timestamp: new Date(),
            user: req.user._id,
            details: ` Appointment cancelled due to the following reason: ${reason}`,
          },
        },
      },
      { new: true }
    ).populate("patientId", "name contactEmail");
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const { name, contactEmail } = booking.patientId;
    const { date, time } = booking;
    const emailContent = `
        Dear ${name},
        
        We regret to inform you that your appointment has been cancelled due to the following reason:
        
        ${reason}
        
        The cancelled appointment details are as follows:
        
        Date: ${new Date(date).toLocaleDateString()}
        Time: ${time}
        Doctor: ${doctorName}
        Room: ${roomName}
        
        If you have any questions or need to reschedule, please contact our support team.
        
        Best regards,
        Your Healthcare Provider
        `;
    const auth = await authorize();
    await sendEmail(
      auth,
      contactEmail,
      "Appointment Cancellation",
      emailContent
    );

    return res.json(booking);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to cancel the booking" });
  } finally {
    isProcessing = false;
  }
};

export const updateStatus = async (req, res) => {
  if (isProcessing) {
    return res
      .status(429)
      .json({ message: "Please wait for the previous request to complete." });
  }
  isProcessing = true;
  console.log("Request body:", req.body);
  const booking = await Booking.findById(req.body.bookingId).populate(
    "patientId",
    "name contactEmail",
  ).populate("doctorId", "username").populate("roomNo", "description");
  if (!booking) {
    isProcessing = false;
    return res.status(404).json({ message: "Booking not found" });
  }
  const previousPatientName = booking.patientId.name;
  const previousPatientEmail = booking.patientId.contactEmail;
  try {
    const { bookingId, status, patientId, doctorName, roomName } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: { status, patientId },
      },
      { new: true }
    ).populate("patientId", "name contactEmail");
    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const { name, contactEmail } = updatedBooking.patientId;
    const { date, time } = updatedBooking;
    let emailContent = "";
    let emailSubject = "";
    let recipientEmail = "";
    let historyAction = "";
    let historyDetails = "";

    switch (status) {
      case "Completed":
        emailContent = `
              Dear ${name},
        
              Your appointment has been marked as completed.
        
              The appointment details were as follows:
        
              Date: ${new Date(date).toLocaleDateString()}
              Time: ${time}
              Doctor: ${booking.doctorId.username}
              Room: ${booking.roomNo.description}
        
              Thank you for choosing our healthcare services. If you have any further questions or concerns, please don't hesitate to contact us.
        
              Best regards,
              Your Healthcare Provider
            `;
        emailSubject = "Appointment Completed";
        recipientEmail = contactEmail;
        historyAction = "Appointment Completed";
        historyDetails = `The appointment for patient ${name} on ${new Date(
          date
        ).toLocaleDateString()} at ${time} with Dr. ${booking.doctorId.username} in ${booking.roomNo.description} has been marked as completed.`;
        break;
      case "Pending":
        emailContent = `
              Dear ${name},
        
              Your appointment has been marked as pending.
        
              The appointment details are as follows:
        
              Date: ${new Date(date).toLocaleDateString()}
              Time: ${time}
              Doctor: ${booking.doctorId.username}
              Room: ${booking.roomNo.description}
        
              We will notify you once the appointment is confirmed or if there are any changes. If you have any questions or need to reschedule, please contact our support team.
        
              Best regards,
              Your Healthcare Provider
            `;
        emailSubject = "Appointment Pending";
        recipientEmail = contactEmail;
        historyAction = "Appointment Pending";
        historyDetails = `The appointment for patient ${name} on ${new Date(
          date
        ).toLocaleDateString()} at ${time} with Dr. ${booking.doctorId.username} in ${booking.roomNo.description} has been marked as pending. Waiting for confirmation.`;
        break;
      case "Cancelled":
        emailContent = `
              Dear ${previousPatientName},
        
              Your appointment has been cancelled.
        
              The cancelled appointment details were as follows:
        
              Date: ${new Date(date).toLocaleDateString()}
              Time: ${time}
              Doctor: ${booking.doctorId.username}
              Room: ${booking.roomNo.description}
        
              If you have any questions or need to reschedule, please contact our support team.
        
              Best regards,
              Your Healthcare Provider
            `;
        emailSubject = "Appointment Cancelled";
        recipientEmail = previousPatientEmail;
        historyAction = "Appointment Cancelled";
        historyDetails = `The appointment for patient ${previousPatientName} on ${new Date(
          date
        ).toLocaleDateString()} at ${time} with Dr. ${booking.doctorId.username} in ${booking.roomNo.description} has been cancelled.`;
        break;
      case "Not Booked":
        emailContent = `
              Dear ${previousPatientName},
        
              Your appointment has been marked as not booked.
        
              The appointment details were as follows:
        
              Date: ${new Date(date).toLocaleDateString()}
              Time: ${time}
              Doctor: ${booking.doctorId.username}
              Room: ${booking.roomNo.description}
        
              If you wish to book an appointment, please contact our support team.
        
              Best regards,
              Your Healthcare Provider
            `;
        emailSubject = "Appointment Not Booked";
        recipientEmail = previousPatientEmail;
        historyAction = "Appointment Not Booked";
        historyDetails = `The appointment for patient ${previousPatientName} on ${new Date(
          date
        ).toLocaleDateString()} at ${time} with Dr. ${booking.doctorId.username} in ${roomNabooking.roomNo.description} has been marked as not booked.`;
        break;
      case "Booked":
        emailContent = `
              Dear ${name},
        
              Your appointment has been successfully booked.
        
              The appointment details are as follows:
        
              Date: ${new Date(date).toLocaleDateString()}
              Time: ${time}
              Doctor: ${booking.doctorId.username}
              Room: ${booking.roomNo.descriptionbooking.roomNo.description}
        
              Please arrive 30 minutes before your appointment for check-in and registration.
        
              Thank you for choosing our healthcare services. If you have any questions or need to reschedule, please don't hesitate to contact us.
        
              Best regards,
              Your Healthcare Provider
            `;
        emailSubject = "Appointment Booked";
        recipientEmail = contactEmail;
        historyAction = "Appointment Booked";
        historyDetails = `The appointment for patient ${name} on ${new Date(
          date
        ).toLocaleDateString()} at ${time} with Dr. ${booking.doctorId.username} in ${booking.roomNo.description} has been successfully booked.`;
        break;
      case "ReBooked":
        emailContent = `
              Dear ${name},
        
              Your appointment has been successfully rebooked.
        
              The updated appointment details are as follows:
        
              Date: ${new Date(date).toLocaleDateString()}
              Time: ${time}
              Doctor: ${booking.doctorId.username}
              Room: ${booking.roomNo.description}
        
              Please arrive 30 minutes before your appointment for check-in and registration.
        
              Thank you for choosing our healthcare services. If you have any questions or need to reschedule, please don't hesitate to contact us.
        
              Best regards,
              Your Healthcare Provider
            `;
        emailSubject = "Appointment Rebooked";
        recipientEmail = contactEmail;
        historyAction = "Appointment Rebooked";
        historyDetails = `The appointment for patient ${name} on ${new Date(
          date
        ).toLocaleDateString()} at ${time} with Dr. ${booking.doctorId.username} in ${booking.roomNo.description} has been successfully rebooked.`;
        break;
      case "In Consultation":
        emailContent = `
              Dear ${name},
        
              Your appointment is currently in consultation.
        
              The appointment details are as follows:
        
              Date: ${new Date(date).toLocaleDateString()}
              Time: ${time}
              Doctor: ${booking.doctorId.username}
              Room: ${booking.roomNo.description}
        
              Please wait for further instructions from our healthcare staff.
        
              Best regards,
              Your Healthcare Provider
            `;
        emailSubject = "Appointment In Consultation";
        recipientEmail = contactEmail;
        historyAction = "Appointment In Consultation";
        historyDetails = `The appointment for patient ${name} on ${new Date(
          date
        ).toLocaleDateString()} at ${time} with Dr. ${booking.doctorId.username} in ${booking.roomNo.description} is currently in consultation.`;
        break;
      default:
        break;
    }

    if (emailContent && emailSubject && recipientEmail) {
      const auth = await authorize();
      await sendEmail(auth, recipientEmail, emailSubject, emailContent);
    }

    if (historyAction && historyDetails) {
      updatedBooking.history.push({
        action: historyAction,
        timestamp: new Date(),
        user: req.user._id,
        details: historyDetails,
      });
      await updatedBooking.save();
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: "Server error" });
  } finally {
    isProcessing = false;
  }
};

// export const generateBookingsReport = async (req, res, next) => {
//   try {
//     const { filterDate, filterPatient, filterType, filterRoom } = req.body;

//     const query = {};

//     if (filterDate) {
//       const startDate = new Date(filterDate);
//       const endDate = new Date(filterDate);
//       endDate.setDate(endDate.getDate() + 1);
//       query.date = { $gte: startDate, $lt: endDate };
//     }

//     if (filterPatient) {
//       query.patientId = filterPatient;
//     }

//     if (filterType) {
//       query.type = filterType;
//     }

//     if (filterRoom) {
//       query.roomNo = filterRoom;
//     }

//     const bookings = await Booking.find(query)
//       .populate("doctorId", "username")
//       .populate("patientId", "name")
//       .populate("roomNo", "description");

//     const reportContent = `
//       <html>
//         <head>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               margin: 0;
//               padding: 20px;
//             }
//             h1 {
//               text-align: center;
//               color: #333;
//             }
//             table {
//               width: 100%;
//               border-collapse: collapse;
//               margin-top: 20px;
//             }
//             th, td {
//               padding: 10px;
//               text-align: left;
//               border-bottom: 1px solid #ddd;
//             }
//             th {
//               background-color: #f2f2f2;
//               font-weight: bold;
//             }
//             tr:nth-child(even) {
//               background-color: #f9f9f9;
//             }
//             .logo {
//               text-align: center;
//               margin-bottom: 20px;
//             }
//             .logo img {
//               max-width: 200px;
//             }
//             .report-title {
//               text-align: center;
//               margin-bottom: 20px;
//             }
//             .report-date {
//               text-align: right;
//               font-style: italic;
//               margin-bottom: 10px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="logo">
//             <img src="https://example.com/hospital-logo.png" alt="Hospital Logo">
//           </div>
//           <div class="report-title">
//             <h1>Hospital Booking Report</h1>
//           </div>
//           <div class="report-date">
//             Report Generated on ${new Date().toLocaleDateString()}
//           </div>
//           <table>
//             <thead>
//               <tr>
//                 <th>Booking Date</th>
//                 <th>Booking Time</th>
//                 <th>Doctor</th>
//                 <th>Patient</th>
//                 <th>Room/Location</th>
//                 <th>Booking Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${bookings
//                 .map(
//                   (booking) => `
//                     <tr>
//                       <td>${new Date(booking.date).toLocaleDateString()}</td>
//                       <td>${booking.time}</td>
//                       <td>Dr. ${booking.doctorId.username}</td>
//                       <td>${booking.patientId ? booking.patientId.name : "-"}</td>
//                       <td>${
//                         booking.roomNo
//                           ? `Room ${booking.roomNo.description}`
//                           : "Online Appointment"
//                       }</td>
//                       <td>${booking.status}</td>
//                     </tr>
//                   `
//                 )
//                 .join("")}
//             </tbody>
//           </table>
//         </body>
//       </html>
//     `;

//     const pdfBuffer = await generatePDFFromHtml(reportContent);
//     res.contentType("application/pdf");
//     res.send(pdfBuffer);
//   } catch (error) {
//     next(error);
//   }
// };

export const generateAppointmentCard = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate("doctorId", "username")
      .populate("patientId", "name")
      .populate("roomNo", "description");
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const appointmentCard = `
        <html>
        <head>
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        .card {
        width: 400px;
        border: 1px solid #ddd;
        padding: 20px;
        font-family: 'Roboto', sans-serif;
        background-color: #fff;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        }
        .card h2 {
        margin-top: 0;
        color: #4CAF50;
        text-align: center;
        }
        .card p {
        margin-bottom: 10px;
        font-size: 16px;
        line-height: 1.5;
        }
        .card p strong {
        color: #333;
        font-weight: 700;
        }
        .card p:last-child {
        margin-bottom: 0;
        }
        </style>
        </head>
        <body>
        <div class="card">
        <h2>Appointment Card</h2>
        <p><strong>Date:</strong> ${new Date(
          booking.date
        ).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Doctor:</strong> ${booking.doctorId.username}</p>
        <p><strong>Patient:</strong> ${
          booking.patientId ? booking.patientId.name : "-"
        }</p>
        <p><strong>Room:</strong> ${
          booking.roomNo ? booking.roomNo.description : "Online Appointment"
        }</p>
        <p><strong>Status:</strong> ${booking.status}</p>
        </div>
        </body>
        </html>
        `;
    const pdfBuffer = await generatePDFFromHtml(appointmentCard);
    res.contentType("application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const sendEmails = async (req, res, next) => {
  try {
    const { to, subject, html } = req.body;
    const auth = await authorize();
    await sendEmail(auth, to, subject, html);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    next(error);
  }
};

export const getBookingsBySlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    console.log("Slot ID:", slotId);
    // Find the slot by ID
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    // Find all bookings associated with the slot
    const bookings = await Booking.find({ slotId })
      .populate("patientId", "name contactPhone contactEmail")
      .populate("doctorId", "username")
      .populate("roomNo", "description");
    
    console.log(bookings)
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve bookings by slot" });
  }
};

export const pendingStatus = async (req, res) => {
  try {
    const { bookingId, patientId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'Pending Payment';
    booking.patientId = patientId;

    await booking.save();
    console.log('Booking status updated successfully');
    res.status(200).json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
