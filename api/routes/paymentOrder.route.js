import express from "express";
import {
  getPaymentOrders,
  getSpecificPaymentOrder,
  generateInvoice,
  updatePaymentOrder,
  rejectPaymentOrder,
  downloadByDatePaymentReport,
  deletePaymentOrder,
  getInpatientPaymentOrders,
  downloadInByDatePaymentReport
} from "../controller/paymentOrder.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.get("/getPaymentOrder", verifyToken, getPaymentOrders);
router.get(
  "/getSpecificPaymentOrder/:id",
  verifyToken,
  getSpecificPaymentOrder
);
router.get("/getInPaymentOrder", verifyToken, getInpatientPaymentOrders);
router.post("/generateInvoice/:id", verifyToken, generateInvoice);
router.put("/updatePayment/:id", verifyToken, updatePaymentOrder);
router.put("/rejectPayment/:id", verifyToken, rejectPaymentOrder);
router.post("/downloadPaymentReport", verifyToken, downloadByDatePaymentReport);
router.post("/downloadInPaymentReport", verifyToken, downloadInByDatePaymentReport);
router.delete("/deletePaymentOrder/:id", verifyToken, deletePaymentOrder);

export default router;
