import LabTest from "../models/labtest.model.js";
//import { errorHandler } from "../utils/error";

//GET ALL LAB TEST TYPES
const getLabTests = async (req, res) => {
  try {
    const labtests = await LabTest.find({});
    res.status(200).json(labtests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET UNIQUE LAB TEST
const getLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const labtest = await LabTest.findById({ id });
    res.status(200).json(labtest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//CREATE LAB TEST
const createLabTest = async (req, res) => {
  try {
    const labtest = await LabTest.create(req.body);
    res.status(200).json(labtest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATE EXISTING LAB TEST

const updateLabTest = async (req, res) => {
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

const deleteLabTest = async (req, res) => {
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

module.exports = {
  getLabTests,
  getLabTest,
  createLabTest,
  updateLabTest,
  deleteLabTest,
};
