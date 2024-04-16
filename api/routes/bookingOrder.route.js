import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getBookingOrderData,
  deleteBookingOrderData,
  updateBookingOrderData,
  getBookingPatientOrder,
  confirmBookingOrderData,
  rejectBookingOrderData,
  fullOrderRejection,
  downloadPatientOrderData,
  downloadPatientOrderDateData,
  downloadDoctorOrderReport,
} from "../controller/bookingOrder.controller.js"; // Update the import to use BookingOrder controller
const router = express.Router();

router.get("/getBookingOrder", verifyToken, getBookingOrderData); // Update route name and controller function
router.delete(
  "/deleteBookingOrder/:id",
  verifyToken,
  deleteBookingOrderData // Update controller function
);
router.get(
  "/getBookingPatientOrder/:id",
  verifyToken,
  getBookingPatientOrder // Update controller function
);
router.post(
  "/confirmBookingOrder/:id",
  verifyToken,
  confirmBookingOrderData // Update controller function
);
router.get(
  "/rejectBookingOrder/:id",
  verifyToken,
  rejectBookingOrderData // Update controller function
);
router.get("/fullOrderRejection/:id", verifyToken, fullOrderRejection); // Update controller function
router.post("/downloadPatientOrder/:id", verifyToken, downloadPatientOrderData); // Update controller function
router.post(
  "/downloadPatientOrderDate/:id",
  verifyToken,
  downloadPatientOrderDateData
); // Update controller function
router.post(
  "/downloadDoctorOrderReport/:id",
  verifyToken,
  downloadDoctorOrderReport
); // Update controller function
export default router;
