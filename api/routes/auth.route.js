import express from 'express';
import { signup, test } from '../controller/auth.controller.js';
const router=express.Router();

router.get("/test",test);
router.post("/signup",signup);
export default router;