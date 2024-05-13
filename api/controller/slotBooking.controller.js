import Booking from "../models/booking.model.js";
import generatePDFFromHtml from "../utils/generatePDF.js";
import { authorize, sendEmail } from "../utils/bookingEmail.js";

export const getBookingsForSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const bookings = await Booking.find({ slotId })
      .populate("doctorId", "username")
      .populate("patientId", "username contactEmail")
      .populate("roomNo", "description");

    const updatedBookings = bookings.map((booking) => ({
      ...booking.toObject(),
      doctorName: booking.doctorId ? booking.doctorId.username : "Unknown",
      patientName: booking.patientId ? booking.patientId.username : "UnAssigned",
      roomName: booking.roomNo ? booking.roomNo.description : "Online Appointment",
    }));

    res.status(200).json(updatedBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve bookings for slot" });
  }
};

export const cancelSelectedBookings = async (req, res) => {
  try {
    const { bookingIds, reason } = req.body;
    const bookings = await Booking.find({ _id: { $in: bookingIds } }).populate(
      "patientId",
      "username contactEmail"
    );

    const updatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        booking.status = "Cancelled";
        booking.reason = reason;
        booking.history.push({
          action: "Booking Cancelled",
          timestamp: new Date(),
          user: req.user._id,
          details: `The booking for patient ${booking.patientId.username} has been cancelled due to the following reason: ${reason}`,
        });
        await booking.save();

        const emailContent = `
          Dear ${booking.patientId.username},
    
          Your booking has been cancelled due to the following reason:
    
          ${reason}
    
          The cancelled booking details are as follows:
    
          Date: ${new Date(booking.date).toLocaleDateString()}
          Time: ${booking.time}
          Doctor: ${booking.doctorId.username}
          Room: ${booking.roomName}
    
          If you have any questions or need to reschedule, please contact our support team.
    
          Best regards,
          Your Healthcare Provider
        `;

        const auth = await authorize();
        await sendEmail(
          auth,
          booking.patientId.contactEmail,
          "Booking Cancellation",
          emailContent
        );

        return booking;
      })
    );

    res.status(200).json(updatedBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel selected bookings" });
  }
};

export const generateSlotBookingsReport = async (req, res) => {
  try {
    const { slotId } = req.params;
    const bookings = await Booking.find({ slotId })
      .populate("doctorId", "username")
      .populate("patientId", "username")
      .populate("roomNo", "description");

    const reportContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            h1 {
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
            }
            .logo {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo img {
              max-width: 150px;
            }
          </style>
        </head>
        <body>
          <div class="logo">
            <img src="https://example.com/hospital-logo.png" alt="Hospital Logo">
          </div>
          <h1>Slot Bookings Report</h1>
          <table>
            <thead>
              <tr>
                <th>Booking Date</th>
                <th>Booking Time</th>
                <th>Doctor</th>
                <th>Patient</th>
                <th>Room/Location</th>
                <th>Booking Status</th>
              </tr>
            </thead>
            <tbody>
              ${bookings
                .map(
                  (booking) => `
                    <tr>
                      <td>${new Date(booking.date).toLocaleDateString()}</td>
                      <td>${booking.time}</td>
                      <td>${booking.doctorId.username}</td>
                      <td>${booking.patientId ? booking.patientId.username : "-"}</td>
                      <td>${booking.roomNo ? booking.roomNo.description : "Online Appointment"}</td>
                      <td>${booking.status}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const pdfBuffer = await generatePDFFromHtml(reportContent);
    res.contentType("application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate slot bookings report" });
  }
};