import Slot from "../models/slot.model.js";
import Booking from "../models/booking.model.js";
import generatePDF from "../utils/generatePDF.js";
import { google } from 'googleapis';

const totalReportTemplate = (slots) => {
  const totalBookings = slots.reduce((acc, slot) => acc + slot.totalBookings, 0);
  const bookedCount = slots.reduce((acc, slot) => acc + slot.bookedCount, 0);
  const cancelledCount = slots.reduce((acc, slot) => acc + (slot.cancelledCount || 0), 0);
  const notBookedCount = slots.reduce((acc, slot) => acc + (slot.notBookedCount || 0), 0);

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Total Slots Report - Ismail's Hospital</title>
      <style>
        /* CSS Styles */
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f9f9f9;
        }
  
        h1, h2 {
          color: #003366;
          text-align: center;
        }
  
        h1 {
          margin-top: 0;
        }
  
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
  
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
  
        th {
          background-color: #003366;
          color: white;
        }
  
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
  
        p {
          margin-top: 20px;
          font-size: 16px;
        }
  
        .header {
          background-color: #003366;
          color: white;
          padding: 20px;
          text-align: center;
        }
  
        .footer {
          background-color: #003366;
          color: white;
          padding: 10px;
          text-align: center;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Ismail's Hospital</h1>
      </div>
  
      <h2>Total Slots Report</h2>
      <h3>Overall Statistics</h3>
      <p><strong>Total Slots:</strong> ${slots.length}</p>
      <p><strong>Total Bookings:</strong> ${totalBookings}</p>
      <p><strong>Booked Count:</strong> ${bookedCount}</p>
      <p><strong>Cancelled Count:</strong> ${cancelledCount}</p>
      <p><strong>Not Booked Count:</strong> ${notBookedCount}</p>
  
      <h3>Slot Details</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Doctor</th>
            <th>Room</th>
            <th>Total Bookings</th>
            <th>Booked Count</th>
            <th>Cancelled Count</th>
            <th>Not Booked Count</th>
          </tr>
        </thead>
        <tbody>
          ${slots
            .map(
              (slot) => `
            <tr>
              <td>${new Date(slot.date).toLocaleDateString()}</td>
              <td>${slot.startTime}</td>
              <td>${slot.endTime}</td>
              <td>${slot.doctorId.username}</td>
              <td>${slot.room ? slot.room.description : "Online Appointment"}</td>
              <td>${slot.totalBookings}</td>
              <td>${slot.bookedCount}</td>
              <td>${slot.cancelledCount || 0}</td>
              <td>${slot.notBookedCount || 0}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
  
      <div class="footer">
        <p>&copy; Ismail's Hospital</p>
      </div>
    </body>
  </html>
  `;
};

const slotReportTemplate = (slot) => {
  const { date, startTime, endTime, doctorId, room, bookings, totalBookings, bookedCount, cancelledCount, notBookedCount } = slot;

  const bookedBookings = bookings.filter((booking) => booking.status === "Booked");
  const cancelledBookings = bookings.filter((booking) => booking.status === "Cancelled");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Slot Report - Ismail's Hospital</title>
        <style>
          /* CSS Styles */
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f9f9f9;
          }

          h1, h2, h3 {
            color: #003366;
            text-align: center;
          }

          h1 {
            margin-top: 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }

          th {
            background-color: #003366;
            color: white;
          }

          tr:nth-child(even) {
            background-color: #f2f2f2;
          }

          p {
            margin-top: 20px;
            font-size: 16px;
          }

          .header {
            background-color: #003366;
            color: white;
            padding: 20px;
            text-align: center;
          }

          .footer {
            background-color: #003366;
            color: white;
            padding: 10px;
            text-align: center;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Ismail's Hospital</h1>
        </div>

        <h2>Slot Report</h2>
        <h3>Slot Details</h3>
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
        <p><strong>Start Time:</strong> ${startTime}</p>
        <p><strong>End Time:</strong> ${endTime}</p>
        <p><strong>Doctor:</strong> ${doctorId.username}</p>
        <p><strong>Room:</strong> ${room ? room.description : "Online Appointment"}</p>

        <h3>Slot Statistics</h3>
        <p><strong>Total Bookings:</strong> ${totalBookings}</p>
        <p><strong>Booked Count:</strong> ${bookedCount}</p>
        <p><strong>Cancelled Count:</strong> ${cancelledCount}</p>
        <p><strong>Not Booked Count:</strong> ${notBookedCount}</p>

        <h3>Booked Appointments</h3>
        ${
          bookedBookings.length > 0
            ? `
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                ${bookedBookings
                  .map(
                    (booking) => `
                  <tr>
                    <td>${booking.patientId.username}</td>
                    <td>${booking.time}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          `
            : "<p>No booked appointments.</p>"
        }

        <h3>Cancelled Appointments</h3>
        ${
          cancelledBookings.length > 0
            ? `
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                ${cancelledBookings
                  .map(
                    (booking) => `
                  <tr>
                    <td>${booking.patientId.username}</td>
                    <td>${booking.time}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          `
            : "<p>No cancelled appointments.</p>"
        }

        <div class="footer">
          <p>&copy; Ismail's Hospital</p>
        </div>
      </body>
    </html>
  `;
};



export const createSlot = async (req, res) => {
  try {
    const { date, startTime, endTime, session, room, doctorId, type } = req.body;
    const slot = new Slot({ date, startTime, endTime, session, room, doctorId, type });
    const savedSlot = await slot.save();

    // Send email to the doctor
    await sendSlotEmail(savedSlot);

    res.status(201).json({ slot: savedSlot, message: "Slot created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create slot" });
  }
};

const sendSlotEmail = async (slot) => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );

    oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const message = `
      Dear Doctor,

      A new slot has been created for you:
      Date: ${slot.date}
      Start Time: ${slot.startTime}
      End Time: ${slot.endTime}
      Session: ${slot.session}
      Room: ${slot.room}
      Type: ${slot.type}

      Please let us know if you have any questions or concerns.

      Best regards,
      Your Scheduling Team
    `;

    const encodedMessage = Buffer.from(message).toString('base64');

    await gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: encodedMessage
      }
    });

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Get all slots
export const getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find().populate("room").populate("doctorId");
    console.log(slots);

    const slotsWithBookingInfo = await Promise.all(
      slots.map(async (slot) => {
        const bookings = await Booking.find({ slotId: slot._id });
        const totalBookings = bookings.length;
        const bookedCount = bookings.filter((booking) => booking.status === "Booked").length;

        const status =
          totalBookings === 0
            ? "Not Booked"
            : bookedCount === totalBookings
            ? "Fully Booked"
            : bookedCount > 0
            ? "Filling"
            : "Cancelled";

        return {
          ...slot.toObject(),
          totalBookings,
          bookedCount,
          status,
        };
      })
    );

    res.json(slotsWithBookingInfo);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve slots" });
  }
};

// Get a slot by ID
export const getSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Slot.findById(id).populate("room").populate("doctorId");
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }
    res.json(slot);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve slot" });
  }
};

// Update a slot by ID
export const updateSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, room, doctorId, type } = req.body;
    const updatedSlot = await Slot.findByIdAndUpdate(
      id,
      { date, startTime, endTime, room, doctorId, type },
      { new: true }
    )
      .populate("room")
      .populate("doctorId");
    if (!updatedSlot) {
      return res.status(404).json({ error: "Slot not found" });
    }
    res.json(updatedSlot);
  } catch (error) {
    res.status(500).json({ error: "Failed to update slot" });
  }
};

// Delete a slot by ID
export const deleteSlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSlot = await Slot.findByIdAndDelete(id);
    if (!deletedSlot) {
      return res.status(404).json({ error: "Slot not found" });
    }
    res.json({ message: "Slot deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete slot" });
  }
};

// Get slots by type
export const getSlotsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const slots = await Slot.find({ type })
      .populate("room")
      .populate("doctorId");
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve slots by type" });
  }
};


// Cancel a slot and associated bookings
export const cancelSlot = async (req, res) => {
  try {
    const slotId = req.params.id;

    // Find the slot by ID
    const slot = await Slot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Update the slot status to 'Cancelled'
    slot.status = 'Cancelled';

    // Cancel all associated bookings
    const bookings = await Booking.find({ slotId });
    for (const booking of bookings) {
      booking.status = 'Cancelled';
      await booking.save();
    }

    // Save the updated slot
    const updatedSlot = await slot.save();

    res.json(updatedSlot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const generateSlotReport = async (req, res) => {
  try {
    const slotId = req.params.id;

    // Find the slot by ID and populate related data
    const slot = await Slot.findById(slotId)
      .populate("doctorId")
      .populate("room")
      .populate({
        path: "bookings",
        populate: { path: "patientId", select: "username" },
      });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    // Generate the PDF report
    const report = await generatePDF(slot, slotReportTemplate);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=slot_report_${slotId}.pdf`);

    // Stream the PDF data
    report.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const generateTotalReport = async (req, res) => {
  try {
    // Find all slots and populate related data
    const slots = await Slot.find()
      .populate("doctorId")
      .populate("room")
      .populate({
        path: "bookings",
        populate: { path: "patientId", select: "username" },
      });

    // Generate the PDF report
    const report = await generatePDF(slots, totalReportTemplate);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=total_slots_report.pdf");

    // Stream the PDF data
    report.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getSlotsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const slots = await Slot.find({ room: roomId })
      .populate("room").populate("doctorId");
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve slots by room" });
  }
};