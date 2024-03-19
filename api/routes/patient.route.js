import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { getPatients, register,deletePatient,searchPateint, filterPatients } from "../controller/patient.controller.js";
const router = express.Router();

router.post("/register",verifyToken,register);
router.get("/getPatients",verifyToken,getPatients);
router.delete("/delete/:patientId", verifyToken, deletePatient);
router.post("/searchPatient",verifyToken,searchPateint);
router.post("/filterPatient",verifyToken,filterPatients);
export default router;
