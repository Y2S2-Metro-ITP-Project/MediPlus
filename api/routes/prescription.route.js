import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  addPrescription,
  getPrescription,
  deletePrescription,
  downloadPDFPrescription,
  getPatientPrescription,
  downloadPatientPDFPrescription,
  downloadPatientDocotorPDFPrescription,
  getPrescriptionOrdersInventoryData,
} from "../controller/prescription.controller.js";
const router = express.Router();

router.post("/addPrescription", verifyToken, addPrescription);
router.get("/getPrescriptions/:patientId", verifyToken, getPrescription);
router.delete(
  "/deletePrescription/:prescriptionId",
  verifyToken,
  deletePrescription
);
router.post(
  "/DownloadPDFPrescription/:Id",
  verifyToken,
  downloadPDFPrescription
);
router.get(
  "/getPatientPrescription/:UserId",
  verifyToken,
  getPatientPrescription
);
router.post(
  "/DownloadPDFPatientPrescription/:Id",
  verifyToken,
  downloadPatientPDFPrescription
);
router.post(
  "/DownloadPDFPatientDoctorPrescription/:Id",
  verifyToken,
  downloadPatientDocotorPDFPrescription
);
router.get("/getPrescriptionsDataOrders/:id", verifyToken, getPrescriptionOrdersInventoryData);

export default router;
