import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { getInventoryData,addInventoryData,deleteInventoryData,updateInventoryData,medicineInstock } from "../controller/inventory.controller.js";
const router=express.Router();


router.get("/getInventory",verifyToken,getInventoryData);
router.get("/getInventoryInstock",verifyToken,medicineInstock);
router.post("/addInventory",verifyToken,addInventoryData);
router.delete("/deleteItem/:itemId",verifyToken,deleteInventoryData);
router.put("/updateInventory/:inventoryId",verifyToken,updateInventoryData);



export default router;