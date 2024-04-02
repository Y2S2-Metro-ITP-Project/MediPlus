import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createAppointment,
  getAppointments,
  deleteAppointment,
  searchAppointments,
  filterAppointments,
} from "../controller/appointment.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createAppointment);
router.get("/getAppointments", verifyToken, getAppointments);
router.delete("/delete/:appointmentId", verifyToken, deleteAppointment);
router.post("/searchAppointments", verifyToken, searchAppointments);
router.post("/filterAppointments", verifyToken, filterAppointments);

export default router;