import express from "express";

import {
  getLabTests,
  getLabTest,
  createLabTest,
  updateLabTest,
  deleteLabTest,
} from "../controller/labtest.controller.js";

const router = express.Router();

router.get("/", getLabTests);
router.get("/:id", getLabTest);
router.post("/", createLabTest);
router.put("/:id", updateLabTest);
router.delete("/:id", deleteLabTest);

export default router;
