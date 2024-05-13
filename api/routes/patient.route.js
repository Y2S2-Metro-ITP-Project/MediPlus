import express from "express";
import { admitPatient } from "../controller/patient.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getPatients,
  registerOutPatient,
  deletePatient,
  searchPateint,
  filterPatients,
  downloadPDFPatient,
  getAllPatients,
  getPatientByName,
  updatePatientById,
  deletePatientById,
  downloadPDF,
  getPatient,
  updateOutPatient,
  getPatientsforBooking,
  getPatientByUser,
  updatePatientDetails,
} from "../controller/patient.controller.js";
const router = express.Router();

router.post("/register", verifyToken, registerOutPatient);
router.get("/getPatients", verifyToken, getPatients);
router.get("/getPatientsforBooking", verifyToken, getPatientsforBooking);
router.get("/getPatient/:patientId", verifyToken, getPatient);
router.get("/getPatientByUser/:userId", verifyToken, getPatientByUser);
router.delete("/delete/:patientId", verifyToken, deletePatient);
router.post("/searchPatient", verifyToken, searchPateint);
router.post("/filterPatient", verifyToken, filterPatients);
router.put("/update/:patientID", verifyToken, updateOutPatient);
router.post("/DownloadPDFPatient/:patientID", verifyToken, downloadPDFPatient);
router.put("/updatePatientDetails", updatePatientDetails);
router.post("/searchPatient", verifyToken, searchPateint);
/** InPatient */
router.post("/admit", admitPatient);
router.get("/get", getAllPatients); // Get all patients
router.get("/:name", getPatientByName); // Get a single patient by name
router.put("/:id", updatePatientById); // Update a patient by ID
router.delete("/:id", deletePatientById); // Delete a patient by ID
router.post("/downloadPDF", downloadPDF); // Download a PDF

export default router;
