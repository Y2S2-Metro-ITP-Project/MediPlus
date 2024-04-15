import express from "express";
import { verifyToken } from "../utils/verifyUser.js";

import { createTestOrder, getAllTestOrdersForCollection , updatePriorityStatus, updatePaymentStatus} from "../controller/testOrder.controller.js";

const router = express.Router();

router.post("/orderTest/:id", verifyToken, createTestOrder);
router.get("/getOrdersForCollection",verifyToken, getAllTestOrdersForCollection);
router.patch("/updatePriority/:id", verifyToken, updatePriorityStatus);
router.patch("/updatePayment/:id", verifyToken, updatePaymentStatus);

export default router;
