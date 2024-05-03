import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getPatients,
  registerOutPatient,
  deletePatient,
  searchPateint,
  filterPatients,
  downloadPDFPatient,
  updateOutPatient,
  getPatient,
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
export default router;
