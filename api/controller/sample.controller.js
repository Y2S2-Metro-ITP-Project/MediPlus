import Sample from "../models/sample.model.js";
import { errorHandler } from "../utils/error.js";

//GET A SAMPLES

export const getSamples = async (req, res) => {
  try {
    const samples = await Sample.find({});
    res.status(200).json(samples);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET UNIQUE LAB TEST
export const getSample = async (req, res) => {
  try {
    const { id } = req.params;
    const sample = await Sample.findById({ id });
    res.status(200).json(sample);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//REGISTERING A SAMPLE

export const registerSample = async (req, res) => {
  const { type, testsOrderedOnSample, patientId, collectionEmployeeId } =
    req.body;

  if (
    !type ||
    !testsOrderedOnSample ||
    !patientId ||
    !collectionEmployeeId ||
    type === " " ||
    patientId === " " ||
    collectionEmployeeId === " " ||
    testsOrderedOnSample === " "
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newSample = new Sample({
    type,
    testsOrderedOnSample,
    patientId,
    collectionEmployeeId,
  });

  try {
    await newSample.save();
    res.status(200).json(newSample);
   
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// LOG SAMPLE/S 
//========================================================================================================================
  
  export const logSample = async(req, res, next) => {

    if (
      !req.user.isAdmin &&
      !req.user.isDoctor &&
      !req.user.isNurse &&
      !req.user.isReceptionist &&
      !req.user.isHeadNurse &&
      !req.user.isLabTech
    ) {
      return res
        .status(403)
        .json({ message: "You are not allowed to access these resources" });
    }

    const collectionEmployeeId = req.params.id;
    const types = req.body.formData.types; 
    const testOrderId = req.body.formData.testOrderId;
    const testId = req.body.formData.testId;
    const patientId = req.body.formData.patientId;
    const sampleStatus = req.body.formData.sampleStatus;
    const AssignedStorage = req.body.formData.AssignedStorage;

    
    if(
      !collectionEmployeeId ||
      !types ||
      !testOrderId ||
      !testId ||
      !patientId 
    ){
        return res.status(400).json({message: "Please fill out all fields"});
      }

      const uniqueSampleTypesSet = new Set(types);
      const uniqueSampleTypesArray = [...uniqueSampleTypesSet];

    try {

    const newSamples = uniqueSampleTypesArray.map((sampleType) =>{

       return  new Sample({
          sampleType, 
          testOrderId,
          testId,
          patientId,
          collectionEmployeeId,
          sampleStatus,
          AssignedStorage, 
        });
    });

    await Sample.insertMany(newSamples);
    res.status(201).json({message: ` ${sampleObjects.length} sample object(s) created succesfully`});
      
      
    } catch (error) {
      res.status(500).json({message: error.message});
    }

  }


//UPDATE EXISTING SAMPLE

export const updateSample = async (req, res) => {
  try {
    const { id } = req.params;

    const sample = await Sample.findByIdAndUpdate(id, req.body);

    if (!sample) {
      return res.status(404).json({ message: "sample not found" });
    }

    const updatedSample = await Sample.findById(id);
    res.status(200).json({ updatedSample });
  } catch (error) {
    res.status(500).json({ message: " sample not found" });
  }
};

//    DELETE EXISTING SAMPLE

export const deleteSample = async (req, res) => {
  // if(!req.user.isAdmin && !req.user.islabTechnician){
  //     return res.status(403).json({message: " you are not allowed to delete this sample"})
  // }

  try {
    const { id } = req.params;

    const sample = await Sample.findByIdAndDelete(id);

    if (!sample) {
      return res.status(404).json({ message: "sample not found" });
    }

    res.status(200).json({ message: "sample deleted succesfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
