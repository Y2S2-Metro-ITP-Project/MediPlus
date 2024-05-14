import express from "express";
import { uploadTestResults, getResultOfOutPatient } from "../controller/labResult.controller.js";
import { verifyToken } from "../utils/verifyUser.js";



const router = express.Router();

router.post("/upload", verifyToken, uploadTestResults);
router.get("/getResult/:patientId", verifyToken, getResultOfOutPatient )
export default router;
