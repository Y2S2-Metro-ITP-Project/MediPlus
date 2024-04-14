import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createBooking,
  getBookings,
  deleteBooking,
  searchBookings,
  filterBookings,
  searchAppointments,
} from "../controller/booking.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createBooking);
router.get("/getBookings", verifyToken, getBookings);
router.delete("/delete/:bookingId", verifyToken, deleteBooking);
router.post("/searchBookings", verifyToken, searchBookings);
router.get("/appointments", verifyToken, searchAppointments);
router.post("/filterBookings", verifyToken, filterBookings);

export default router;
