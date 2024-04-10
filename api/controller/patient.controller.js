import Patient from "../models/patient.model.js";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/email.js";
import pdf from "html-pdf";
import generatePdfFromHtml from "../utils/PatientPDF.js";
import generatePDFFromHtml from "../utils/BedPDF.js";
import Bed from "../models/bed.model.js";


export const registerOutPatient = async (req, res, next) => {
  const {
    name,
    illness,
    identification,
    gender,
    emergencyPhoneNumber,
    emergencyName,
    dateOfBirth,
    contactPhone,
    contactEmail,
    address,
    doctor,
    patientPicture,
  } = req.body;
  const password = Math.random().toString(36).slice(-8);
  const hashPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({
    username:
      name.toLowerCase().split(" ").join("") +
      Math.random().toString(36).slice(-4),
    email: contactEmail,
    password: hashPassword,
    isOutPatient: true,
    isUser: false,
  });
  try {
    await newUser.save();
  } catch (error) {
    return next(errorHandler(500, "Error occurred while saving the user"));
  }
  const newPatient = new Patient({
    name,
    illness,
    patientProfilePicture: patientPicture,
    identification,
    gender,
    emergencyContact: {
      name: emergencyName,
      phoneNumber: emergencyPhoneNumber,
    },
    dateOfBirth,
    contactPhone,
    contactEmail,
    address,
    patientType: "Outpatient",
    user: newUser._id,
  });
  if (
    !name ||
    name === "" ||
    !contactPhone ||
    contactPhone === "" ||
    !patientPicture ||
    patientPicture === "" ||
    !identification ||
    identification === ""
  ) {
    return next(errorHandler(400, "All fields are required"));
  }
  try {
    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
  try {
    await sendEmail({
      to: contactEmail,
      subject: "Welcome to Ismails Pvt Hospital!",
      html: `
      <p>Dear User,</p>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> example@example.com</li>
        <li><strong>Password:</strong> 123456</li>
      </ul>
      <p>Please keep this information secure.</p>
      <p>Best regards,<br>The MediPlus Team</p>
      <p>For any inquiries, please contact us at <strong> 0758 123 456</strong></p>
      <P>This is an auto-generated email. Please do not reply to this email.</p>
    `,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getPatients = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isReceptionist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to sell all the user of the database"
      )
    );
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;
    const patients = await Patient.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalUser = await Patient.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUser = await Patient.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({ patients, totalUser, lastMonthUser });
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isReceptionist) {
    return next(
      errorHandler(403, "You are not allowed to delete this account")
    );
  }

  try {
    await Patient.findByIdAndDelete(req.params.patientId);
    res.status(200).json({ message: "Patient Data deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const searchPateint = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    req.user.id !== req.params.patientId &&
    !req.user.isReceptionist
  ) {
    return next(
      errorHandler(403, "you are not allowed to access this resource")
    );
  }
  try {
    const searchTerm = req.body.search;
    const patients = await Patient.find({
      $or: [
        {
          name: { $regex: new RegExp(searchTerm, "i") },
        },
      ],
    });
    if (!patients && patients.length === 0) {
      return next(errorHandler(404, "No patient found with this name"));
    }
    res.status(200).json(patients);
  } catch (error) {}
};

export const filterPatients = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isReceptionist) {
    return next(
      errorHandler(403, "You are not allowed to access these resources")
    );
  }
  try {
    let query = {};
    const filterOption = req.body.filterOption;

    const currentDate = new Date();
    let startDate, endDate;

    switch (filterOption) {
      case "today":
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "lastmonth":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0,
          23,
          59,
          59,
          999
        );
        break;
      case "lastyear":
        startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
        endDate = new Date(
          currentDate.getFullYear() - 1,
          11,
          31,
          23,
          59,
          59,
          999
        );
        break;
      case "Bydate":
        startDate = new Date(req.body.startDate);
        endDate = new Date(req.body.endDate);
        break;
      default:
        break;
    }
    if (startDate && endDate) {
      query.admissionDate = { $gte: startDate, $lte: endDate };
    }

    const patients = await Patient.find(query);
    res.status(200).json(patients);
  } catch (error) {
    next(error);
  }
};

