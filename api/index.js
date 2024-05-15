import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import inquiryRoutes from "./routes/inquiry.route.js";
import patientRoutes from "./routes/patient.route.js";
import inventoryRoutes from "./routes/inventory.route.js";
import suplierroutes from "./routes/supplier.route.js";
import vitalRoutes from "./routes/vitals.route.js";
import cookieParser from "cookie-parser";
import empleaveRoutes from "./routes/empleave.route.js";
import bookingRoutes  from "./routes/booking.route.js";
import employeeRoutes from "./routes/employee.route.js"
import prescriptionRoutes from "./routes/prescription.route.js";
import dieseaseRoutes from "./routes/diesease.route.js";
import diagnosisRoutes from "./routes/diagnosis.route.js";
import PrescriptionOrderRoutes from "./routes/PrecriptionOrder.route.js";
import paymentOrderRoutes from "./routes/paymentOrder.route.js";
import userBookingRoutes from "./routes/userBooking.route.js";
import "./utils/jobs/booking.job.js";
import bedRoutes from "./routes/bed.route.js";

import roomRoutes from "./routes/room.route.js";
import slotRoutes from "./routes/slot.route.js";
import slotBookRoutes from "./routes/slotBooking.route.js";

import wardRoutes from "./routes/ward.route.js";
import Supplier from "./models/Supplier.model.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to database");
  })
  .catch(() => {
    console.log("Connection failed");
  });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/leaves", empleaveRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/vital", vitalRoutes);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/disease", dieseaseRoutes);
app.use("/api/diagnosis", diagnosisRoutes);
app.use("/api/prescriptionOrder", PrescriptionOrderRoutes);
app.use("/api/paymentOrder", paymentOrderRoutes);
app.use("/api/userBooking", userBookingRoutes);
app.use('/api/bed', bedRoutes);
app.use('/api/slot', slotRoutes);
app.use('/api/slotBooking', slotBookRoutes);
app.use('/api/ward', wardRoutes);
app.use("/api/supplier", suplierroutes);
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
