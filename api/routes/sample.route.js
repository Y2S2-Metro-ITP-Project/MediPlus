import express from "express";
import { verifyToken } from "../utils/verifyUser.js";

import {
  getSamples,
  getSample,
  registerSample,
  updateSample,
  deleteSample,
  logSample,
} from "../controller/sample.controller.js";

const router = express.Router();

router.get("/getSamples",verifyToken, getSamples);
router.get("/getSample/:id",verifyToken, getSample);
router.post("/registerSample",verifyToken, registerSample);// not used in final build 
router.put("/updateSample/:id",verifyToken, updateSample);
router.delete("/deleteSample",verifyToken, deleteSample);

router.post("/logSample/:id",verifyToken, logSample);

export default router;
