import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import Slot from "../models/slot.model.js";
import {
  createSlot,
  getAllSlots,
  getSlotById,
  updateSlotById,
  deleteSlotById,
  getSlotsByType,
  cancelSlot,
  generateSlotReport,
  generateTotalReport,
  getSlotsByRoom,
} from "../controller/slot.controller.js";

const router = express.Router();

// Create a new slot
router.post("/create", verifyToken, createSlot);

// Get all slots
router.get("/", verifyToken, getAllSlots);

// Get a slot by ID
router.get("/:id", verifyToken, getSlotById);

// Update a slot by ID
router.put("/update/:id", verifyToken, updateSlotById);

// Delete a slot by ID
router.delete("/delete/:id", verifyToken, deleteSlotById);

// Get slots by type
router.get("/type/:type", verifyToken, getSlotsByType);

// Cancel a slot
router.put("/cancel/:id", verifyToken, cancelSlot);

// Generate report for a specific slot
router.get("/report/:id", verifyToken, generateSlotReport);

// Generate report for all slots
router.get("/report", verifyToken, generateTotalReport);

router.get("/room/:roomId", verifyToken, getSlotsByRoom);


export default router;