import Room from "../models/room.model.js";
import Slot from "../models/slot.model.js";

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const { roomNumber, description } = req.body;
    const room = new Room({
      roomNumber,
      description,
    });
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(500).json({ error: "Failed to create room" });
  }
};

// Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("slots");
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
    const { id } = req.params;
    const { roomNumber, description } = req.body;
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
    const deletedRoom = await Room.findByIdAndDelete(id);
    if (!deletedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }
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