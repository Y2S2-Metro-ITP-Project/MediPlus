import Slot from "../models/slot.model.js";
import Booking from "../models/booking.model.js";

// Create a new slot
export const createSlot = async (req, res) => {
  try {
    console.log(req.body.date);
    const { date, startTime, endTime, session, room, doctorId, type } = req.body;
    const slot = new Slot({ date, startTime, endTime, session, room, doctorId, type });
    const savedSlot = await slot.save();
    console.log(savedSlot);
    res.status(201).json({ slot: savedSlot, message: "Slot created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create slot" });
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