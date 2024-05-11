import express from "express";
import { uploadTestResults } from "../controller/labResult.controller.js";
import { verifyToken } from "../utils/verifyUser.js";



const router = express.Router();

router.post("/upload", verifyToken, uploadTestResults);
export default router;
