import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { addvitals,getvitals,deletevitals,downloadPDFVitals } from "../controller/vitals.controller.js";
const router = express.Router();

router.post("/addVitals/:patientId", verifyToken, addvitals);
router.get("/getVitals/:patientId", verifyToken, getvitals);
router.delete("/deleteVitals/:vitalIdToDelete", verifyToken, deletevitals);
router.post("/DownloadPDFVitals/:Id", verifyToken, downloadPDFVitals);
export default router;