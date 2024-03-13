import Inquiry from "../models/inquiry.model.js";
import { errorHandler } from "../utils/error.js";
export const submit = async (req, res, next) => {
    const {name,email,phone,message}=req.body;
    if(!name || !email || !phone || !message || name==="" || email==="" || phone==="" || message===""){
        next(errorHandler(400,"All fields are required"));
    }
    const newInquiry=new Inquiry({name,email,phone,message});
    try {
        await newInquiry.save();
        res.json({message:"Inquiry submitted Successfully."});
    } catch (error) {
        next(error);
    }
}