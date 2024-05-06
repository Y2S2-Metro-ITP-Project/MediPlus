import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getBookingsForUser,
  getUpcomingBookingsForUser,
} from "../controller/userBooking.controller.js";

const router = express.Router();

router.get("/bookings/:patientId", verifyToken, getBookingsForUser);
router.get("/upcomingBookings/:patientId", verifyToken, getUpcomingBookingsForUser);

export default router;