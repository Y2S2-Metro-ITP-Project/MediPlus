import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { addPrescription,getPrescription,deletePrescription,downloadPDFPrescription} from '../controller/prescription.controller.js';
const router = express.Router();

router.post("/addPrescription", verifyToken, addPrescription);
router.get("/getPrescriptions/:patientId", verifyToken, getPrescription);
router.delete("/deletePrescription/:prescriptionId", verifyToken, deletePrescription);
router.post("/DownloadPDFPrescription/:Id", verifyToken, downloadPDFPrescription);




export default router;