import express from "express";
import { getAllConsultationPayments , updatePaymentById, deleteConsulPayment, PDFConsultationPayments } from '../controller/consult.Payment.controller.js';
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();
router.get("/getAllConsultationPayments", verifyToken, getAllConsultationPayments);
router.put("/updateConsultPayment/:id", verifyToken, updatePaymentById);
router.delete("/deleteConsulPayment/:userId", verifyToken, deleteConsulPayment);
router.post("/PDFConsultationPayments",verifyToken, PDFConsultationPayments);

export default router;
