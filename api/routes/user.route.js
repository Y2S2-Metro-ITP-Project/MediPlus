import express from "express";

import { test, signout, updateUser, deleteUser, getusers, getdoctors, getAllDoctors, getPatients, getUser,filterUsers,searchUsers,getDoctors,getNurses} from "../controller/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.get("/test", test);
router.post("/signout", signout);
router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.get("/getusers",verifyToken, getusers);
router.get("/getDoctors", getdoctors);
router.get("/getAllDoctors", getAllDoctors);
router.get("/getPatients", verifyToken, getPatients);
router.post("/filter",verifyToken, filterUsers);
router.post("/search",verifyToken, searchUsers);
router.get('/:userId',getUser);
router.get("/get/getDoctors", getDoctors);
router.get("/get/getNurses", getNurses);
export default router;
