import Specialization from "../models/specialization.model.js";

// Controller function to add a new specialization
export const addSpecialization = async (req, res) => {
    try {
      const { name, description } = req.body;
  
      // Check if the specialization with the same name already exists
      const existingSpecialization = await Specialization.findOne({ name });
      if (existingSpecialization) {
        return res.status(400).json({ message: "Specialization with this name already exists" });
      }
  
      // Create a new specialization
      const newSpecialization = new Specialization({ name, description });
      await newSpecialization.save();
  
      res.status(201).json(newSpecialization);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Controller function to get all specializations
export const getSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.find();
    res.status(200).json(specializations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to update a specialization
export const updateSpecialization = async (req, res) => {
  try {
    const { specializationId } = req.params;
    const { name, description } = req.body;

    const updatedSpecialization = await Specialization.findByIdAndUpdate(
      specializationId,
      { name, description },
      { new: true }
    );

    if (!updatedSpecialization) {
      return res.status(404).json({ message: "Specialization not found" });
    }

    res.status(200).json(updatedSpecialization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to delete a specialization
export const deleteSpecialization = async (req, res) => {
  try {
    const { specializationId } = req.params;

    const deletedSpecialization = await Specialization.findByIdAndDelete(specializationId);

    if (!deletedSpecialization) {
      return res.status(404).json({ message: "Specialization not found" });
    }

    res.status(200).json({ message: "Specialization deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
