import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getSupplierData,
  addSupplierData,
  deleteSupplierData,
  updateSupplierData,
  getFilteredSupplierData
} from "../controller/supplier.controller.js";

const router = express.Router();

router.get("/getSupplier", verifyToken, getSupplierData);
router.post("/addSupplier", verifyToken, addSupplierData);
router.delete("/deleteSupplier/:supplierId", verifyToken, deleteSupplierData);
router.put("/updateSupplier/:supplierId", verifyToken, updateSupplierData);
router.post("/filterSupplier", verifyToken, getFilteredSupplierData);

export default router;