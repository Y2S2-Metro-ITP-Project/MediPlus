import express from "express";
import {
  test,
  signout,
  updateUser,
  deleteUser,
  getusers,
  getUser,
  filterUsers,
  searchUsers,
  getemployee,
  addEMP,
  updateEmp,
  getDoctors,
  getNurses,
} from "../controller/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.get("/test", test);
router.post("/signout", signout);
router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.get("/getusers", verifyToken, getusers);
router.get("/getemployee", verifyToken, getemployee);
router.post("/filter", verifyToken, filterUsers);
router.post("/search", verifyToken, searchUsers);
router.get("/:userId", getUser);
router.post("/addEMP", addEMP);
router.put("/updateEmp/:userId", verifyToken, updateEmp);
router.get("/getDoctors", getDoctors);
router.get("/getNurses", getNurses);
router.get("/get/getDoctors", getDoctors);
router.get("/get/getNurses", getNurses);
export default router;
