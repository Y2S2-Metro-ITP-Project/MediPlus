import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
    getBookingsForUser,
} from "../controller/userBooking.controller.js";

const router = express.Router();

router.get("/bookings/:patientId", verifyToken, getBookingsForUser);


export default router;
