import Prescription from "../models/prescription.model.js";
import { errorHandler } from "../utils/error.js";
import generatePdfFromHtml from "../utils/PatientPDF.js";
export const addPrescription = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }
  const patientId = req.body.patientId;
  const doctorId = req.body.DoctorId;
  const medicine = req.body.formData.medicine;
  const dosage = req.body.formData.dosageAmount;
  const route = req.body.formData.route;
  const duration = req.body.formData.noOfDays;
  const frequency = req.body.formData.frequency;
  const foodRelation = req.body.formData.foodRelation;
  const instructions = req.body.formData.instructions;
  const dosageType = req.body.formData.dosageType;
  console.log(req.body);
  if (
    !patientId ||
    !doctorId ||
    !medicine ||
    !dosage ||
    !route ||
    !duration ||
    !frequency ||
    !foodRelation ||
    !instructions ||
    !dosageType
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (duration < 1) {
    return next(errorHandler(400, "Duration should be atleast 1"));
  }
  if (dosage < 1) {
    return next(errorHandler(400, "Dosage should be atleast 1"));
  }
  if (frequency < 1) {
    return next(errorHandler(400, "Frequency should be atleast 1"));
  }
  try {
    const newPrescription = new Prescription({
      patientId,
      doctorId,
      medicine,
      dosage,
      dosageType,
      route,
      frequency,
      duration,
      foodRelation,
      instructions,
    });
    console.log(newPrescription);
    await newPrescription.save();
    res.status(201).json({ message: "Prescription added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrescription = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }
  try {
    const patientID = req.params.patientId;
    const prescriptions = await Prescription.find({
      patientId: patientID,
    }).populate({
      path: "doctorId",
      select: "username",
    });
    res.status(200).json({ prescriptions});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePrescription = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }
  try {
    await Prescription.findByIdAndDelete(req.params.prescriptionId);
    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadPDFPrescription = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }

  const selectedDate= req.body.selectedDate.value;
  const isoDate = new Date(selectedDate).toISOString();

  // Extract year, month, and day from the ISODate
  const year = new Date(isoDate).getFullYear();
  const month = new Date(isoDate).getMonth() + 1; // Months are 0-indexed in JavaScript, so add 1
  const day = new Date(isoDate).getDate();
  const prescriptions = await Prescription.find({
    patientId:req.body.patientId,
    date: { $gte: new Date(year, month - 1, day), $lt: new Date(year, month - 1, day + 1) },
  }).populate('doctorId', 'username');
   try {
      let htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <title>Patient Prescription Report</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      margin: 20px;
                  }
                  h1, h2 {
                      margin-bottom: 10px;
                      color: #333;
                      text-align: center; /* Center the headings */
                  }
                  p {
                      margin-bottom: 5px;
                      color: #666;
                  }
                  .section {
                      margin-bottom: 20px;
                  }
                  .patient-picture {
                      width: 200px;
                      height: auto;
                      border: 1px solid #ccc;
                      margin: 0 auto; /* Center the picture */
                      display: block; /* Ensure the picture is displayed as a block element */
                  }
              </style>
          </head>
          <body>
              <div class="header">
                  <h1>Patient Precription Report</h1>
              </div>
          `;
  
      prescriptions.forEach((prescription) => {
        const {
          date,
          medicine,
          dosage,
          dosageType,
          route,
          frequency,
          duration,
          foodRelation,
          instructions,
          doctorId: { username },
        } = prescription;
  
        const formattedDate = new Date(date).toLocaleString();
  
        // Add the vital sign information to the HTML content
        htmlContent += `
              <div class="section">
                  <h2>Date: ${formattedDate}</h2>
                  <h2>Doctor who Precribed: ${username}</h2>
                  <p><strong>Medicine:</strong> ${medicine} </p>
                  <p><strong>Dosage:</strong> ${dosage}</p>
                  <p><strong>Dosage Type:</strong> ${dosageType}</p>
                  <p><strong>Route:</strong> ${route} MG/DL</p>
                  <p><strong>Frequency:</strong>${frequency} Times per Day</p>
                  <p><strong>Duration:</strong> ${duration} Days</p>
                  <p><strong>Food Realation:</strong> ${foodRelation}</p>
                  <p><strong>Instructions:</strong> ${instructions}</p>
              </div>`;
      });
  
      // Close the HTML content
      htmlContent += `
          </body>
          </html>`;
  
      const pdfBuffer = await generatePdfFromHtml(htmlContent);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length,
      });
      res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}