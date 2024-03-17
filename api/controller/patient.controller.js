import Patient from '../models/patient.model.js';
import { errorHandler } from '../utils/error.js';

export const register = async (req, res) => {
    console.log(req.body);
    const {patientName,phone,profilePicture,patientType}=req.body;
    const newPatient=new Patient({patientName,patientPhone:phone,patientProfilePicture:profilePicture,patientType});
    try{
        await newPatient.save();
        res.status(201).json(newPatient);
    }catch(error){
        res.status(500).json(error);
    }
}

export const getPatients = async (req, res) => {
    if (!req.user.isAdmin) {
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
        res
          .status(200)
          .json({patients, totalUser, lastMonthUser });
      } catch (error) {
        next(error);
      }
}

export const deletePatient = async (req, res) => {
    if (!req.user.isAdmin) {
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
}