import express from "express";
import {
  deleteInquiry,
  filterInquiry,
  getInquiries,
  getUserInquiry,
  searchInquiry,
  submit,
  updateInquiry,
  filterUserInquiry,
} from "../controller/inquiry.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.post("/submit", submit);
router.get("/getinquiries", verifyToken, getInquiries);
router.get("/getUserinquiries/:userId", verifyToken, getUserInquiry);
router.delete("/delete/:inquiryId", verifyToken, deleteInquiry);
router.put("/update/:inquiryId", verifyToken, updateInquiry);
router.post("/searchInquiry", verifyToken, searchInquiry);
router.post("/filterInquiry", verifyToken, filterInquiry);
router.post("/filterUserInquiry/:userId", verifyToken, filterUserInquiry);

export default router;
