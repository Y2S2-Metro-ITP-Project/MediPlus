import Sample from "../models/sample.model.js";

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
