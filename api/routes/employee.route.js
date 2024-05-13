import express from "express";
import { getemployee, getUser, addEMP, updateEmp, deleteEmp, getEMPById, createEmployeeDetails, DownloadPDFEmployee, updateUserDetails, getDoctorDetailsById, getDoctorsBySpecialization, getDoctorBySpecializationAndId } from "../controller/employee.controller.js";
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
router.get('/:userId',verifyToken,getUser);
router.get('/:userId', getUser);
router.get('/getDoctorDetails/:doctorId', getDoctorDetailsById);
router.get('/getDoctorsBySpecialization/:specialization', getDoctorsBySpecialization);
router.get('/getDoctorBySpecializationAndId/:specialization/:doctorId', getDoctorBySpecializationAndId);
export default router;
 