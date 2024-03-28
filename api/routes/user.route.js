import express from "express";
import { test, signout, updateUser, deleteUser, getusers, getUser, getemployee, addEMP , updateEmp } from "../controller/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.get("/test", test);
router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.get("/getusers",verifyToken, getusers);
router.get("/getemployee",verifyToken, getemployee);
router.get('/:userId',getUser);
router.post("/signout", signout);
 router.post("/addEMP", addEMP);
 router.put("/updateEmp/:userId", verifyToken, updateEmp);
export default router;
