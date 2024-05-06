import Patient from "../models/patient.model.js";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/email.js";
import generatePdfFromHtml from "../utils/PatientPDF.js";
import generatePDFFromHtml from "../utils/BedPDF.js";
function generateRandomPassword(length) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[{]}|;:,<.>/?";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}
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
  if (!req.body.contactPhone.match(/^[0-9]+$/)) {
    return next(
      errorHandler(400, "Contact Phone Number must contain only numbers")
    );
  }
  if (req.body.contactPhone.length !== 10) {
    return next(
      errorHandler(400, "Contact Phone Number must be 10 characters")
    );
  }
  if (req.body.name < 7 || req.body.name > 50) {
    return next(errorHandler(400, "Name must be between 7 and 50 characters"));
  }
  if (!req.body.name.match(/^[a-zA-Z\s]+$/)) {
    return next(
      errorHandler(400, "Name must contain only alphabets and spaces")
    );
  }
  if (req.body.identification.length !== 12) {
    return next(errorHandler(400, "Identification must be 13 characters"));
  }
  if (!req.body.identification.match(/^[0-9]+$/)) {
    return next(errorHandler(400, "Identification must contain only numbers"));
  }
  if (req.body.dateOfBirth) {
    const dob = new Date(req.body.dateOfBirth);
    const minDate = new Date("1900-01-01");
    const maxDate = new Date();
    if (dob < minDate || dob > maxDate) {
      return next(errorHandler(400, "Invalid Date of Birth"));
    }
  }
  const password = generateRandomPassword(12);
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
    return next(errorHandler(500, "The email is already in use"));
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
        <li><strong>Email:</strong>${contactEmail}</li>
        <li><strong>Password:</strong>${password}</li>
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

export const getPatients = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isReceptionist &&
    !req.user.isDoctor &&
    !req.user.isPharmacist &&
    !req.user.isLabTechnician &&
    !req.user.isNurse
  ) {
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
    const patients = await Patient.find({ patientType: "Outpatient" })
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalUser = await Patient.countDocuments({
      patientType: "Outpatient",
    });
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUser = await Patient.countDocuments({
      createdAt: { $gte: oneMonthAgo },
      patientType: "Outpatient",
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
    const patientId = req.params.patientId;
    const patient = await Patient.findById(patientId);
    const patientName = patient.name;

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const userId = patient.user;
    const user = await User.findById(userId);
    const contactEmail = user.email;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Patient.findByIdAndDelete(patientId);
    await User.findByIdAndDelete(userId);

    res
      .status(200)
      .json({ message: "Patient and user accounts deleted successfully" });

    try {
      await sendEmail({
        to: contactEmail,
        subject: "Welcome to Ismails Pvt Hospital!",
        html: `
          <p>Dear ${patientName},</p>
          <p>Your account has been deleted successfully</p>
          <p>Best regards,<br>The MediPlus Team</p>
          <p>For any inquiries, please contact us at <strong> 0758 123 456</strong></p>
          <P>This is an auto-generated email. Please do not reply to this email.</p>
        `,
      });
    } catch (error) {
      console.log(error);
    }
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
      $and: [
        {
          $or: [
            {
              name: { $regex: new RegExp(searchTerm, "i") },
            },
          ],
        },
        {
          patientType: "Outpatient",
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
      case "lastweek":
        startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 7);
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
      case "latest":
        query.createdAt = { $exists: true };
        break;
      case "oldest":
        query.createdAt = { $exists: true };
        break;
      default:
        break;
    }

    if (startDate && endDate) {
      query.admissionDate = { $gte: startDate, $lte: endDate };
    }
    query.patientType = "Outpatient";

    const patients = await Patient.find(query);

    res.status(200).json(patients);
  } catch (error) {
    next(error);
  }
};

export const updateOutPatient = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isReceptionist) {
    return next(
      errorHandler(403, "You are not allowed to access this resource")
    );
  }
  if (req.body.name) {
    if (req.body.name < 7 || req.body.name > 50) {
      return next(
        errorHandler(400, "Name must be between 7 and 50 characters")
      );
    }
    if (!req.body.name.match(/^[a-zA-Z\s]+$/)) {
      return next(
        errorHandler(400, "Name must contain only alphabets and spaces")
      );
    }
  }
  if (req.body.identification) {
    if (req.body.identification.length !== 12) {
      return next(errorHandler(400, "Identification must be 13 characters"));
    }
    if (!req.body.identification.match(/^[0-9]+$/)) {
      return next(
        errorHandler(400, "Identification must contain only numbers")
      );
    }
  }
  if (req.body.emergencyPhoneNumber) {
    if (req.body.emergencyPhoneNumber.length !== 10) {
      return next(
        errorHandler(400, "Emergency Phone Number must be 10 characters")
      );
    }
    if (!req.body.emergencyPhoneNumber.match(/^[0-9]+$/)) {
      return next(
        errorHandler(400, "Emergency Phone Number must contain only numbers")
      );
    }
  }
  if (req.body.contactPhone) {
    if (req.body.contactPhone.length !== 10) {
      return next(
        errorHandler(400, "Contact Phone Number must be 10 characters")
      );
    }
    if (!req.body.contactPhone.match(/^[0-9]+$/)) {
      return next(
        errorHandler(400, "Contact Phone Number must contain only numbers")
      );
    }
  }
  if (req.body.contactEmail) {
    if (!req.body.contactEmail.match(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)) {
      return next(errorHandler(400, "Invalid Email"));
    }
  }
  if (req.body.address) {
    if (req.body.address.length < 10 || req.body.address.length > 100) {
      return next(
        errorHandler(400, "Address must be between 10 and 100 characters")
      );
    }
  }
  if (req.body.dateOfBirth) {
    const dob = new Date(req.body.dateOfBirth);
    const minDate = new Date("1900-01-01");
    const maxDate = new Date();
    if (dob < minDate || dob > maxDate) {
      return next(errorHandler(400, "Invalid Date of Birth"));
    }
  }
  console.log(req.body);
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.patientID,
      {
        $set: {
          name: req.body.name,
          identification: req.body.identification,
          "emergencyContact.name": req.body.emergencyName,
          "emergencyContact.phoneNumber": req.body.emergencyPhoneNumber,
          contactPhone: req.body.contactPhone,
          contactEmail: req.body.contactEmail,
          address: req.body.address,
          dateOfBirth: req.body.dateOfBirth,
          patientProfilePicture: req.body.patientPicture,
        },
      },
      { new: true }
    );
    if (!patient) {
      return next(errorHandler(404, "No patient found with this ID"));
    }
    res.status(200).json(patient);
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
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
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
                text-align: center; /* Center the headings */
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
                margin: 0 auto; /* Center the picture */
                display: block; /* Ensure the picture is displayed as a block element */
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
            <p><strong>Age:</strong> ${age}</p>
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

