import Slot from "../models/slot.model.js";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import generatePDFFromHtml from "../utils/generatePDF.js";
import { authorize, sendEmail } from "../utils/bookingEmail.js";
import Room from "../models/room.model.js";

const totalReportTemplate = (slots) => {
  const totalBookings = slots.reduce(
    (acc, slot) => acc + slot.totalBookings,
    0
  );
  const bookedCount = slots.reduce((acc, slot) => acc + slot.bookedCount, 0);
  const cancelledCount = slots.reduce(
    (acc, slot) => acc + (slot.cancelledCount || 0),
    0
  );
  const notBookedCount = slots.reduce(
    (acc, slot) => acc + (slot.notBookedCount || 0),
    0
  );

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
              <td>${
                slot.room ? slot.room.description : "Online Appointment"
              }</td>
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
  const {
    date,
    startTime,
    endTime,
    doctorId,
    room,
    bookings,
    totalBookings,
    bookedCount,
    cancelledCount,
    notBookedCount,
  } = slot;
  const bookedBookings = bookings.filter(
    (booking) => booking.status === "Booked"
  );
  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "Cancelled"
  );
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
  Copy code      h1, h2, h3 {
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
      <p><strong>Room:</strong> ${
        room ? room.description : "Online Appointment"
      }</p>
  
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
    const { date, startTime, endTime, session, room, doctorId, type } =
      req.body;

    // Check if the doctor already has a slot for the same date and time
    const existingDoctorSlot = await Slot.findOne({
      doctorId,
      date,
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    });

    if (existingDoctorSlot) {
      return res
        .status(400)
        .json({
          message: "The doctor already has a slot at the specified time.",
        });
    }

    // Check if the room is available for the specified date and time (if it's a hospital booking)
    if (type === "Hospital Booking") {
      const selectedRoom = await Room.findById(room);
      if (!selectedRoom) {
        return res.status(404).json({ error: "Room not found" });
      }

      const isRoomAvailable = await selectedRoom.isAvailable(
        date,
        startTime,
        endTime
      );
      if (!isRoomAvailable) {
        return res
          .status(400)
          .json({
            message:
              "The selected room is not available for the specified time.",
          });
      }
    }

    const slot = new Slot({
      date,
      startTime,
      endTime,
      session,
      room,
      doctorId,
      type,
    });
    const savedSlot = await slot.save();

    // Send email to the doctor
    await sendSlotEmail(savedSlot);

    res
      .status(201)
      .json({ slot: savedSlot, message: "Slot created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create slot" });
  }
};

