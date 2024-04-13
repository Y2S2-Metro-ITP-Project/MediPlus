import Doctor from "../models/doctor.model.js";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/email.js";

export const createDoctor = async (req, res, next) => {
  const {
    name,
    specialization,
    experience,
    contact,
    consultationFee,
    doctorPicture,
  } = req.body;
  const password = Math.random().toString(36).slice(-8);
  const hashPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({
    username:
      name.toLowerCase().split(" ").join("") +
      Math.random().toString(36).slice(-4),
    email: req.body.email,
    password: hashPassword,
    isDoctor: true,
    isUser: false,
  });
  try {
    await newUser.save();
  } catch (error) {
    return next(errorHandler(500, "Error occurred while saving the user"));
  }
  const newDoctor = new Doctor({
    name,
    specialization,
    experience,
    contact,
    consultationFee,
    doctorProfilePicture: doctorPicture,
    user: newUser._id,
  });
  if (
    !name ||
    name === "" ||
    !contact ||
    contact === "" ||
    !doctorPicture ||
    doctorPicture === ""
  ) {
    return next(errorHandler(400, "All fields are required"));
  }
  try {
    await newDoctor.save();
    res.status(201).json(newDoctor);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
  try {
    await sendEmail({
      to: req.body.email,
      subject: "Welcome to Ismails Pvt Hospital!",
      html: `
      <p>Dear Doctor,</p>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${req.body.email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please keep this information secure.</p>
      <p>Best regards,<br>The Ismails Pvt Hospital Team</p>
      <p>For any inquiries, please contact us at <strong> 0758 123 456</strong></p>
      <P>This is an auto-generated email. Please do not reply to this email.</p>
    `,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    next(error);
  }
};

export const updateDoctorById = async (req, res, next) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDoctor) {
      return next(errorHandler(404, "Doctor not found"));
    }
    res.status(200).json(updatedDoctor);
  } catch (error) {
    next(error);
  }
};

export const deleteDoctorById = async (req, res, next) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      return next(errorHandler(404, "Doctor not found"));
    }
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return next(errorHandler(404, "Doctor not found"));
    }
    res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
};

