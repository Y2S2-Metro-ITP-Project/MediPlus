import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getDiseaseData,
  addDiseaseData,
  deleteDiseaseData,
  updateDiseaseData,
} from "../controller/diesease.contoller.js";
const router = express.Router();

router.get("/getDisease", verifyToken, getDiseaseData);
router.post("/addDisease",verifyToken,addDiseaseData);
router.delete("/deleteDisease/:diseaseId", verifyToken, deleteDiseaseData);
router.put("/updateDisease/:diseaseId", verifyToken, updateDiseaseData);

export default router;
