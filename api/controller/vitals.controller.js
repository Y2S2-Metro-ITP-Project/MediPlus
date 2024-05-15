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
    const patientId = req.body.patientId;
    const selectedVitalsDate = req.body.selectedVitalsDate
      ? req.body.selectedVitalsDate.value
      : null;
    const selectedVitalsDoctor = req.body.selectedVitalsDoctor
      ? req.body.selectedVitalsDoctor.value
      : null;
    const selectedVitalsTime = req.body.selectedVitalsTime
      ? req.body.selectedVitalsTime.value
      : null;
    if (selectedVitalsDate != null) {
      const isoDate = new Date(selectedVitalsDate).toISOString();
      // Extract year, month, and day from the ISODate
      const year = new Date(isoDate).getFullYear();
      const month = new Date(isoDate).getMonth() + 1; // Months are 0-indexed in JavaScript, so add 1
      const day = new Date(isoDate).getDate();
      const vitals = await Vitals.find({
        patientId,
        date: {
          $gte: new Date(`${year}-${month}-${day}`),
          $lt: new Date(`${year}-${month}-${day + 1}`),
        },
      })
        .populate("patientId")
        .populate("doctorId", "username");
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
                <h1>Patient Vitals Report</h1>
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
            BMI,
            doctorId: { username },
            patientId: { patientName },
          } = vital;

          const formattedDate = new Date(date).toLocaleString();
          // Get the condition for each vital sign
          const temperatureCondition = getTemperatureCondition(temperature);
          const bloodPressureCondition = getBloodPressureCondition(
            bloodPressureSystolic,
            bloodPressureDiastolic
          );
          const heartRateCondition = getHeartRateCondition(heartRate);
          const bloodGlucoseCondition = getBloodGlucoseCondition(bloodGlucose);
          const oxygenSaturationCondition =
            getOxygenSaturationCondition(oxygenSaturation);
          const BMICondition = getBMICondition(BMI);
          // Add the vital sign information to the HTML content
          htmlContent += `
            <div class="section">
            <h2>Date: ${formattedDate}</h2>
            <h2>Doctor Who collected the vitals: ${username}</h2>
            <h2>Patient Name: ${ patientName }</h2>
            <p><strong>Temperature:</strong> ${temperature} (${temperatureCondition})</p>
            <p><strong>Weight:</strong> ${bodyweight} KG</p>
            <p><strong>Height:</strong> ${height} CM</p>
            <p><strong>BMI:</strong> ${BMI.toFixed(2)} (${BMICondition})</p>
            <p><strong>Blood Glucose:</strong> ${bloodGlucose} MG/DL (${bloodGlucoseCondition})</p>
            <p><strong>Blood Pressure:</strong> ${bloodPressureSystolic}/${bloodPressureDiastolic} MMHG (${bloodPressureCondition})</p>
            <p><strong>Heart Rate:</strong> ${heartRate} BPM (${heartRateCondition})</p>
            <p><strong>Respiratory Rate:</strong> ${respiratoryRate}</p>
            <p><strong>Oxygen Saturation:</strong> ${oxygenSaturation} SPO2 (${oxygenSaturationCondition})</p>
            </div>
            
            `;
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
    if (selectedVitalsTime != null) {
      const date = new Date();

      // Split the selectedVitalsTime into hours, minutes, and AM/PM
      let timeParts = selectedVitalsTime.split(":");
      let hours = parseInt(timeParts[0]); // Extract hours
      let minutes = parseInt(timeParts[1]); // Extract minutes
      let amOrPm = timeParts[1].split(" ")[1]; // Extract AM/PM

      // Adjust hours for PM if necessary
      if (amOrPm === "PM" && hours !== 12) {
        hours += 12;
      }

      // Set the hours and minutes to the date object
      date.setHours(hours, minutes);

      // Create the end time by adding 1 hour to the start time
      const endTime = new Date(date.getTime() + 1000 * 60 * 60);

      // Query the vitals with the time range
      const vitals = await Vitals.find({
        patientId,
        date: {
          $gte: date,
          $lt: endTime,
        },
      })
        .populate("patientId")
        .populate("doctorId", "username");
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
