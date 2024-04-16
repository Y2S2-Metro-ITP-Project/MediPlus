import BookingOrder from "../models/bookingOrder.model.js";
import Booking from "../models/booking.model.js";
import Patient from "../models/patient.model.js";
import Payment from "../models/payment.model.js";
import generatePdfFromHtml from "../utils/PatientPDF.js";
import PaymentOrder from "../models/paymentOrder.model.js"
import { set } from "mongoose";

// Get all booking orders
export const getBookingOrderData = async (req, res, next) => {
  try {
    const bookingOrders = await BookingOrder.find()
    .populate({
        path: "doctorId",
        select: "username",
      }).populate({
        path: "patientId",
        select: "name contactEmail contactPhone",
      }).populate({
        path: "payment",
        select:
          "totalPayment status OrderType dateAndTime patientName patientEmail paymentType",
      });
      
    const totalOrders = bookingOrders.length;
    const totalCompletedOrders = bookingOrders.filter(order => order.status === "Completed").length;
    const totalPendingOrders = bookingOrders.filter(order => order.status === "Pending").length;
    const totalRejectedOrders = bookingOrders.filter(order => order.status === "Rejected").length;

    res.status(200).json({
      bookingOrders,
      totalOrders,
      totalCompletedOrders,
      totalPendingOrders,
      totalRejectedOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a booking order
export const deleteBookingOrderData = async (req, res) => {
  const { id } = req.params;
  try {
    // Update bookings associated with the order
    const order = await BookingOrder.findById(id);
    for (const bookingId of order.bookings) {
      const booking = await Booking.findById(bookingId);
      if (booking && booking.status === "Pending") {
        booking.status = "Rejected";
        await booking.save();
      }
    }
    // Delete the order
    const deletedOrder = await BookingOrder.findByIdAndDelete(id);
    res.status(200).json({ deletedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getBookingPatientOrder = async (req, res) => {
    if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isPharmacist) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    try {
      const bookingOrder = await BookingOrder.findById(id);
      if (!bookingOrder) {
        return res.status(404).json({ message: "Booking order not found" });
      }
      res.status(200).json({ bookingOrder });
    } catch (error) {
      res.status(500).json({ message: error.message });
      console.error(error);
    }
  };

export const createOrUpdatePaymentOrder = async (
    patientId,
    patientName,
    patientEmail,
    paymentId,
    paymentStatus
  ) => {
    try {
      // Find the payment order for the patient ID
      let paymentOrder = await PaymentOrder.findOne({ PatientID: patientId });
  
      if (paymentOrder) {
        // If a payment order exists, check if it has a pending status
        if (paymentOrder.status === "Pending") {
          // If it's pending, push the payment into its Payment array
          paymentOrder.Payment.push(paymentId);
        } else {
          // If it's not pending, create a new payment order
          paymentOrder = new PaymentOrder({
            PatientID: patientId,
            PatientName: patientName,
            PatientEmail: patientEmail,
            Payment: [paymentId],
            status: "Pending",
          });
        }
      } else {
        // If no payment order exists, create a new one
        paymentOrder = new PaymentOrder({
          PatientID: patientId,
          PatientName: patientName,
          PatientEmail: patientEmail,
          Payment: [paymentId],
          Status: paymentStatus === "Pending" ? "Pending" : "Completed", // Set status based on payment status
        });
      }
  
      // Save the payment order
      await paymentOrder.save();
  
      return paymentOrder;
    } catch (error) {
      throw new Error("Failed to create or update payment order");
    }
  };

// Confirm a booking order
export const confirmBookingOrder = async (req, res) => {
    if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isPharmacist) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    const { id } = req.params;
  
    try {
      // Fetch the booking order by ID
      const bookingOrder = await BookingOrder.findById(id);
  
      if (!bookingOrder) {
        return res.status(404).json({ message: "Booking order not found" });
      }
  
      // Perform actions to confirm the booking order (e.g., creating a payment, updating status)
      // Replace this logic with your specific requirements
  
      // Create a payment for the booking
      const payment = await PaymentOrder.create({
        patientId: bookingOrder.patientId,
        // Add other payment details as needed
      });
  
      // Update the booking order status to "Completed" and associate the payment ID
      const updatedBookingOrder = await BookingOrder.findByIdAndUpdate(
        id,
        { status: "Completed", payment: payment._id },
        { new: true }
      );
  
      res.status(200).json({ updatedBookingOrder });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Reject a booking order
export const rejectBookingOrderData = async (req, res) => {
    if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isPharmacist) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    const { id } = req.params;
  
    try {
      // Find and update the booking order status to "Rejected"
      const updatedOrder = await BookingOrder.findByIdAndUpdate(
        id,
        { status: "Rejected" },
        { new: true }
      );
  
      // Optionally, update the status of associated prescriptions if needed
  
      res.status(200).json({ updatedOrder });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Full rejection of a booking order
export const fullOrderRejection = async (req, res) => {
    if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isPharmacist) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    const { id } = req.params;
  
    try {
      // Find the booking order by ID
      const updatedOrder = await BookingOrder.findById(id);
  
      // Iterate through each booking in the order
      for (const bookingId of updatedOrder.bookings) {
        // Find the booking and update its status to "Rejected"
        await Booking.findByIdAndUpdate(bookingId, { status: "Rejected" });
        
        // Optionally, perform any additional actions such as updating inventory
  
        // Log any relevant information
        console.log(`Booking with ID ${bookingId} rejected.`);
      }
  
      // Update the status of the booking order to "Rejected"
      const updatedOrder1 = await BookingOrder.findByIdAndUpdate(
        id,
        { status: "Rejected" },
        { new: true }
      );
  
      // Send the updated booking order in the response
      res.status(200).json({ updatedOrder1 });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Download booking order data for a patient
export const downloadPatientOrderData = async (req, res) => {
    // Check user permissions
    const allowedRoles = [
      "isAdmin",
      "isDoctor",
      "isNurse",
      "isPharmacist",
      "isReceptionist",
      "isHeadNurse",
      "isOutPatient",
      "isInPatient",
    ];
    const isAllowed = allowedRoles.some((role) => req.user[role]);
    if (!isAllowed) {
      return res.status(403).json({ message: "You are not allowed to access these resources" });
    }
  
    // Get user ID from request parameters
    const userId = req.params.id;
  
    try {
      // Find booking orders related to the patient ID
      const bookingOrders = await BookingOrder.find({ patientId: userId })
        .populate("doctorId", "username")
        .populate("patientId", "name")
        .populate("payment", "status totalPayment");
  
      let htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Patient Booking Order Report</title>
                <style>
                    /* CSS styles */
                </style>
            </head>
            <body>
          `;
  
      let prevDate = null;
      for (const order of bookingOrders) {
        const { date, bookings, payment, doctorId, patientId } = order;
        const formattedDate = new Date(date).toLocaleString();
  
        if (formattedDate !== prevDate) {
          htmlContent += `
                <div class="section">
                  <h2>Date: ${formattedDate}</h2>
                  <p><strong>Doctor who Created the Booking:</strong> ${
                    doctorId ? doctorId.username : "N/A"
                  }</p>
                  <p><strong>Bookings:</strong></p>
                  <ul>
              `;
  
          for (const bookingId of bookings) {
            const booking = await Booking.findById(bookingId).exec();
            if (!booking) continue;
  
            const {
              // Include relevant booking properties here
            } = booking;
  
            // Append booking details to HTML content
            htmlContent += `
                  <li>
                    <!-- Include booking details here -->
                  </li>
                `;
          }
  
          htmlContent += `
                  </ul>
            `;
        }
  
        // Include payment details in the HTML content
        if (payment) {
          htmlContent += `
              <p><strong>Payment Status:</strong> <span class="status-${payment.status.toLowerCase()}">${
            payment.status
          }</span></p>
              <p><strong>Total Payment:</strong> ${payment.totalPayment}</p>
            `;
        } else {
          htmlContent += `
              <p><strong>Payment Status:</strong> <span class="status-pending">Pending</span></p>
              <p><strong>Total Payment:</strong> N/A</p>
            `;
        }
  
        htmlContent += `</div>`;
        prevDate = formattedDate;
      }
  
      htmlContent += `</body></html>`;
  
      // Generate PDF from HTML content
      const pdfBuffer = await generatePdfFromHtml(htmlContent);
  
      // Set response headers for PDF download
      res.set({
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length,
        "Content-Disposition": `attachment; filename="patient-booking-order-report.pdf"`,
      });
  
      // Send PDF buffer in the response
      res.send(pdfBuffer);
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: error.message });
    }
  };


export const downloadPatientOrderDateData = async (req, res) => {
  // Check user permissions
  const allowedRoles = [
    "isAdmin",
    "isDoctor",
    "isNurse",
    "isPharmacist",
    "isReceptionist",
    "isHeadNurse",
    "isOutPatient",
    "isInPatient",
  ];
  const isAllowed = allowedRoles.some((role) => req.user[role]);
  if (!isAllowed) {
    return res.status(403).json({ message: "You are not allowed to access these resources" });
  }

  // Extract selected date from request body
  const selectedDate = req.body.date;

  try {
    // Find booking orders for the selected date
    const bookingOrders = await BookingOrder.find({
      date: {
        $gte: new Date(selectedDate),
        $lt: new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000), // Add 24 hours to include the entire day
      },
    })
      .populate("doctorId", "username")
      .populate("patientId", "name")
      .populate("payment", "status totalPayment");

    let htmlContent = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <title>Patient Booking Order Report</title>
                  <style>
                      /* CSS styles */
                  </style>
              </head>
              <body>
            `;

    let prevDate = null;
    for (const order of bookingOrders) {
      const { date, bookings, payment, doctorId, patientId } = order;
      const formattedDate = new Date(date).toLocaleString();

      if (formattedDate !== prevDate) {
        htmlContent += `
                  <div class="section">
                    <h2>Date: ${formattedDate}</h2>
                    <p><strong>Doctor who Created the Booking:</strong> ${
                      doctorId ? doctorId.username : "N/A"
                    }</p>
                    <p><strong>Patient:</strong> ${
                      patientId ? patientId.name : "N/A"
                    }</p>
                    <p><strong>Bookings:</strong></p>
                    <ul>
                `;

        for (const bookingId of bookings) {
          const booking = await Booking.findById(bookingId).exec();
          if (!booking) continue;

          const {
            // Include relevant booking properties here
          } = booking;

          // Append booking details to HTML content
          htmlContent += `
                    <li>
                      <!-- Include booking details here -->
                    </li>
                  `;
        }

        htmlContent += `
                    </ul>
              `;
      }

      // Include payment details in the HTML content
      if (payment) {
        htmlContent += `
                <p><strong>Payment Status:</strong> <span class="status-${payment.status.toLowerCase()}">${
          payment.status
        }</span></p>
                <p><strong>Total Payment:</strong> ${payment.totalPayment}</p>
              `;
      } else {
        htmlContent += `
                <p><strong>Payment Status:</strong> <span class="status-pending">Pending</span></p>
                <p><strong>Total Payment:</strong> N/A</p>
              `;
      }

      htmlContent += `</div>`;
      prevDate = formattedDate;
    }

    htmlContent += `</body></html>`;

    // Generate PDF from HTML content
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    // Set response headers for PDF download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `attachment; filename="patient-booking-order-report.pdf"`,
    });

    // Send PDF buffer in the response
    res.send(pdfBuffer);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
};


// Download booking order report for a doctor
export const downloadDoctorOrderReport = async (req, res) => {
    // Check user permissions
    const allowedRoles = [
      "isAdmin",
      "isDoctor",
      "isNurse",
      "isPharmacist",
      "isReceptionist",
      "isHeadNurse",
      "isOutPatient",
      "isInPatient",
    ];
    const isAllowed = allowedRoles.some((role) => req.user[role]);
    if (!isAllowed) {
      return res
        .status(403)
        .json({ message: "You are not allowed to access these resources" });
    }
  
    try {
      // Find booking orders associated with the selected doctor
      const bookingOrders = await BookingOrder.find({
        doctorId: req.params.id,
      })
        .populate("doctorId", "username")
        .populate("patientId", "name")
        .populate("payment", "status totalPayment");
  
      // HTML content for the report
      let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Doctor Booking Order Report</title>
            <style>
                /* CSS styles */
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Doctor Booking Order Report</h1>
                <h2>Doctor: ${req.body.selectedDoctor.label}</h2>
            </div>
      `;
  
      let prevDate = null;
      // Iterate through each booking order
      for (const order of bookingOrders) {
        const { date, bookings, payment, doctorId, patientId } = order;
        const formattedDate = new Date(date).toLocaleString();
  
        // If the date has changed, start a new section
        if (formattedDate !== prevDate) {
          htmlContent += `
            <div class="section">
                <h2>Date: ${formattedDate}</h2>
                <p><strong>Doctor:</strong> ${
                  doctorId ? doctorId.username : "N/A"
                }</p>
                <p><strong>Patient:</strong> ${
                  patientId ? patientId.name : "N/A"
                }</p>
                <p><strong>Bookings:</strong></p>
                <ul>
          `;
  
          // Iterate through each booking in the current order
          for (const bookingId of bookings) {
            const booking = await Booking.findById(bookingId).exec();
            if (!booking) continue;
  
            // Include relevant booking properties here
            // const { property } = booking;
  
            // Append booking details to HTML content
            htmlContent += `
              <li>
                  <!-- Include booking details here -->
              </li>
            `;
          }
  
          htmlContent += `</ul>`;
        }
  
        // Include payment details in the HTML content
        if (payment) {
          htmlContent += `
            <p><strong>Payment Status:</strong> <span class="status-${payment.status.toLowerCase()}">${
            payment.status
          }</span></p>
            <p><strong>Total Payment:</strong> ${payment.totalPayment}</p>
          `;
        } else {
          htmlContent += `
            <p><strong>Payment Status:</strong> <span class="status-pending">Pending</span></p>
            <p><strong>Total Payment:</strong> N/A</p>
          `;
        }
  
        htmlContent += `</div>`;
        prevDate = formattedDate;
      }
  
      htmlContent += `</body></html>`;
  
      // Generate PDF from HTML content
      const pdfBuffer = await generatePdfFromHtml(htmlContent);
  
      // Set response headers for PDF download
      res.set({
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length,
        "Content-Disposition": `attachment; filename="doctor-booking-order-report.pdf"`,
      });
  
      // Send PDF buffer in the response
      res.send(pdfBuffer);
    } catch (error) {
      // Handle errors
      res.status(500).json({ message: error.message });
    }
  };
