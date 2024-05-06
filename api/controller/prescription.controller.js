import Patient from "../models/patient.model.js";
import PrescriptionOrder from "../models/PrecriptionOrder.model.js";
import Prescription from "../models/prescription.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import generatePdfFromHtml from "../utils/PatientPDF.js";
import Inventory from "../models/inventory.model.js";
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
  const itemId = req.body.formData.itemId;
  const medicine = req.body.formData.medicine;
  const dosage = req.body.formData.dosageAmount;
  const route = req.body.formData.route;
  const duration = req.body.formData.noOfDays;
  const frequency = req.body.formData.frequency;
  const foodRelation = req.body.formData.foodRelation;
  const instructions = req.body.formData.instructions;
  const dosageType = req.body.formData.dosageType;
  if (
    !patientId ||
    !itemId ||
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
      itemId,
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
    const orders = await PrescriptionOrder.find({ patientId, doctorId });

    let order;

    for (const existingOrder of orders) {
      if (existingOrder.status === "Pending") {
        order = existingOrder;
        break;
      }
    }

    if (!order) {
      order = new PrescriptionOrder({
        patientId,
        doctorId,
        prescriptions: [newPrescription._id],
      });
    } else {
      order.prescriptions.push(newPrescription._id);
    }

    await order.save();
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
    res.status(200).json({ prescriptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePrescription = async (req, res, next) => {
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
    const prescriptionId = req.params.prescriptionId;
    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    await Prescription.findByIdAndDelete(prescriptionId);
    await PrescriptionOrder.updateMany(
      { prescriptions: prescriptionId },
      { $pull: { prescriptions: prescriptionId } }
    );
    await PrescriptionOrder.deleteMany({ prescriptions: { $size: 0 } });

    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const downloadPDFPrescription = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }

  const selectedDate = req.body.selectedDate.value;
  const isoDate = new Date(selectedDate).toISOString();

  // Extract year, month, and day from the ISODate
  const year = new Date(isoDate).getFullYear();
  const month = new Date(isoDate).getMonth() + 1; // Months are 0-indexed in JavaScript, so add 1
  const day = new Date(isoDate).getDate();
  const prescriptions = await Prescription.find({
    patientId: req.body.patientId,
    date: {
      $gte: new Date(year, month - 1, day),
      $lt: new Date(year, month - 1, day + 1),
    },
  }).populate("doctorId", "username");
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
                  <p><strong>Route:</strong> ${route}</p>
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
};

export const getPatientPrescription = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }
  try {
    const userId = req.params.UserId;
    const patient = await Patient.findOne({ user: userId }).select("_id");
    if (!patient) {
      return res
        .status(404)
        .json({ message: "Patient not found for the given user ID." });
    }
    const patientId = patient._id;
    const prescriptions = await Prescription.find({
      patientId: patientId,
    }).populate({
      path: "doctorId",
      select: "username email password",
    });
    const totalPrescriptions = prescriptions.length;
    const totalLastMonthPrescriptions = await Prescription.find({
      patientId: patientId,
      date: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    }).countDocuments();
    res
      .status(200)
      .json({ prescriptions, totalPrescriptions, totalLastMonthPrescriptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadPatientPDFPrescription = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }

  const selectedDate = req.body.selectedDate.value;
  const isoDate = new Date(selectedDate).toISOString();

  // Extract year, month, and day from the ISODate
  const year = new Date(isoDate).getFullYear();
  const month = new Date(isoDate).getMonth() + 1; // Months are 0-indexed in JavaScript, so add 1
  const day = new Date(isoDate).getDate();
  const userId = req.params.Id;
  const patient = await Patient.findOne({ user: userId }).select("_id");
  const prescriptions = await Prescription.find({
    patientId: patient._id,
    date: {
      $gte: new Date(year, month - 1, day),
      $lt: new Date(year, month - 1, day + 1),
    },
  }).populate("doctorId", "username");

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
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h1, h2 {
                margin-bottom: 10px;
                color: #333;
                text-align: center;
            }
            .section {
                margin-bottom: 20px;
                border: 1px solid #ccc;
                padding: 15px;
                border-radius: 10px;
            }
            .section h2 {
                color: #555;
                margin-bottom: 10px;
            }
            .section p {
                color: #666;
                margin-bottom: 5px;
            }
            .section p strong {
                color: #333;
            }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Patient Precription Report</h1>
          </div>
          <h2>Date: ${req.body.selectedDate.value}</h2>
    `;

    let prevDate = null;
    let prevDoctor = null;

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

      // Check if the current date and doctor are the same as the previous one
      htmlContent += `
            <div class="section">
            <h2>Doctor who Prescribed: ${username}</h2>`;

      // Add the vital sign information to the HTML content
      htmlContent += `
                <p><strong>Medicine:</strong> ${medicine} </p>
                <p><strong>Dosage:</strong> ${dosage}</p>
                <p><strong>Dosage Type:</strong> ${dosageType}</p>
                <p><strong>Route:</strong> ${route}</p>
                <p><strong>Frequency:</strong>${frequency} Times per Day</p>
                <p><strong>Duration:</strong> ${duration} Days</p>
                <p><strong>Food Relation:</strong> ${foodRelation}</p>
                <p><strong>Instructions:</strong> ${instructions}</p>
            </div>`;
      // Update the previous date and doctor
      prevDate = formattedDate;
      prevDoctor = username;
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
};

export const downloadPatientDocotorPDFPrescription = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }
  const userId = req.params.Id;
  const name = req.body.selectedDoctor.value;
  const patient = await Patient.findOne({ user: userId }).select("_id");
  const doctor = await User.findOne({ username: name }).select("_id");
  console.log(doctor._id);
  const prescriptions = await Prescription.find({
    patientId: patient._id,
    doctorId: doctor._id,
  }).populate("doctorId", "username");
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
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h1, h2 {
                margin-bottom: 10px;
                color: #333;
                text-align: center;
            }
            .section {
                margin-bottom: 20px;
                border: 1px solid #ccc;
                padding: 15px;
                border-radius: 10px;
            }
            .section h2 {
                color: #555;
                margin-bottom: 10px;
            }
            .section p {
                color: #666;
                margin-bottom: 5px;
            }
            .section p strong {
                color: #333;
            }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Patient Precription Report</h1>
          </div>
          <h2>Doctor who Prescribed: ${req.body.selectedDoctor.value}</h2>
    `;

    let prevDate = null;
    let prevDoctor = null;

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

      // Check if the current date and doctor are the same as the previous one
      if (formattedDate !== prevDate) {
        htmlContent += `
            <div class="section">
            <h2>Date: ${formattedDate}</h2>`;

        // Add the vital sign information to the HTML content
        htmlContent += `
                <p><strong>Medicine:</strong> ${medicine} </p>
                <p><strong>Dosage:</strong> ${dosage}</p>
                <p><strong>Dosage Type:</strong> ${dosageType}</p>
                <p><strong>Route:</strong> ${route}</p>
                <p><strong>Frequency:</strong>${frequency} Times per Day</p>
                <p><strong>Duration:</strong> ${duration} Days</p>
                <p><strong>Food Relation:</strong> ${foodRelation}</p>
                <p><strong>Instructions:</strong> ${instructions}</p>
            </div>`;
      }
      // Update the previous date and doctor
      prevDate = formattedDate;
      prevDoctor = username;
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
};

export const getPrescriptiondata = async (req, res) => {
  if (req.user.isPharmacist) {
    try {
      const prescription = await Prescription.findById(req.params.id)
        .populate("patientId")
        .populate("doctorId")
        .populate("itemId");
      res.status(200).json({ prescription });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getPrescriptionOrdersInventoryData = async (req, res) => {
  if (req.user.isPharmacist) {
    try {
      const patientID = req.params.id;
      const prescriptions = await Prescription.find({
        patientId: patientID,
        status: "Pending",
      });

      // Array to store prescription details with price and quantity
      const prescriptionDetails = [];

      for (const prescription of prescriptions) {
        const inventoryItem = await Inventory.findById(prescription.itemId);

        if (inventoryItem) {
          // Construct prescription details object with item details and total price
          const prescriptionDetail = {
            itemName: inventoryItem.itemName,
            dosage: prescription.dosage,
            itemPrice: inventoryItem.itemPrice,
            quantity: inventoryItem.itemQuantity,
            totalPrice: inventoryItem.itemPrice * prescription.dosage, // Calculate total price
            itemQuantity: inventoryItem.itemQuantity, // Add item quantity to the prescription details
          };

          prescriptionDetails.push(prescriptionDetail);
        }
        console.log(prescriptionDetails);
      }

      res.status(200).json({ prescriptions: prescriptionDetails });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(403).json({ message: "Unauthorized access" });
  }
};

export const updatePrescription = async (req, res, next) => {
  if (
    !req.user.isPharmacist &&
    !req.user.isDoctor &&
    !req.user.isAdmin &&
    !req.user.isHeadNurse &&
    !req.user.isNurse &&
    !req.user.isReceptionist
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }
  const prescriptionID = req.body.prescriptionId;
  const itemId = req.body.formData.itemId;
  const medicine = req.body.formData.medicine;
  const dosage = req.body.formData.dosageAmount;
  const route = req.body.formData.route;
  const duration = req.body.formData.noOfDays;
  const frequency = req.body.formData.frequency;
  const foodRelation = req.body.formData.foodRelation;
  const instructions = req.body.formData.instructions;
  const dosageType = req.body.formData.dosageType;
  console.log(req.body);
  if (duration) {
    if (duration < 1) {
      return next(errorHandler(400, "Duration should be atleast 1"));
    }
  }
  if (dosage) {
    if (dosage < 1) {
      return next(errorHandler(400, "Dosage should be atleast 1"));
    }
  }
  if (frequency) {
    if (frequency < 1) {
      return next(errorHandler(400, "Frequency should be atleast 1"));
    }
  }
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionID,
      {
        $set: {
          itemId,
          medicine,
          dosage,
          dosageType,
          route,
          frequency,
          duration,
          foodRelation,
          instructions,
        },
      },
      { new: true }
    );

    res.status(200).json({ message: "Prescription updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadDoctorPrescription = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }
  const userId = req.body.patientId;
  const doctorID = req.body.selectedDoctor.value;
  const prescriptions = await Prescription.find({
    patientId: userId,
    doctorId: doctorID,
  }).populate("doctorId", "username");
  console.log(prescriptions);
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
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h1, h2 {
                margin-bottom: 10px;
                color: #333;
                text-align: center;
            }
            .section {
                margin-bottom: 20px;
                border: 1px solid #ccc;
                padding: 15px;
                border-radius: 10px;
            }
            .section h2 {
                color: #555;
                margin-bottom: 10px;
            }
            .section p {
                color: #666;
                margin-bottom: 5px;
            }
            .section p strong {
                color: #333;
            }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Patient Precription Report</h1>
          </div>
          <h2>Doctor who Prescribed: ${req.body.selectedDoctor.label}</h2>
    `;

    let prevDate = null;
    let prevDoctor = null;

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
      } = prescription;

      const formattedDate = new Date(date).toLocaleString();

      // Check if the current date and doctor are the same as the previous one
      if (formattedDate !== prevDate) {
        htmlContent += `
            <div class="section">
            <h2>Date: ${formattedDate}</h2>`;

        // Add the vital sign information to the HTML content
        htmlContent += `
                <p><strong>Medicine:</strong> ${medicine} </p>
                <p><strong>Dosage:</strong> ${dosage}</p>
                <p><strong>Dosage Type:</strong> ${dosageType}</p>
                <p><strong>Route:</strong> ${route}</p>
                <p><strong>Frequency:</strong>${frequency} Times per Day</p>
                <p><strong>Duration:</strong> ${duration} Days</p>
                <p><strong>Food Relation:</strong> ${foodRelation}</p>
                <p><strong>Instructions:</strong> ${instructions}</p>
            </div>`;
      }
      // Update the previous date and doctor
      prevDate = formattedDate;
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
};

export const getFilterStatusPrescriptionData = async (req, res) => {
  if (
    req.user.isPharmacist ||
    req.user.isReceptionist ||
    req.user.isHeadNurse ||
    req.user.isNurse ||
    req.user.isDoctor ||
    req.user.isAdmin
  ) {
    try {
      const patientID = req.params.id;
      const status = req.body.selectedOption;
      const prescriptions = await Prescription.find({
        patientId: patientID,
        status: status,
      }).populate("doctorId", "username");

      res.status(200).json({ prescriptions });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(403).json({ message: "Unauthorized access" });
  }
};

export const getFilterDatePrescriptionData = async (req, res) => {
  if (
    req.user.isPharmacist ||
    req.user.isReceptionist ||
    req.user.isHeadNurse ||
    req.user.isNurse ||
    req.user.isDoctor ||
    req.user.isAdmin
  ) {
    const patientID = req.params.id;
    try {
      const patientID = req.params.id;
      const selectedOption = req.body.selectedOption;
      if (selectedOption === "today") {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const Precriptions = await Prescription.find({
          patientId: patientID,
          date: { $gte: todayStart, $lte: todayEnd },
        }).populate("doctorId","username").exec();
        res.status(200).json({ Precriptions });
      }
      if (selectedOption === "yesterday") {
        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date();
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);
        const Precriptions = await Prescription.find({
          patientId: patientID,
          date: { $gte: yesterdayStart, $lte: yesterdayEnd },
        }).populate("doctorId","username").exec();
        res.status(200).json({ Precriptions });
      }
      if (selectedOption === "lastWeek") {
        const lastWeekStart = new Date();
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        lastWeekStart.setHours(0, 0, 0, 0);
        const lastWeekEnd = new Date();
        lastWeekEnd.setHours(23, 59, 59, 999);
        const Precriptions = await Prescription.find({
          patientId: patientID,
          date: { $gte: lastWeekStart, $lte: lastWeekEnd },
        }).populate("doctorId","username").exec();
        res.status(200).json({ Precriptions });
      }
      if (selectedOption === "current") {
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 1); // Subtract 1 day from the current date to ensure we include prescriptions created today

        // Find prescriptions for the patient
        const prescriptions = await Prescription.find({
          patientId: patientID,
        }).populate("doctorId","username").exec();

        // Filter prescriptions based on their duration
        const currentMedicationPrescriptions = prescriptions.filter(
          (prescription) => {
            const startDate = new Date(prescription.date); // Use the prescription's creation date as the start date
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + prescription.duration); // Add the duration to the start date

            // Check if the prescription is within its duration
            return startDate <= currentDate && endDate >= currentDate;
          }
        );
        res.status(200).json({ Precriptions: currentMedicationPrescriptions });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(403).json({ message: "Unauthorized access" });
  }
};
