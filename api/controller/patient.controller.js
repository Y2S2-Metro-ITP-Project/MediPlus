import Patient from "../models/patient.model.js";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/email.js";
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
      phone: emergencyPhoneNumber,
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
  await sendEmail({
    to: contactEmail,
    subject: "Welcome to Ismails Pvt Hospital!",
    text: `Dear ${name},\n\nYour account has been created successfully. Here are your login credentials:\n\nEmail: ${contactEmail}\nPassword: ${password}\n\nPlease keep this information secure.\n\nBest regards,\nThe Hospital Team`,
  });
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
