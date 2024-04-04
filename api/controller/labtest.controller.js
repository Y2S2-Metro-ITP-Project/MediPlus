import LabTest from "../models/labtest.model.js";
import { errorHandler } from "../utils/error.js";

//GET ALL LAB TEST TYPES
export const getLabTests = async (req, res) => {
  try {
    const labtests = await LabTest.find({});
    res.status(200).json(labtests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET UNIQUE LAB TEST
export const getLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const labtest = await LabTest.findById({ id });
    res.status(200).json(labtest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//CREATE LAB TEST
export const createLabTest = async (req, res) => {
  const { name, sampleType, sampleVolume, completionTime, price } = req.body;

  if (
    !name ||
    !sampleType ||
    !sampleVolume ||
    !completionTime ||
    !price ||
    name === "" ||
    sampleType === "" ||
    completionTime === "" ||
    price === "" ||
    sampleVolume === ""
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newlabtest = new LabTest({
    name,
    sampleType,
    sampleVolume,
    completionTime,
    price,
  });
  try {
    await newlabtest.save();
    res.json({ message: "registered new test succefully" , newlabtest});
   
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATE EXISTING LAB TEST

export const updateLabTest = async (req, res, next) => {
  if (!req.user.isLabTech || !req.user.isAdmin) {
    return next(
      errorHandler(403, "You are not allowed to modify these resources")
    );
  }
  try {
    const { id } = req.params;

    const labtest = await LabTest.findByIdAndUpdate(id, req.body);

    if (!labtest) {
      return res.status(404).json({ message: "lab test not found" });
    }

    const updatedLabTest = await LabTest.findById(id);
    res.status(200).json({ updatedLabTest });
  } catch (error) {
    res.status(500).json({ message: "lab test not found" });
  }
};

//DELETE EXISTING LAB TEST

export const deleteLabTest = async (req, res) => {
  try {
    const { id } = req.params;

    const labtest = await LabTest.findByIdAndDelete(id);

    if (!labtest) {
      return res.status(404).json({ message: "lab test not found" });
    }

    res.status(200).json({ message: "Lab test deleted succesfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// module.exports = {
//   getLabTests,
//   getLabTest,
//   createLabTest,
//   updateLabTest,
//   deleteLabTest,
// };
