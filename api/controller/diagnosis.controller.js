import PatientDiagnosis from "../models/patientDiagnosis.model.js";


export const addDiagnosisData = async (req, res) => {
    if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isNurse && !req.user.isPharmacist && !req.user.isReceptionist && !req.user.isHeadNurse) {
        return res
            .status(403)
            .json({ message: "You are not allowed to access these resources" });
    }
    try {
        const patientId = req.body.patientId;
        const doctorId = req.body.doctorId;
        const diagnosis = req.body.formData.disease;
        const type = req.body.formData.type;
        const ICD10 = req.body.formData.ICD10;
        const level= req.body.formData.category;
        const Symptoms = req.body.formData.instructions;
        const newDiagnosis = new PatientDiagnosis({
            patientId,
            doctorId,
            diagnosis,
            type,
            ICD10,
            Symptoms,
            level,
        });
        await newDiagnosis.save();
        res.status(201).json({ message: "Diagnosis added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getDiagnosisData = async (req, res) => {
    if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isNurse && !req.user.isPharmacist && !req.user.isReceptionist && !req.user.isHeadNurse) {
        return res
            .status(403)
            .json({ message: "You are not allowed to access these resources" });
    }
    try {
        const patientID=req.params.patientId;
        const diagnosis = await PatientDiagnosis.find({patientID:patientID}).populate({
            path: "doctorId",
            select: "username",
        });
        res.status(200).json({ diagnosis });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteDiagnosisData = async (req, res) => {
    if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isNurse && !req.user.isPharmacist && !req.user.isReceptionist && !req.user.isHeadNurse) {
        return res
            .status(403)
            .json({ message: "You are not allowed to access these resources" });
    }
    try {
        await PatientDiagnosis.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Diagnosis deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}