export const getPatient = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isReceptionist &&
    !req.user.isDoctor &&
    !req.user.isPharmacist
  ) {
    return next(
      errorHandler(403, "You are not allowed to access this resource")
    );
  }
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) {
      return next(errorHandler(404, "No patient found with this ID"));
    }
    res.status(200).json(patient);
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
    const patients = await Patient.find({ roomPreferences: { $exists: true, $ne: "" } });
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

export const getPatientsforBooking = async (req, res, next) => {
  try {
    const patients = await Patient.find(); // Retrieve all patients from the database
    res.status(200).json(patients); // Send the retrieved patients as JSON response
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getPatientByUser = async (req, res, next) => {
  const userId = req.params.userId;
  console.log(userId);
  try {
    const patient = await Patient.findOne({ user: userId });
    console.log(patient);
    if (!patient) {
      return next(errorHandler(404, "No patient found for this user"));
    }
    res.status(200).json(patient);
  } catch (error) {
    next(error);
  }
};

export const updatePatientDetails = async (req, res, next) => {
  // Validate the request body
  const { patientId, name, contactEmail, contactPhone, address } = req.body;

  if (!patientId || !name || !contactEmail || !contactPhone || !address) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    // Find the patient by ID and update the specified fields
    const patient = await Patient.findByIdAndUpdate(
      patientId,
      {
        $set: {
          name,
          contactEmail,
          contactPhone,
          address,
        },
      },
      { new: true } // Return the updated patient document
    );

    // If patient is not found, return a 404 error
    if (!patient) {
      return next(errorHandler(404, "No patient found with this ID"));
    }

    // Return the updated patient details
    res.status(200).json(patient);
  } catch (error) {
    // Handle any errors that occur during the update process
    next(error);
  }
};




