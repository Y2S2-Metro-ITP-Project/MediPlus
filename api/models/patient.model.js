import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    patientName:{
        type:String,
        required:true,
    },
    patientPhone:{
        type:String,
        default:"Not Provided",
    },
    patientProfilePicture:{
        type:String,
        default:"https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg",
    },
    patientType:{
        type:String,
        default:"Default",
    }
    },{timestamps:true}
);

const Patient=mongoose.model("Patient",patientSchema);
export default Patient;