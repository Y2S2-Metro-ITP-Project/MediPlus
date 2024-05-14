// room.controller.js
import Room from "../models/room.model.js";
import Slot from "../models/slot.model.js";
import { roomValidation } from "../validations/room.validation.js";

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const { error } = roomValidation(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { roomNumber, description } = req.body;
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ error: "Room number already exists" });
    }

    const room = new Room({ roomNumber, description });
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
};

// Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    if (rooms.length === 0) {
      return res.status(404).json({ error: "No rooms found" });
    }
    res.json(rooms);
  } catch (error) {
    console.error("Failed to retrieve rooms:", error);
    res.status(500).json({ error: "Failed to retrieve rooms" });
  }
};

// Get a room by ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id).populate("slots");
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve room" });
  }
};

// Update a room by ID
export const updateRoomById = async (req, res) => {
  try {
    const { error } = roomValidation(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id } = req.params;
    const { roomNumber, description } = req.body;

    const existingRoom = await Room.findOne({ roomNumber, _id: { $ne: id } });
    if (existingRoom) {
      return res.status(400).json({ error: "Room number already exists" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { roomNumber, description },
      { new: true }
    ).populate("slots");

    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ error: "Failed to update room" });
  }
};

// Delete a room by ID
export const deleteRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const associatedSlots = await Slot.find({ room: id });
    if (associatedSlots.length > 0) {
      return res.status(400).json({
        error: "Cannot delete room. There are slots associated with this room.",
      });
    }

    await Room.findByIdAndDelete(id);
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete room" });
  }
};

// Check room availability
export const checkRoomAvailability = async (req, res) => {
  try {
    const { roomId, date, startTime, endTime } = req.body;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const isAvailable = await room.isAvailable(date, startTime, endTime);
    res.json({ isAvailable });
  } catch (error) {
    res.status(500).json({ error: "Failed to check room availability" });
  }
};

// Generate room report
export const generateRoomReport = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id).populate("slots");

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Generate report logic here
    const report = generateReport(room);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="room_report_${id}.pdf"`
    );
    res.send(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate room report" });
  }
};

// Generate total rooms report
export const generateTotalReport = async (req, res) => {
  try {
    const rooms = await Room.find().populate("slots");

    // Generate report logic here
    const report = generateTotalReport(rooms);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="total_rooms_report.pdf"`);
    res.send(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate total rooms report" });
  }
};

