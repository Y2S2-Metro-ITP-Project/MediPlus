import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createBooking,
  getBookings,
  getBookingsForDoctor,
  deleteBooking,
  searchBookings,
  filterBookings,
  searchAppointments,
  updateBooking,
  bookAppointment,
  cancelSelectedBookings,
  getBookingsForScheduling,
} from "../controller/booking.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createBooking);
router.get("/getBookings", verifyToken, getBookings);
router.get("/getBookingsForDoctor/:doctorId", getBookingsForDoctor); 
router.get("/getBookingsForScheduling",verifyToken, getBookingsForScheduling);
router.delete("/delete/:bookingId", verifyToken, deleteBooking);
router.post("/searchBookings", verifyToken, searchBookings);
router.get("/appointments", verifyToken, searchAppointments);
router.post("/filterBookings", verifyToken, filterBookings);
router.put("/update/:bookingId", verifyToken, updateBooking);
router.put("/bookAppointment/:bookingId", verifyToken, bookAppointment);
router.put("/cancelSelected", verifyToken, cancelSelectedBookings );


export default router;
