import mongoose from "mongoose";

const sellItemSchema = new mongoose.Schema({

    itemName:{
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
    totalAmount:{
        type:Number,

    }
},{timestamps:true})

const sellItem=mongoose.model('sellItem',sellItemSchema)
export default sellItem;