const sendSlotEmail = async (slot) => {
  try {
    const auth = await authorize();
    const doctor = await User.findById(slot.doctorId);
    const message = `
  Dear ${doctor.username},
  Copy code  A new slot has been created for you:
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

    await sendEmail(auth, doctor.email, "New Slot Created", message);

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Get all slots
export const getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find().populate("room").populate("doctorId");
    const slotsWithBookingInfo = await Promise.all(
      slots.map(async (slot) => {
        const bookings = await Booking.find({ slotId: slot._id }).populate(
          "patientId",
          "name contactEmail"
        );
        const totalBookings = bookings.length;
        const bookedCount = bookings.filter(
          (booking) => booking.status === "Booked"
        ).length;
        const cancelledCount = bookings.filter(
          (booking) => booking.status === "Cancelled"
        ).length;
        const notBookedCount = bookings.filter(
          (booking) => booking.status === "Not Booked"
        ).length;
        const rebookedCount = bookings.filter(
          (booking) => booking.status === "Rebooked"
        ).length;

        const status =
          totalBookings === 0
            ? "Not Booked"
            : bookedCount === totalBookings
            ? "Fully Booked"
            : cancelledCount === totalBookings
            ? "Cancelled"
            : rebookedCount > 0
            ? "Filling"
            : bookedCount > 0
            ? "Filling"
            : "Unknown";

        return {
          ...slot.toObject(),
          totalBookings,
          cancelledCount,
          bookedCount,
          notBookedCount,
          rebookedCount,
          status,
          bookings,
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
    const slots = await Slot.find({type })
    .populate("room")
    .populate("doctorId");
    res.json(slots);
    } catch (error) {
    res.status(500).json({ error: "Failed to retrieve slots by type" });
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
    const report = slotReportTemplate(slot);
    const pdfBuffer = await generatePDFFromHtml(report);
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="slot_report_${slotId}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
    }
    };

export const getSlotsByRoom = async (req, res) => {
      try {
      const { roomId } = req.params;
      const slots = await Slot.find({ room: roomId })
      .populate("room")
      .populate("doctorId");
      res.json(slots);
      } catch (error) {
      res.status(500).json({ error: "Failed to retrieve slots by room" });
      }
      };

export const cancelSlot = async (req, res) => {
        try {
        const slotId = req.params.id;
        // Find the slot by ID
        const slot = await Slot.findById(slotId);
        if (!slot) {
        return res.status(404).json({ error: "Slot not found" });
        }
        // Update the slot status to 'Cancelled'
slot.status = "Cancelled";

// Cancel all associated bookings
const bookings = await Booking.find({ slotId })
  .populate("patientId", "name contactEmail")
  .populate("roomNo", "description")
  .populate("doctorId", "username");
for (const booking of bookings) {
  booking.status = "Cancelled";
  await booking.save();

  console.log(`Booking cancelled for`, booking);

  // Send email to the patient if patientId is available
  if (booking.patientId) {
    const emailContent = `
    Dear ${booking.patientId.name},

    We regret to inform you that your appointment has been cancelled due to the cancellation of the slot.

    The cancelled appointment details are as follows:

    Date: ${new Date(booking.date).toLocaleDateString()}
    Time: ${booking.time}
    Doctor: ${booking.doctorId.username}
    Room: ${
      booking.roomNo ? booking.roomNo.description : "Online Appointment"
    }

    If you have any questions or need to reschedule, please contact our support team.

    Best regards,
    Your Healthcare Provider
  `;

    const auth = await authorize();
    await sendEmail(
      auth,
      booking.patientId.contactEmail,
      "Appointment Cancellation",
      emailContent
    );
  }
}

const doctor = await User.findById(slot.doctorId);
const doctorEmailContent = `Dear ${doctor.username},Your slot scheduled for ${new Date(
  slot.date
  ).toLocaleDateString()} from ${slot.startTime} to ${
  slot.endTime
  } has been cancelled by the hospital.
  Please let us know if you have any questions or concerns.
  Best regards,
  Your Scheduling Team
  `;

  const auth = await authorize();
await sendEmail(
  auth,
  doctor.email,
  "Slot Cancellation",
  doctorEmailContent
);

// Save the updated slot
const updatedSlot = await slot.save();

res.json(updatedSlot);

} catch (err) {
  console.error(err);
  res.status(500).json({ error: "Server error" });
  }
  };

  export const getSlotDetails = async (req, res) => {
    try {
      const slotId = req.params.slotId;
      const slot = await Slot.findById(slotId)
        .populate('doctorId', 'username')
        .populate('room', 'description');
  
      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
  
      const bookings = await Booking.find({ slotId });
      const totalBookings = bookings.length;
      const bookedCount = bookings.filter((booking) => booking.status === 'Booked').length;
      const cancelledCount = bookings.filter((booking) => booking.status === 'Cancelled').length;
      const notBookedCount = bookings.filter((booking) => booking.status === 'Not Booked').length;
  
      const { date, startTime, endTime, type } = slot;
      const roomName = type === 'Online Appointment' ? 'Online' : slot.room.description;
  
      const slotDetails = {
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        doctorName: slot.doctorId.username,
        roomName,
        status: slot.session,
        totalBookings,
        bookedCount,
        cancelledCount,
        notBookedCount,
      };
  
      res.status(200).json(slotDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  };


 export const getSlotsByDoctorId = async (req, res) => {
    try {
      const { userId } = req.params;
      const slots = await Slot.find({ doctorId: userId })
        .populate("room")
        .populate("doctorId");
  
      const slotsWithBookingInfo = await Promise.all(
        slots.map(async (slot) => {
          const bookings = await Booking.find({ slotId: slot._id }).populate(
            "patientId",
            "name contactEmail"
          );
          const totalBookings = bookings.length;
          const bookedCount = bookings.filter(
            (booking) => booking.status === "Booked"
          ).length;
          const cancelledCount = bookings.filter(
            (booking) => booking.status === "Cancelled"
          ).length;
          const notBookedCount = bookings.filter(
            (booking) => booking.status === "Not Booked"
          ).length;
          const rebookedCount = bookings.filter(
            (booking) => booking.status === "Rebooked"
          ).length;
  
          const status =
            totalBookings === 0
              ? "Not Booked"
              : bookedCount === totalBookings
              ? "Fully Booked"
              : cancelledCount === totalBookings
              ? "Cancelled"
              : rebookedCount > 0
              ? "Filling"
              : bookedCount > 0
              ? "Filling"
              : "Unknown";
  
          return {
            ...slot.toObject(),
            totalBookings,
            cancelledCount,
            bookedCount,
            notBookedCount,
            rebookedCount,
            status,
            bookings,
          };
        })
      );
  
      res.json(slotsWithBookingInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve slots" });
    }
  };


