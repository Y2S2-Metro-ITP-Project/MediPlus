import express from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoomById,
  deleteRoomById,
  checkRoomAvailability,
  generateRoomReport,
  generateTotalReport,
} from "../controller/room.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyToken, createRoom);
router.get("/", getAllRooms);
router.get("/:id", getRoomById);
router.put("/update/:id", verifyToken, updateRoomById);
router.delete("/delete/:id", verifyToken, deleteRoomById);
router.post("/availability", checkRoomAvailability);
router.get("/report/:id", verifyToken, generateRoomReport);
router.get("/report", verifyToken, generateTotalReport);

export default router;