export const downloadPDFPatient = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isReceptionist) {
    return next(
      errorHandler(403, "You are not allowed to access these resources")
    );
  }
  try {
    const patient = await Patient.findById(req.params.patientID).populate(
      "user"
    );
    if (!patient) {
      return next(errorHandler(404, "No patient found with this ID"));
    }
    const name = patient.name;
    const gender = patient.gender;
    const contactEmail = patient.contactEmail;
    const contactPhone = patient.contactPhone;
    const createdAt = patient.createdAt;
    const dateOfBirth = patient.dateOfBirth;
    const address = patient.address;
    const identification = patient.identification;
    const emergencyName = patient.emergencyContact.name;
    const emergencyPhoneNumber = patient.emergencyContact.phoneNumber;
    const patientProfilePicture = patient.patientProfilePicture;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Patient Registration Report</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h1, h2 {
                margin-bottom: 10px;
                color: #333;
            }
            p {
                margin-bottom: 5px;
                color: #666;
            }
            .section {
                margin-bottom: 20px;
            }
            .patient-picture {
                width: 200px;
                height: auto;
                border: 1px solid #ccc;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Patient Medical Report</h1>
        </div>
        <div class="section">
        <h2>Patient Picture</h2>
        <img class="patient-picture" src="${patientProfilePicture}" alt="Patient Picture">
    </div>
        <div class="section">
            <h2>Personal Information</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Gender:</strong> ${gender}</p>
            <p><strong>Date of Birth:</strong> ${dateOfBirth}</p>
            <p><strong>Contact Email:</strong> ${contactEmail}</p>
            <p><strong>Contact Phone:</strong> ${contactPhone}</p>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Identification:</strong> ${identification}</p>
        </div>
        <div class="section">
            <h2>Emergency Contact Information</h2>
            <p><strong>Name:</strong> ${emergencyName}</p>
            <p><strong>Phone Number:</strong> ${emergencyPhoneNumber}</p>
        </div>
        <div class="section">
            <h2>Additional Information</h2>
            <p><strong>Created At:</strong> ${createdAt}</p>
        </div>
    </body>
    </html>
    
`;
    const pdfBuffer = await generatePdfFromHtml(htmlContent);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const admitPatient = async (req, res, next) => {
  console.log(req.body);
  const {
    name,
    admissionDate,
    illness,
    dateOfBirth,
    gender,
    address,
    contactPhone,
    contactEmail,
    identification,
    medicalHistory,
    reasonForAdmission,
    insuranceInformation,
    emergencyContact,
    roomPreferences,
  } = req.body;

  try {
    // Validate required fields
    if (
      !name ||
      !admissionDate ||
      !illness ||
      !dateOfBirth ||
      !gender ||
      !address ||
      !contactPhone ||
      !contactEmail ||
      !roomPreferences
    ) {
      return next(errorHandler(400, "All fields are required"));
    }

    // Create a new patient instance
    const newPatient = new Patient({
      name,
      admissionDate,
      illness,
      dateOfBirth,
      gender,
      address,
      contactPhone,
      contactEmail,
      identification,
      medicalHistory,
      reasonForAdmission,
      insuranceInformation,
      emergencyContact,
      roomPreferences,
    });

    // Save the new patient to the database
    await newPatient.save();

    // Send response
    res
      .status(201)
      .json({ message: "Patient admitted successfully", patient: newPatient });
  } catch (error) {
    // Handle errors
    next(error);
  }
};

export const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find();
    res.status(200).json({ success: true, patients });
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  }
};

// Controller function to fetch a single patient by ID
export const getPatientByName = async (req, res, next) => {
  const { name } = req.params;
  try {
    const patient = await Patient.findOne({ name });
    if (!patient) {
      return next(errorHandler(404, "Patient not found"));
    }
    res.status(200).json({ success: true, patient });
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  }
};

// Controller function to update a patient by ID
export const updatePatientById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedPatient) {
      return next(errorHandler(404, "Patient not found"));
    }
    res.status(200).json({ success: true, patient: updatedPatient });
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  }
};

// Controller function to delete a patient by ID
export const deletePatientById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const deletedPatient = await Patient.findByIdAndDelete(id);
    if (!deletedPatient) {
      return next(errorHandler(404, "Patient not found"));
    }
    res
      .status(200)
      .json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  }
};

export const downloadPDF = async (req, res, next) => {
  const patientID = req.body.patientIDPDF;

  try {
    const patient = await Patient.findById(patientID);
    if (!patient) {
      return next(errorHandler(404, "Patient not found"));
    }
    const Patientbed = await Patient.findOne({ _id: patientID }).populate(
      'bed',
      'number'
    );

    if (Patientbed.bed) {
      console.log("Patient Bed Number:", Patientbed.bed.number);
    } else {
      console.log("Patient has no assigned bed.");
    }
    const name = patient.name;
    const gender = patient.gender;
    const contactEmail = patient.contactEmail;
    const contactPhone = patient.contactPhone;
    const createdAt = patient.createdAt;
    const dateOfBirth = patient.dateOfBirth;
    const address = patient.address;
    const identification = patient.identification;
    const emergencyName = patient.emergencyContact.name;
    const emergencyPhoneNumber = patient.emergencyContact.phoneNumber;
    const ward = patient.roomPreferences;
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Patient Registration Report</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h1, h2 {
                margin-bottom: 10px;
                color: #333;
            }
            p {
                margin-bottom: 5px;
                color: #666;
            }
            .section {
                margin-bottom: 20px;
            }
            .patient-picture {
                width: 200px;
                height: auto;
                border: 1px solid #ccc;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Patient Medical Report</h1>
        </div>
        <div class="section">
            <h2>Personal Information</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Gender:</strong> ${gender}</p>
            <p><strong>Date of Birth:</strong> ${dateOfBirth}</p>
            <p><strong>Contact Email:</strong> ${contactEmail}</p>
            <p><strong>Contact Phone:</strong> ${contactPhone}</p>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Identification:</strong> ${identification}</p>
        </div>
        <div class="section">
            <h2>Emergency Contact Information</h2>
            <p><strong>Name:</strong> ${emergencyName}</p>
            <p><strong>Phone Number:</strong> ${emergencyPhoneNumber}</p>
        </div>
        <div class="section">
            <h2>Ward Information</h2>
            <p><strong>Room Preference:</strong> ${ward}</p>
        </div>
    </body>
    </html>
    
`;

    const pdfBuffer = await generatePDFFromHtml(htmlContent);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

