import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    assignedBeds: [
      {
        type: Number,
      },
    ],
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    illness: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
    },
    contactEmail: {
      type: String,
      required: true,
      unique: true,
    },
    identification: {
      type: String,
    },
    medicalHistory: {
      preExistingConditions: [String],
      allergies: [String],
      surgeries: [String],
      medications: [String],
      familyHistory: [String],
    },
    reasonForAdmission: {
      type: String,
    },
    insuranceInformation: {
      provider: {
        type: String,
      },
      policyNumber: {
        type: String,
      },
      contactInfo: {
        type: String,
      },
    },
    emergencyContact: {
      name: {
        type: String,
      },
      relationship: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
    },
    roomPreferences: {
      type: String,
      enum: ["General Ward", "Emergency Ward"],
    },
    bed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
    },
    patientProfilePicture: {
      type: String,
      default:
        "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg",
    },
    patientType: {
      type: String,
      enum: ["Inpatient", "Outpatient"],
      default: "Default",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
