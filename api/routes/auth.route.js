import express from 'express';
import { signup,signin,test } from '../controller/auth.controller.js';
const router=express.Router();

//router.get("/test",test);
router.post("/signup",signup);
router.post("/signin",signin);
export default router;