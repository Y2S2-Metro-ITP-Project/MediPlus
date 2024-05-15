import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      unique: true,
    },
    itemCategory: {
      type: String,
      required: true,
    },
    itemDescription: {
      type: String,
      required: true,
    },
    itemPrice: {
      type: Number,
      required: true,
    },
    itemQuantity: {
      type: Number,
      required: true,
    },
    itemMinValue: {
      type: Number,
      required: true,
    },
    itemImage: {
      type: String,
    },
    itemExpireDate: {
      type: String,
      required: true,
    },
    supplierName: {
      type: String,
    },
    supplierEmail: {
      type: String,
      required: true,
      unique: true,
    },
    supplierPhone: {
      type: String,
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
  },
  { timestamps: true }
);

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
