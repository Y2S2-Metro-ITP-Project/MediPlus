import Patient from "../models/patient.model.js";
import Vitals from "../models/vitals.model.js";
import generatePdfFromHtml from "../utils/PatientPDF.js";

export const addvitals = async (req, res) => {
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
  const { patientId } = req.params;
  const {
    bodyweight,
    height,
    temperature,
    bloodPressureSystolic,
    bloodPressureDiastolic,
    heartRate,
    respiratoryRate,
    oxygenSaturation,
    bloodGlucose,
  } = req.body;
  const heightInMeters = height / 100;
  const BMI = bodyweight / (heightInMeters * heightInMeters);
  try {
    const newVitals = new Vitals({
      patientId,
      bodyweight,
      height,
      temperature,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      respiratoryRate,
      oxygenSaturation,
      bloodGlucose,
      BMI,
    });
    await newVitals.save();
    res.status(201).json({ message: "Vitals added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getvitals = async (req, res) => {
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
  const { patientId } = req.params;
  try {
    const vitals = await Vitals.find({ patientId });
    const latestVitals = await Vitals.findOne({ patientId }).sort({ date: -1 });

    // Check if latestVitals exists and contains data
    /*if (latestVitals) {
      const { temperature, heartRate, bloodGlucose } = latestVitals;
    
      console.log("Latest Temperature:", temperature);
      console.log("Latest Heart Rate:", heartRate);
      console.log("Latest Blood Glucose Level:", bloodGlucose);
    } else {
      console.log("No vitals data found.");
    }*/
    res.status(200).json({ vitals, latestVitals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletevitals = async (req, res) => {
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
      .json({ message: "You are not allowed to delete these resources" });
  }
  const { vitalIdToDelete } = req.params;
  console.log(vitalIdToDelete);
  try {
    await Vitals.findByIdAndDelete(req.params.vitalIdToDelete);
    res.status(200).json({ message: "Vitals deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadPDFVitals = async (req, res) => {
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
  const vitals = await Vitals.find({ patientId });
  console.log(vitals);
  try {
    let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Patient Vital Report</title>
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
                <h1>Patient Medical Report</h1>
            </div>
        `;

    vitals.forEach((vital) => {
      const {
        date,
        temperature,
        bodyweight,
        height,
        bloodGlucose,
        bloodPressureSystolic,
        bloodPressureDiastolic,
        heartRate,
        respiratoryRate,
        oxygenSaturation,
      } = vital;

      const formattedDate = new Date(date).toLocaleString();

      // Add the vital sign information to the HTML content
      htmlContent += `
            <div class="section">
                <h2>Date: ${formattedDate}</h2>
                <p><strong>Temperature:</strong> ${temperature} </p>
                <p><strong>Weight:</strong> ${bodyweight} KG</p>
                <p><strong>Height:</strong> ${height} CM</p>
                <p><strong>Blood Glucose:</strong> ${bloodGlucose} MG/DL</p>
                <p><strong>Blood Pressure:</strong> ${bloodPressureSystolic}/${bloodPressureDiastolic} MMHG</p>
                <p><strong>Heart Rate:</strong> ${heartRate} BPM</p>
                <p><strong>Respiratory Rate:</strong> ${respiratoryRate}</p>
                <p><strong>Oxygen Saturation:</strong> ${oxygenSaturation} SPO2</p>
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

export const getUserpatientVitals = async (req, res) => {
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
  const UserId = req.params.UserId;
  //console.log(UserId);
  const patientId = await Patient.find({ user: UserId }).select("_id");
  const ID = patientId[0]._id;
  try {
    const vitals = await Vitals.find({ patientId: ID });
    const latestVitals = await Vitals.findOne({ patientId: ID }).sort({
      date: -1,
    });
    res.status(200).json({ vitals, latestVitals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
