// routes/specializations.js

import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { addSpecialization, deleteSpecialization, updateSpecialization, getSpecializations } from "../controller/specialization.controller.js";

const router = express.Router();

// Add a new specialization
router.post("/", verifyToken, addSpecialization);
// Get all specializations
router.get("/", verifyToken, getSpecializations);
// Update a specialization
router.put("/:specializationId", verifyToken, updateSpecialization);
// Delete a specialization
router.delete("/:specializationId", verifyToken, deleteSpecialization);

export default router;
