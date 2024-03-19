import express from "express";
import { test, signout, updateUser, deleteUser, getusers, getUser } from "../controller/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.get("/test", test);
router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.get("/getusers",verifyToken, getusers);
router.get('/:userId',getUser);
router.post("/signout", signout);
export default router;
