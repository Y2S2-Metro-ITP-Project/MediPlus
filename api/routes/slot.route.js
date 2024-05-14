import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import Slot from "../models/slot.model.js";
import {
  createSlot,
  getAllSlots,
  getSlotById,
  deleteSlotById,
  getSlotsByType,
  cancelSlot,
  generateSlotReport,
  getSlotsByRoom,
  getSlotDetails,
  getSlotsByDoctorId,
} from "../controller/slot.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createSlot);

router.get("/", verifyToken, getAllSlots);

router.get("/doctor/:userId", verifyToken, getSlotsByDoctorId);

router.get("/:id", verifyToken, getSlotById);

router.delete("/delete/:id", verifyToken, deleteSlotById);

router.get("/type/:type", verifyToken, getSlotsByType);

router.put("/cancel/:id", verifyToken, cancelSlot);

router.get("/report/:id", verifyToken, generateSlotReport);

router.get("/room/:roomId", verifyToken, getSlotsByRoom);

router.get('/getSlotDetails/:slotId', getSlotDetails);

export default router;