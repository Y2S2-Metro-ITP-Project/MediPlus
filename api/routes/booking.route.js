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
  updateStatus,
  reBookAppointment,
  //generateBookingsReport,
  generateAppointmentCard,
  sendEmails,
  getBookingsBySlot,
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
router.put("/rebookAppointment/:bookingId", verifyToken, reBookAppointment);
router.put("/updateStatus", verifyToken, updateStatus);
router.put("/cancel/:bookingId", verifyToken, cancelSelectedBookings);
//router.post("/generateReport", verifyToken, generateBookingsReport);
router.get("/generateAppointmentCard/:bookingId", verifyToken, generateAppointmentCard);
router.post('/sendEmail', verifyToken, sendEmails);
router.get("/getBookingsForSlot/:slotId", verifyToken, getBookingsBySlot);

export default router;
