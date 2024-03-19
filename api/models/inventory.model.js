import mongoose from "mongoose";

const inventorySchema= new mongoose.Schema({
    itemName: {
        type:String,
        required:true
    },
    itemCategory: {
        type:String,
        required:true
    },
    itemDecription: {
        type:String,
        required:true
    },
    itemPrice: {
        type:Number,
        required:true
    },
    itemQuantity: {
        type:Number,
        required:true
    },
    itemImage: {
        type:String,
    },
},{timestamps:true})

const Inventory=mongoose.model('Inventory',inventorySchema)
export default Inventory;