import express from "express";
import { test,signout, updateUser} from "../controller/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router=express.Router();

router.get("/test",test)
router.put("/update/:userId",verifyToken,updateUser)
router.post("/signout",signout)
export default router;