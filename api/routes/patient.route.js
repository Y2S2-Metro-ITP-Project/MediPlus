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
} from "../controller/patient.controller.js";
const router = express.Router();

router.post("/register", verifyToken, registerOutPatient);
router.get("/getPatients", verifyToken, getPatients);
router.get("/getPatient/:patientId", verifyToken, getPatient);
router.delete("/delete/:patientId", verifyToken, deletePatient);
router.post("/searchPatient", verifyToken, searchPateint);
router.post("/filterPatient", verifyToken, filterPatients);
router.put("/update/:patientID", verifyToken, updateOutPatient);
router.post("/DownloadPDFPatient/:patientID", verifyToken, downloadPDFPatient);
export default router;
