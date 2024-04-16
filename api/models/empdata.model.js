import mongoose from "mongoose";

const employeeDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  dateOfBirth: {
    type: Date,
    default: "No details available",
    required: true,
  },
  salary: {
    type: Number,
    default: "No details available",
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "not given"],
    default: "No details available",
  },
  address: {
    type: String,
    default: "No details available",
    required: true,
  },
  contactPhone: {
    type: String,
    default: "No details available",
    required: true,
  },
  specialization: {
    type: String,
    default: "No details available",
   
  },
  employeeImage: {
    type: String,
    default:
      "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg",
  },
   Name: {
     type: String,
    // required: true
   },
  experience: {
    type: Number,
   // required: true
  },
  qualifications: {
    type: String,
   // required: true
  },
  consultationFee: {
    type: Number,
    //required: true
  },
  bio: {
    type: String,
    //required: true
  },

}, { timestamps: true });

const EmployeeDetails = mongoose.model("EmployeeDetails", employeeDetailsSchema);
export default EmployeeDetails;
