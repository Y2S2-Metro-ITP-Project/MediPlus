import Patient from "../models/patient.model.js";
import PatientDiagnosis from "../models/patientDiagnosis.model.js";
import User from "../models/user.model.js";
import generatePdfFromHtml from "../utils/PatientPDF.js";
export const addDiagnosisData = async (req, res) => {
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
    console.log(req.body);
    const patientId = req.body.patientId;
    const doctorId = req.body.doctorId;
    const diagnosis = req.body.formData.disease;
    const type = req.body.formData.type;
    const ICD10 = req.body.formData.ICD10;
    const level = req.body.formData.category;
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
};

export const getDiagnosisData = async (req, res) => {
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
    const PatientID2 = "661373074d03da9b466f7b55";
    const diagnosis = await PatientDiagnosis.find({
      patientId: patientID,
    }).populate({
      path: "doctorId",
      select: "username",
    });
    /*const diagnosis = await PatientDiagnosis.find({
      patientID,
    }).populate({
      path: "doctorId",
      select: "username",
    });*/
    if (!diagnosis) {
      console.log("No diagnosis found");
    }
    res.status(200).json({ diagnosis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDiagnosisData = async (req, res) => {
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
    await PatientDiagnosis.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Diagnosis deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientDiagnosisData = async (req, res, next) => {
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
    const patientId = patient._id;
    console.log(patientId);
    const diagnosis = await PatientDiagnosis.find({
      patientId: patientId,
    }).populate({
      path: "doctorId",
      select: "username",
    });
    if (!diagnosis) {
      return res.status(404).json({ message: "No diagnosis found" });
    }
    const totalDiagnosis = diagnosis.length;
    const totalSevereDiagnosisData = await PatientDiagnosis.countDocuments({
      patientId: patientId,
      level: "Severe",
    });
    const totalMildDiagnosisData = await PatientDiagnosis.countDocuments({
      patientId: patientId,
      level: "Mild",
    });
    const totalModerateDiagnosisData = await PatientDiagnosis.countDocuments({
      patientId: patientId,
      level: "Moderate",
    });
    const totalMildDiagnosisDataLastMonth =
      await PatientDiagnosis.countDocuments({
        patientId: patientId,
        level: "Mild",
        date: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      });
    const totalModerateDiagnosisDataLastMonth =
      await PatientDiagnosis.countDocuments({
        patientId: patientId,
        level: "Moderate",
        date: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      });
    const totalSevereDiagnosisDataLastMonth =
      await PatientDiagnosis.countDocuments({
        patientId: patientId,
        level: "Severe",
        date: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      });
    res.status(200).json({
      diagnosis,
      totalDiagnosis,
      totalSevereDiagnosisData,
      totalMildDiagnosisData,
      totalModerateDiagnosisData,
      totalMildDiagnosisDataLastMonth,
      totalModerateDiagnosisDataLastMonth,
      totalSevereDiagnosisDataLastMonth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadPatientPDFDiagnosis = async (req, res) => {
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
  const patientName = await Patient.findOne({ user: userId }).select("name");
  const diagnosis1 = await PatientDiagnosis.find({
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
              <h1>Patient Diagnostic Report</h1>
          </div>
          <h2>Date: ${req.body.selectedDate.value}</h2>
          <h2>Patient Name: ${patientName.name}</h2>
    `;

    diagnosis1.forEach((diagnosis1) => {
      const {
        type,
        ICD10,
        Symptoms,
        level,
        diagnosis,
        doctorId: { username },
        date,
      } = diagnosis1;

      const formattedDate = new Date(date).toLocaleString();

      // Check if the current date and doctor are the same as the previous one
      htmlContent += `
            <div class="section">
            <h2>Doctor who diagnosed: ${username}</h2>`;

      // Add the vital sign information to the HTML content
      htmlContent += `
                <p><strong>level:</strong> ${level}</p>
                <p><strong>Type:</strong> ${type} </p>
                <p><strong>Condition:</strong> ${diagnosis} </p>
                <p><strong>ICD10:</strong> ${ICD10}</p>
                <p><strong>Remarks:</strong> ${Symptoms}</p>
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

export const downloadPatientDoctorPDFDiagnosis = async (req, res) => {
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
  const patientName = await Patient.findOne({ user: userId }).select("name");
  const DoctorId = await User.findOne({ username: name }).select("_id");
  const diagnosis1 = await PatientDiagnosis.find({
    patientId: patient._id,
    doctorId: DoctorId._id,
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
              <h1>Patient Diagnostic Report</h1>
          </div>
          <h2>Doctor: ${req.body.selectedDoctor.value}</h2>
          <h2>Patient Name: ${patientName.name}</h2>
    `;

    diagnosis1.forEach((diagnosis1) => {
      const {
        type,
        ICD10,
        Symptoms,
        level,
        diagnosis,
        doctorId: { username },
        date,
      } = diagnosis1;

      const formattedDate = new Date(date).toLocaleString();

      // Check if the current date and doctor are the same as the previous one
      htmlContent += `
            <div class="section">
            <h2>Date of Diagnosis: ${formattedDate}</h2>`;

      // Add the vital sign information to the HTML content
      htmlContent += `
                <p><strong>level:</strong> ${level}</p>
                <p><strong>Type:</strong> ${type} </p>
                <p><strong>Condition:</strong> ${diagnosis} </p>
                <p><strong>ICD10:</strong> ${ICD10}</p>
                <p><strong>Remarks:</strong> ${Symptoms}</p>
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

export const downloadDoctorDiagnosis = async (req, res) => {
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
  const patientID = req.body.patientId;
  const patient = await Patient.findById(patientID);
  const patientName = patient.name;
  console.log(req.body);
  const DoctorID = req.body.selectedDoctor.value;
  console.log(DoctorID);
  const diagnosis1 = await PatientDiagnosis.find({
    patientId: patientID,
    doctorId: DoctorID,
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
              <h1>Patient Diagnostic Report</h1>
          </div>
          <h2>Doctor: ${req.body.selectedDoctor.label}</h2>
          <h2>Patient Name: ${patientName}</h2>
    `;

    diagnosis1.forEach((diagnosis1) => {
      const { type, ICD10, Symptoms, level, diagnosis, date } = diagnosis1;

      const formattedDate = new Date(date).toLocaleString();

      // Check if the current date and doctor are the same as the previous one
      htmlContent += `
            <div class="section">
            <h2>Date of Diagnosis: ${formattedDate}</h2>`;

      // Add the vital sign information to the HTML content
      htmlContent += `
                <p><strong>level:</strong> ${level}</p>
                <p><strong>Type:</strong> ${type} </p>
                <p><strong>Condition:</strong> ${diagnosis} </p>
                <p><strong>ICD10:</strong> ${ICD10}</p>
                <p><strong>Remarks:</strong> ${Symptoms}</p>
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

export const downloadDateDiagnosis = async (req, res) => {
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
  console.log(req.body);
  const selectedDate = req.body.selectedDiagnosisDate.value;
  const isoDate = new Date(selectedDate).toISOString();
  // Extract year, month, and day from the ISODate
  const year = new Date(isoDate).getFullYear();
  const month = new Date(isoDate).getMonth() + 1; // Months are 0-indexed in JavaScript, so add 1
  const day = new Date(isoDate).getDate();
  const patientid = req.body.patientId;
  const patientName = await Patient.findOne({ _id: patientid }).select("name");
  const diagnosis1 = await PatientDiagnosis.find({
    patientId: patientid,
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
              <h1>Patient Diagnostic Report</h1>
          </div>
          <h2>Date: ${req.body.selectedDiagnosisDate.value}</h2>
          <h2>Patient Name: ${patientName.name}</h2>
    `;

    diagnosis1.forEach((diagnosis1) => {
      const {
        type,
        ICD10,
        Symptoms,
        level,
        diagnosis,
        doctorId: { username },
        date,
      } = diagnosis1;

      const formattedDate = new Date(date).toLocaleString();

      // Check if the current date and doctor are the same as the previous one
      htmlContent += `
            <div class="section">
            <h2>Doctor who diagnosed: ${username}</h2>`;

      // Add the vital sign information to the HTML content
      htmlContent += `
                <p><strong>level:</strong> ${level}</p>
                <p><strong>Type:</strong> ${type} </p>
                <p><strong>Condition:</strong> ${diagnosis} </p>
                <p><strong>ICD10:</strong> ${ICD10}</p>
                <p><strong>Remarks:</strong> ${Symptoms}</p>
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

export const getFilterDiagnosisData = async (req, res) => {
  try {
    const patientId = req.params.id;
    const selectedOption = req.body.selectedOption;

    // Perform filtering based on selected option
    let filteredDiagnosis;

    // Add logic to filter diagnosis data based on the selected option
    switch (selectedOption) {
      case "today":
        // Filter diagnosis data for today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        filteredDiagnosis = await PatientDiagnosis.find({
          patientId: patientId,
          date: { $gte: todayStart, $lte: todayEnd },
        }).exec();
        break;
      case "lastweek":
        // Filter diagnosis data for the last week
        const lastWeekStart = new Date();
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date();
        filteredDiagnosis = await PatientDiagnosis.find({
          patientId: patientId,
          date: { $gte: lastWeekStart, $lte: lastWeekEnd },
        }).exec();
        break;
      case "lastmonth":
        // Filter diagnosis data for the last month
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        const lastMonthEnd = new Date();
        filteredDiagnosis = await PatientDiagnosis.find({
          patientId: patientId,
          date: { $gte: lastMonthStart, $lte: lastMonthEnd },
        }).exec();
        break;
      case "lastyear":
        // Filter diagnosis data for the last year
        const lastYearStart = new Date();
        lastYearStart.setFullYear(lastYearStart.getFullYear() - 1);
        const lastYearEnd = new Date();
        filteredDiagnosis = await PatientDiagnosis.find({
          patientId: patientId,
          date: { $gte: lastYearStart, $lte: lastYearEnd },
        }).exec();
        break;
      case "latest":
        // Get the latest diagnosis record for the patient
        filteredDiagnosis = await PatientDiagnosis.find({
          patientId: patientId,
        })
          .sort({ date: -1 })
          .limit(1)
          .exec();
        break;
      case "oldest":
        // Get the oldest diagnosis record for the patient
        filteredDiagnosis = await PatientDiagnosis.find({
          patientId: patientId,
        })
          .sort({ date: 1 })
          .limit(1)
          .exec();
        break;
      default:
        // Handle default case or invalid options
        return res.status(400).json({ message: "Invalid filter option" });
    }

    // Return the filtered diagnosis data
    console.log(filteredDiagnosis)
    res.status(200).json({ diagnosis: filteredDiagnosis });
  } catch (error) {
    console.error("Error filtering diagnosis data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFilterStatusDiagnosisData = async (req, res) => {
  try {
    const patientId = req.params.id;
    const selectedOption = req.body.selectedOption;

    // Perform filtering based on selected option
    let filteredDiagnosis;

    // Add logic to filter diagnosis data based on the selected option
    switch (selectedOption) {
      case "Mild":
        // Filter diagnosis data for pending status
        filteredDiagnosis = await PatientDiagnosis.find({
          patientId: patientId,
          level: "Mild",
        }).exec();
        break;
      case "Moderate":
        // Filter diagnosis data for completed status
        filteredDiagnosis = await PatientDiagnosis.find({
          patientId: patientId,
          level: "Moderate",
        }).exec();
        break;
      case "Severe":
        // Filter diagnosis data for failed status
        filteredDiagnosis = await PatientDiagnosis.find({
          patientId: patientId,
          level: "Severe",
        }).exec();
        break;
      default:
        // Handle default case or invalid options
        return res.status(400).json({ message: "Invalid filter option" });
    }

    // Return the filtered diagnosis data
    res.status(200).json({ diagnosis: filteredDiagnosis });
  } catch (error) {
    console.error("Error filtering diagnosis data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}