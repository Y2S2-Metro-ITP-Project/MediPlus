import ward from "../models/ward.model.js";
import { errorHandler } from "../utils/error.js";
export const addWard = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isHeadNurse
  ) {
    return res
      .status(401)
      .json({ message: "You are not authorized to perform this operation" });
  }
  const {
    doctorId,
    doctorName,
    nurseId,
    nurseName,
    WardName,
    WardType,
    WardCapacity,
  } = req.body;
  const newWard = new ward({
    doctorId,
    doctorName,
    nurseId,
    nurseName,
    WardName,
    WardType,
    WardCapacity,
  });
  try {
    await newWard.save();
    res.status(200).json(newWard);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWard = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isHeadNurse &&
    !req.user.isReceptionist
  ) {
    return res
      .status(401)
      .json({ message: "You are not authorized to perform this operation" });
  }
  try {
    const wards = await ward.find().populate({
      path: "beds",
      populate: { path: "patient" },
    });
    res.status(200).json(wards);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWard = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isHeadNurse
  ) {
    return res
      .status(401)
      .json({ message: "You are not authorized to perform this operation" });
  }
  const { wardId } = req.params;
  try {
    // Find the ward by ID and delete it
    const deletedWard = await ward.findByIdAndDelete(wardId);

    // Delete the associated beds
    if (deletedWard && deletedWard.beds.length > 0) {
      await Bed.deleteMany({ _id: { $in: deletedWard.beds } });
    }

    res.status(200).json({ success: true, deletedWard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWard = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isHeadNurse
  ) {
    return res
      .status(401)
      .json({ message: "You are not authorized to perform this operation" });
  }
  const { wardId } = req.params;
  try {
    const updatedWard = await ward.findByIdAndUpdate(
      wardId,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({ success: true, updatedWard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorWard = async (req, res) => {
    if (!req.user.isDoctor) {
        return res
        .status(401)
        .json({ message: "You are not authorized to perform this operation" });
    }
    const { doctorId } = req.params;
    try {
        const wards = await ward.find({
            doctorId: doctorId,
        }).populate({
            path: "beds",
            populate: { path: "patient" },
          });
        res.status(200).json(wards);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getWardID = async (req, res) => {
    if (
        !req.user.isAdmin &&
        !req.user.isDoctor &&
        !req.user.isNurse &&
        !req.user.isHeadNurse &&
        !req.user.isReceptionist
    ) {
        return res
        .status(401)
        .json({ message: "You are not authorized to perform this operation" });
    }
    try {
        const wardId=req.params.wardId;
        console.log(wardId);
        const ward1 = await ward.findById(wardId).populate({
            path: "beds",
            populate: { path: "patient" },
          });;
        res.status(200).json(ward1);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}