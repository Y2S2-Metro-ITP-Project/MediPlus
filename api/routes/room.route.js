import express from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoomById,
  deleteRoomById,
  checkRoomAvailability,
} from "../controller/room.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Create a new room
router.post("/create", verifyToken, createRoom);

// Get all rooms
router.get("/", getAllRooms);

// Get a room by ID
router.get("/:id", getRoomById);

// Update a room by ID
router.put("/update/:id", verifyToken, updateRoomById);

// Delete a room by ID
router.delete("/delete/:id", verifyToken, deleteRoomById);

// Check room availability
router.post("/availability", checkRoomAvailability);

export default router;