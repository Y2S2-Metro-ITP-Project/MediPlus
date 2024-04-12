import Disease from "../models/diesease.model.js";



export const addDiseaseData = async (req, res) => {
    if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isNurse && !req.user.isPharmacist && !req.user.isReceptionist && !req.user.isHeadNurse) {
        return res
            .status(403)
            .json({ message: "You are not allowed to access these resources" });
    }
    try {
        const { name, description, symptoms, treatment, ICD10 } = req.body;
        const newDisease = new Disease({
            name,
            description,
            symptoms,
            treatment,
            ICD10,
        });
        await newDisease.save();
        res.status(201).json({ message: "Disease added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}



export const getDiseaseData = async (req, res) => {
    if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isNurse && !req.user.isPharmacist && !req.user.isReceptionist && !req.user.isHeadNurse) {
        return res
            .status(403)
            .json({ message: "You are not allowed to access these resources" });
    }
    try {
        const diseases = await Disease.find();
        res.status(200).json({ diseases });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteDiseaseData = async (req, res) => {
    if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isNurse && !req.user.isPharmacist && !req.user.isReceptionist && !req.user.isHeadNurse) {
        return res
            .status(403)
            .json({ message: "You are not allowed to access these resources" });
    }
    try {
        await Disease.findByIdAndDelete(req.params.diseaseId);
        res.status(200).json({ message: "Disease deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateDiseaseData = async (req, res) => {
    if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isNurse && !req.user.isPharmacist && !req.user.isReceptionist && !req.user.isHeadNurse) {
        return res
            .status(403)
            .json({ message: "You are not allowed to access these resources" });
    }
    try {
        const updatedDisease = await Disease.findByIdAndUpdate(
            req.params.diseaseId,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).json(updatedDisease);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}