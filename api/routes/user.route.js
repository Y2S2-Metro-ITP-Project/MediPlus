import express from "express";
<<<<<<< HEAD
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
=======

import { test, signout, updateUser, deleteUser, getusers, getUser,filterUsers,searchUsers } from "../controller/user.controller.js";
>>>>>>> 4d45304e7624a11c23b6e4c7a67cf1f21a2eb165
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.get("/test", test);
router.post("/signout", signout);
router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
<<<<<<< HEAD
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
=======
router.get("/getusers",verifyToken, getusers);
router.post("/filter",verifyToken, filterUsers);
router.post("/search",verifyToken, searchUsers);
router.get('/:userId',getUser);

>>>>>>> 4d45304e7624a11c23b6e4c7a67cf1f21a2eb165
export default router;
