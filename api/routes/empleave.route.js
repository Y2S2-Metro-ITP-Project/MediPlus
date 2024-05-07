import express from "express";
import { createLeave, getAllLeaves, deleteLeave, approveRejectLeave, getUserLeaves, getTotalPendingLeave, getTodaysTotalLeave,getEmployeesSummary,PDFEmployeeLeave,deleteOldLeaves  } from '../controller/empleave.controller.js';
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Route to submit a leave
router.post("/user/:userId", verifyToken, createLeave);
router.get("/getAllLeaves",verifyToken, getAllLeaves);
router.get("/user/:userId",verifyToken, getUserLeaves);
router.delete("/:id", verifyToken,deleteLeave);
router.delete("/delete/:id", verifyToken,deleteOldLeaves );
router.put("/:id/approve-reject",verifyToken, approveRejectLeave);
router.get("/getTotalPendingLeave",verifyToken, getTotalPendingLeave);
router.get("/getTodaysTotalLeave", verifyToken,getTodaysTotalLeave);
router.get("/getEmployeesSummary",verifyToken, getEmployeesSummary);
router.post("/PDFEmployeeLeave",verifyToken, PDFEmployeeLeave);
export default router;
