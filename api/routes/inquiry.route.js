import express from "express";
import { deleteInquiry, filterInquiry, getInquiries, searchInquiry, submit,updateInquiry } from "../controller/inquiry.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.post("/submit", submit);
router.get("/getinquiries", verifyToken, getInquiries);
router.delete("/delete/:inquiryId", verifyToken, deleteInquiry);
router.put("/update/:inquiryId", verifyToken, updateInquiry);
router.post("/searchInquiry", verifyToken, searchInquiry);
router.post("/filterInquiry", verifyToken, filterInquiry);

export default router;
