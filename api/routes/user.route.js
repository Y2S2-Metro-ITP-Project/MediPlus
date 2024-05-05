import express from "express";
import mongoose from "mongoose";
import { test, signout, updateUser, deleteUser, getusers, getUser,filterUsers,searchUsers } from "../controller/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { getDoctors } from "../controller/user.controller.js";
const router = express.Router();


router.get("/test", test);
router.post("/signout", signout);
router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.get("/getusers",verifyToken, getusers);
router.post("/filter",verifyToken, filterUsers);
router.post("/search",verifyToken, searchUsers);
router.get('/getDoctors',verifyToken,getDoctors);
router.get('/:userId',getUser);
export default router;
