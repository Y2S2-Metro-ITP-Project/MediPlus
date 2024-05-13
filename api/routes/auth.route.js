import express from 'express';
import { signup,signin,googleAuth, employeeSignUp,forgetPassword} from '../controller/auth.controller.js';
const router=express.Router();

//router.get("/test",test);
router.post("/signup",signup);
router.post("/employeeSignUp",employeeSignUp);
router.post("/signin",signin);
router.post("/google",googleAuth);
router.post("/forget-password",forgetPassword)
export default router;