import express from "express";
import {
  getBookingsForSlot,
  cancelSelectedBookings,
  generateSlotBookingsReport,
} from "../controller/slotBooking.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Get bookings for a specific slot
router.get("/getBookingsForSlot/:slotId", verifyToken, getBookingsForSlot);

// Cancel selected bookings
router.put("/cancelSelectedBookings", verifyToken, cancelSelectedBookings);

// Generate slot bookings report
router.get("/generateSlotBookingsReport/:slotId", verifyToken, generateSlotBookingsReport);

export default router;