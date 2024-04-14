import express from "express";
import { createLeave, getAllLeaves, deleteLeave, approveRejectLeave, getUserLeaves, getTotalPendingLeave, getTodaysTotalLeave } from '../controller/empleave.controller.js';
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Route to submit a leave
router.post("/user/:userId", verifyToken, createLeave);
router.get("/getAllLeaves", getAllLeaves);
router.get("/user/:userId", getUserLeaves);
router.delete("/:id", deleteLeave);
router.put("/:id/approve-reject", approveRejectLeave);
router.get("/getTotalPendingLeave", getTotalPendingLeave);
router.get("/getTodaysTotalLeave", getTodaysTotalLeave);

export default router;
