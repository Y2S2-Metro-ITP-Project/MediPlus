import Appointment from "../models/appointment.model.js";
import { errorHandler } from "../utils/error.js";

export const createAppointment = async (req, res, next) => {
  const {
    type,
    doctorId,
    patientId,
    date,
    time,
    reason,
    wardno,
  } = req.body;

  if (
    !type ||
    !doctorId ||
    !patientId ||
    !date ||
    !time ||
    !reason ||
    !wardno
  ) {
    return next(errorHandler(400, "All fields are required"));
  }

  const newAppointment = new Appointment({
    type,
    doctorId,
    patientId,
    date,
    time,
    reason,
    wardno,
  });

  try {
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isReceptionist
  ) {
    return next(
      errorHandler(
        403,
        "You are not allowed to view all the appointments"
      )
    );
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;
    const appointments = await Appointment.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalAppointments = await Appointment.countDocuments();
    res.status(200).json({ appointments, totalAppointments });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isReceptionist) {
    return next(
      errorHandler(403, "You are not allowed to delete this appointment")
    );
  }

  try {
    await Appointment.findByIdAndDelete(req.params.appointmentId);
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const searchAppointments = async (req, res, next) => {
    try {
      const searchTerm = req.body.search;
      const appointments = await Appointment.find({
        $or: [
          { type: { $regex: new RegExp(searchTerm, "i") } },
          { reason: { $regex: new RegExp(searchTerm, "i") } },
        ],
      });
      if (!appointments || appointments.length === 0) {
        return next(errorHandler(404, "No appointments found with this search term"));
      }
      res.status(200).json(appointments);
    } catch (error) {
      next(error);
    }
  };

export const filterAppointments = async (req, res, next) => {
    if (
      !req.user.isAdmin &&
      !req.user.isDoctor &&
      !req.user.isReceptionist
    ) {
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
        case "tomorrow":
          startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() + 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(currentDate);
          endDate.setDate(currentDate.getDate() + 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "comingweek":
          startDate = new Date(currentDate);
          endDate = new Date(currentDate);
          endDate.setDate(currentDate.getDate() + 7);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "comingmonth":
          startDate = new Date(currentDate);
          endDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );
          break;
        default:
          break;
      }
  
      if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
      }
  
      const appointments = await Appointment.find(query);
      res.status(200).json(appointments);
    } catch (error) {
      next(error);
    }
  };
  