import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { getInventoryData,addInventoryData,deleteInventoryData,updateInventoryData } from "../controller/inventory.controller.js";
const router=express.Router();


router.get("/getInventory",verifyToken,getInventoryData);
router.post("/addInventory",verifyToken,addInventoryData);
router.delete("/deleteInventory/:inventoryId",verifyToken,deleteInventoryData);
router.put("/updateInventory/:inventoryId",verifyToken,updateInventoryData);



export default router;