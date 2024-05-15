import Payment from '../models/payment.model.js';
import mongoose from 'mongoose';
import generatePdfFromHtml from "../utils/PatientPDF.js";
import Booking from '../models/booking.model.js';
import { authorize, sendEmail } from "../utils/bookingEmail.js";

export const getAllConsultationPayments = async (req, res) => {
  try {
    // Find all payments with OrderType "Consultation"
    const consultationPayments = await Payment.find({ OrderType: "Consultation" });

    // Return the consultation payments in the response
    res.json(consultationPayments);
  } catch (error) {
    console.error('Error fetching consultation payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Controller function to handle updating a payment
export const updatePaymentById = async (req, res) => {
  // Extract payment ID from request parameters
  const paymentId = req.params.id;
  console.log('Received ID:', paymentId);

  try {
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const { status } = req.body;
    const result = await Payment.updateOne(
      { _id: paymentId }, 
      { $set: { status: "Completed" } } // Set the status to "Completed"
    );
    if (result.nModified === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Controller function to handle deleting a payment by ID
export const deleteConsulPayment = async (req, res) => {
  // Extract payment ID from request parameters
  const paymentId = req.params.id;
  console.log('Received ID:', paymentId);

  try {
    // If payment ID is not a valid MongoDB ObjectId, return 404 status code with error message
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Find the payment by ID and delete it
    const deletedPayment = await Payment.findByIdAndDelete(paymentId);

    // If no payment was found with the provided ID, return 404 status code with error message
    if (!deletedPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Return success message
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    // If an error occurs, return 500 status code with error message
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




export const PDFConsultationPayments = async (req, res, next) => {
  try {
    const { consultationPayments, selectedMonth } = req.body;
    if (!consultationPayments || !Array.isArray(consultationPayments)) {
      throw new Error("Invalid data received");
    }

    let filteredPayments = consultationPayments;
    if (selectedMonth !== "") {
      filteredPayments = consultationPayments.filter(payment => {
        const paymentDate = new Date(payment.dateAndTime);
        const paymentMonth = paymentDate.getMonth();
        return paymentMonth == selectedMonth;
      });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Consultation Payment Report</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h1>Consultation Payment Report - ${generateMonthName(selectedMonth)}</h1>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient Name</th>
              <th>Patient Email</th>
              <th>Total Payment</th>
              <th>Payment Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPayments.map(payment => `
              <tr>
                <td>${formatDate(payment.dateAndTime)}</td>
                <td>${payment.patientName}</td>
                <td>${payment.patientEmail}</td>
                <td>${payment.totalPayment}</td>
                <td>${payment.paymentType}</td>
                <td>${payment.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Generate PDF from HTML content using Puppeteer
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    // Set response headers for PDF download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=Consultation_Payments_Report.pdf",
      "Content-Length": pdfBuffer.length,
    });

    // Send the PDF buffer as response
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

const generateMonthName = (monthIndex) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[parseInt(monthIndex)];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};


export const createConsultationPayment = async (req, res) => {
  try {
    const { patientId, patientName, patientEmail, OrderType, totalPayment, paymentType, status, bookingId } = req.body;
    console.log('Received payment data:', req.body);
    // Create a new payment record
    const payment = new Payment({
      patientId,
      patientName,
      patientEmail,
      OrderType,
      totalPayment,
      paymentType,
      status,
      bookingId,
    });

    // Save the payment record to the database
    const savedPayment = await payment.save();
    if (savedPayment) {
      const booking = await Booking.findById(bookingId)
        .populate('roomNo', 'description')
        .populate('doctorId', 'username')
        .populate('patientId', 'name contactEmail');

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      booking.status = 'Booked';
      await booking.save();

      // Send email to patient
      const emailData = {
        to: booking.patientId.contactEmail,
        subject: 'Booking Confirmation',
        text: `Dear ${booking.patientId.name},\n\nYour booking has been confirmed.\n\nDoctor: ${booking.doctorId.username}\nDate: ${booking.date}\nTime: ${booking.time}\nRoom: ${booking.roomNo ? booking.roomNo.description : 'Online Appointment'}\n\nThank you for choosing our service.\n\nBest Regards,\nHospital Team`,
      };

      const auth = await authorize();
      await sendEmail(auth, emailData.to, emailData.subject, emailData.text);
    }

    res.status(201).json(savedPayment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};