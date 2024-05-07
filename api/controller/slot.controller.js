import Slot from "../models/slot.model.js";

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
    res.json(slots);
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