import express from "express";
import { getAllSalary , updateSalary , DownloadSalaryReport } from "../controller/employeesalary.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.get("/getAllSalary", verifyToken, getAllSalary);
router.put("/update/:id", verifyToken, updateSalary);
router.post("/DownloadSalaryReport",verifyToken, DownloadSalaryReport);

export default router;
 