import Inventory from "../models/inventory.model.js";
import { errorHandler } from "../utils/error.js";
export const getInventoryData = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isPharmacist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;
    const items = await Inventory.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalItems = await Inventory.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthItems = await Inventory.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({ items, totalItems, lastMonthItems });
  } catch (error) {
    next(error);
  }
};

export const addInventoryData = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isPharmacist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  const {
    itemName,
    itemCategory,
    itemDescription,
    itemPrice,
    itemQuantity,
    itemMinValue,
    itemImage,
    itemExpireDate,
  } = req.body;
  try {
    const inventory = new Inventory({
      itemName,
      itemCategory,
      itemDescription,
      itemPrice,
      itemQuantity,
      itemMinValue,
      itemImage,
      itemExpireDate,
    });
    await inventory.save();
    res.status(201).json({ inventory });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteInventoryData = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isPharmacist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    await Inventory.findByIdAndDelete(req.params.itemId);
    res.status(200).json({ message: "Inventory data deleted successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const updateInventoryData = async (req, res) => {};
