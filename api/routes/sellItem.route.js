import express from "express";
import { verifyToken } from "../utils/verifyUser";
//import { getsellItemData,addsellItemData,deletesellItemData,updatesellItemData} form "../controller/sellItem.controller.js";
import { getSellItemData, addSellItemData, deleteSellItemData, updateSellItemData } from "../controller/sellItem.controller.js";
const router=express.Router();

router.get("/getsellItem",verifyToken,getSellItemData);
router.post("/addsellItem",verifyToken,addSellItemData);
router.delete("/deletesellItem/:itemId",verifyToken,deleteSellItemData);
router.put("/updatesellItem/:inventoryId",verifyToken,updateSellItemData);



export default router;