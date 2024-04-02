import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isInPatient: {
      type: Boolean,
      default: false,
    },
    isOutPatient: {
      type: Boolean,
      default: false,
    },
    isDoctor: {
      type: Boolean,
      default: false,
    },
    isNurse: {
      type: Boolean,
      default: false,
    },
    isPharmacist: {
      type: Boolean,
      default: false,
    },
    isReceptionist: {
      type: Boolean,
      default: false,
    },
    isHeadNurse: {
      type: Boolean,
      default: false,
    },
    isHRM: {
      type: Boolean,
      default: false,
    },
    isUser: {
      type: Boolean,
      default: true,
    },
    isLabTech: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);
export default User;
