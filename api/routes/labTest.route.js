import express from "express";
import { verifyToken } from "../utils/verifyUser.js";

import {
  getLabTests,
  getLabTest,
  createLabTest,
  updateLabTest,
  deleteLabTest,
  paginatedLabTests,
} from "../controller/labtest.controller.js";

const router = express.Router();

router.get("/getTests", verifyToken,getLabTests);
router.get("/getTest/:id",verifyToken, getLabTest);
router.post("/createTest",verifyToken, createLabTest);
router.put("/updateTest/:id",verifyToken, updateLabTest);
router.delete("/deleteTest/:id",verifyToken, deleteLabTest);
router.get("/paginateTests", verifyToken, paginatedLabTests);

export default router;
