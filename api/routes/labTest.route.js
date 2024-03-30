import express from "express";

import {
  getLabTests,
  getLabTest,
  createLabTest,
  updateLabTest,
  deleteLabTest,
} from "../controller/labtest.controller.js";

const router = express.Router();

router.get("/getTests", getLabTests);
router.get("/getTest/:id", getLabTest);
router.post("/createTest", createLabTest);
router.put("/updateTest/:id", updateLabTest);
router.delete("/deleteTest/:id", deleteLabTest);

export default router;
