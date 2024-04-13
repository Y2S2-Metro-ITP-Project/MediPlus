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
  },
  salary: {
    type: Number,
    default: "No details available",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "not given"],
    default: "No details available",
  },
  address: {
    type: String,
    default: "No details available",
  },
  contactPhone: {
    type: String,
    default: "No details available",
  },
  specialization: {
    type: String,
    default: "No details available",
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
