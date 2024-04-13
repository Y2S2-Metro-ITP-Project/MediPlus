import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getAllDoctors,
  createDoctor,
  getDoctorById,
  updateDoctorById,
  deleteDoctorById,
} from "../controller/doctor.controller.js";

const router = express.Router();

router.get("/doctors", verifyToken, getAllDoctors);
router.post("/doctors", verifyToken, createDoctor);
router.get("/doctors/:id", verifyToken, getDoctorById);
router.put("/doctors/:id", verifyToken, updateDoctorById);
router.delete("/doctors/:id", verifyToken, deleteDoctorById);

export default router;
