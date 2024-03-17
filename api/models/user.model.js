import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,

    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    profilePicture:{
        type:String,
        default:"https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg",
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    isPatient:{
        type:Boolean,
        default:false,
    },
    patientType:{
        type:String,
        default:"Default",
    }
    },{timestamps:true}
);

const User=mongoose.model("User",userSchema);
export default User;