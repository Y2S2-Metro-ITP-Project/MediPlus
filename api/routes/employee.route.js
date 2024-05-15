import express from "express";
import { getemployee, getUser, addEMP, updateEmp, deleteEmp, getEMPById, createEmployeeDetails, DownloadPDFEmployee,
     updateUserDetails, getDoctorDetailsById, getDoctorsBySpecialization, getDoctorBySpecializationAndId ,getDoctorDetails } from "../controller/employee.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/addEMP", verifyToken, addEMP);
router.delete("/deleteEmp/:userId", verifyToken, deleteEmp);
router.get("/getemployee", verifyToken, getemployee);
router.get("/getEMPById/:userId",verifyToken, getEMPById);
router.put("/updateEmp/:userId", verifyToken, updateEmp);
router.put("/updateUserDetails/:userId", verifyToken, updateUserDetails);
router.post("/createEmployeeDetails", verifyToken ,createEmployeeDetails);
router.post("/DownloadPDFEmployee/:userId",verifyToken, DownloadPDFEmployee);
router.get('/getDoctorDetails/:doctorId', getDoctorDetailsById);
router.get('/getDoctorsBySpecialization/:specialization', verifyToken, getDoctorsBySpecialization);
router.get('/getDoctorBySpecializationAndId/:specialization/:doctorId', verifyToken, getDoctorBySpecializationAndId);
router.get('/getDoctorDetails', getDoctorDetails);
router.get('/:userId', verifyToken, getUser);

export default router;
