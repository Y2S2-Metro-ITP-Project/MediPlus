import express from "express";
import { verifyToken } from "../utils/verifyUser.js";

import { createTestOrder } from "../controller/testOrder.controller.js";

const router = express.Router();

router.post("/orderTest", createTestOrder);

export default router;
