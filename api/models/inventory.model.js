import mongoose from "mongoose";

const inventorySchema= new mongoose.Schema({

    itemName: {
        type:String,
        required:true,
        unique:true
    },
    itemCategory: {
        type:String,
        required:true
    },
    itemDescription: {
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
    itemMinValue:{
        type:Number,
        required:true
    },
    itemImage: {
        type:String,
    },
    itemExpireDate: {
        type:String,
        required:true
    },
    supplierName: {
        type:String,
    },
    supplierEmail: {
        type:String,
<<<<<<< HEAD
=======
        required:true,
        unique:true
>>>>>>> 4d45304e7624a11c23b6e4c7a67cf1f21a2eb165
    },
},{timestamps:true})

const Inventory=mongoose.model('Inventory',inventorySchema)
export default Inventory;

