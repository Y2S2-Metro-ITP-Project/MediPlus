import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getInventoryData,
  addInventoryData,
  deleteInventoryData,
  updateInventoryData,
  medicineInstock,
  genrateInventoryReport,
  genrateExpairyInventoryReport,
  orderInventoryItem,
  genrateInstockInventoryReport,
  genrateLowStockInventoryReport,
  genrateOutOfStockInventoryReport,
  genrateCloseToExpairyOfStockInventoryReport,
  getFilteredInventoryData
} from "../controller/inventory.controller.js";
const router = express.Router();

router.get("/getInventory", verifyToken, getInventoryData);
router.get("/getInventoryInstock", verifyToken, medicineInstock);
router.post("/addInventory", verifyToken, addInventoryData);
router.delete("/deleteItem/:itemId", verifyToken, deleteInventoryData);
router.put("/updateInventory/:inventoryId", verifyToken, updateInventoryData);
router.post("/genrateInventoryReport", verifyToken, genrateInventoryReport);
router.post(
  "/genrateExpiaryInventoryReport",
  verifyToken,
  genrateExpairyInventoryReport
);
router.post("/orderItem/:itemId", verifyToken, orderInventoryItem);
router.post(
  "/genrateInstockInventoryReport",
  verifyToken,
  genrateInstockInventoryReport
);
router.post(
  "/genrateLowStockInventoryReport",
  verifyToken,
  genrateLowStockInventoryReport
);
router.post(
  "/genrateOutofStockInventoryReport",
  verifyToken,
  genrateOutOfStockInventoryReport
);
router.post(
  "/genrateOneMonthAwayInventoryReport",
  verifyToken,
  genrateCloseToExpairyOfStockInventoryReport
);
router.post("/filterInventory", verifyToken, getFilteredInventoryData);
export default router;
