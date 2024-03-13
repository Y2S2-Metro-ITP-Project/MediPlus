import mongoose from "mongoose";

const inquirySchema=new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    phone: {
        type:String,
        required:true
    },
    message: {
        type:String,
        required:true
    },
    reply: {
        type:String,
        default:""
    },
    userId:{
        type:String,
        default:"",
        required:true
    }
},{timestamps:true});

const Inquiry=mongoose.model('Inquiry',inquirySchema)
export default Inquiry;