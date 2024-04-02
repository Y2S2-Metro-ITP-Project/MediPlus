import express from "express";

import {
  getSamples,
  getSample,
  registerSample,
  updateSample,
  deleteSample,
} from "../controller/sample.controller.js";

const router = express.Router();

router.get("/getSamples", getSamples);
router.get("/getSample/:id", getSample);
router.post("/registerSample", registerSample);
router.put("/updateSample/:id", updateSample);
router.delete("/deleteSample", deleteSample);

export default router;
