import LabTest from "../models/labtest.model.js";
import { errorHandler } from "../utils/error.js";

//GET ALL LAB TEST TYPES
export const getLabTests = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isLabTech) {
    return next(
      errorHandler(403, "you are not allowed to access all lab tests")
    );
  }
  try {
    const labtests = await LabTest.find();

    res.status(200).json({ labtests });
  } catch (error) {
    next(error);
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

// PAGINATION GET TESTS API

export const paginatedLabTests = async (req, res, next) => {
  try {
    const page = req.query.page || 0;
    const limit = 9;

    const startIndex = (parseInt(page) - 1) * limit;
    const endIndex = page * limit;

    // if(endIndex < await LabTest.countDocuments()){
    //   labtests.next = {
    //     page : page + 1,
    //     limit : limit
    //   }
    // }

    // if (startIndex > 0){
    //   labtests.previous = {
    //     page: page -1,
    //     limit:  limit
    //   }
    // }

    const labtests = await LabTest.find({}).limit(limit).skip(startIndex);
    res.status(200).json(labtests);
  } catch (error) {
    next(error);
  }
};

//CREATE LAB TEST
export const createLabTest = async (req, res) => {
  const {
    name,
    sampleType,
    sampleVolume,
    completionTime,
    advice,
    description,
    price,
  } = req.body;

  if (
    !name ||
    !sampleType ||
    !sampleVolume ||
    !completionTime ||
    !price 
    
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newlabtest = new LabTest({
    name,
    sampleType,
    sampleVolume,
    completionTime,
    advice,
    description,
    price,
  });
  try {
    await newlabtest.save();
    res.json({ message: "registered new test succefully", newlabtest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATE EXISTING LAB TEST

export const updateLabTest = async (req, res, next) => {
  if (!req.user.isLabTech && !req.user.isAdmin) {
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

export const deleteLabTest = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isLabTech) {
    return next(errorHandler(403, "you are not allowed to delete this entry"));
  }

  try {
    const { id } = req.params;

    const labtest = await LabTest.findByIdAndDelete(id);

    if (!labtest) {
      return res.status(404).json({ message: "lab test not found" });
    }

    res.status(200).json({ message: "Lab test deleted succesfully" });
  } catch (error) {
    next(error);
  }
};

// MULTI FIELD SEARCH API

// export const searchMulti = async (req,res,next) => {

//   let data = await LabTest.find(
//     {
//       "$or":[
//         {name:{$regex: req.params.key}},
//         {sampleType:{$regex: req.params.key}},
//         {price:{$regex: req.params.key}},
//       ]
//     }
//   )

//   try {

//   } catch (error) {
//     next(error);
//   }
// }
