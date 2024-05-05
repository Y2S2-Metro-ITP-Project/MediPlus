import express from "express";
import { getemployee, getUser, addEMP, updateEmp, deleteEmp, getEMPById, createEmployeeDetails, DownloadPDFEmployee, updateUserDetails, getDoctorDetailsById } from "../controller/employee.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/addEMP", addEMP);
router.delete("/deleteEmp/:userId", verifyToken, deleteEmp);
router.get("/getemployee", verifyToken, getemployee);
router.get("/getEMPById/:userId", getEMPById);
router.put("/updateEmp/:userId", verifyToken, updateEmp);
router.put("/updateUserDetails/:userId", verifyToken, updateUserDetails);
router.post("/createEmployeeDetails", createEmployeeDetails);
router.post("/DownloadPDFEmployee/:userId", DownloadPDFEmployee);
router.get('/:userId', getUser);
router.get('/getDoctorDetails/:doctorId', getDoctorDetailsById);

export default router;
