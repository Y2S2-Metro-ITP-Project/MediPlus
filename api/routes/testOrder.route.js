import express from "express";
import { verifyToken } from "../utils/verifyUser.js";

import { createTestOrder, getAllTestOrdersForCollection , getAllTestOrders, updatePriorityStatus, updatePaymentStatus, deleteTestOrder,getTestOrderByPatientId} from "../controller/testOrder.controller.js";

const router = express.Router();

router.post("/orderTest/:id", verifyToken, createTestOrder);
router.get("/getPatientTests/:patientId", verifyToken, getTestOrderByPatientId);
router.get("/getOrdersForCollection",verifyToken, getAllTestOrdersForCollection);
router.get("/getTestOrders",verifyToken, getAllTestOrders);
router.patch("/updatePriority/:id", verifyToken, updatePriorityStatus);
router.patch("/updatePayment/:id", verifyToken, updatePaymentStatus);
router.delete("/deleteOrder/:id", verifyToken, deleteTestOrder);

export default router;
