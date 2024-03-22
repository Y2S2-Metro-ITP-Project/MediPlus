import mongoose from "mongoose";

const inventorySchema= new mongoose.Schema({
    itemname:{
        type:String,
        required:true,
    },
    price:{
        type:Double,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    itemQTY:{
        type:Number,
        require:true,

    },
    
})