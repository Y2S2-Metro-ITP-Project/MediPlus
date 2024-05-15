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
  } = req.body.formData;
  const doctorID = req.body.doctorId;
  const heightInMeters = height / 100;
  const BMI = bodyweight / (heightInMeters * heightInMeters);
  try {
    const newVitals = new Vitals({
      patientId,
      doctorId: doctorID,
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
    const vitals = await Vitals.find({ patientId })
      .populate("patientId")
      .populate("doctorId");
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


// Function to determine the temperature condition
const getTemperatureCondition = (temperature) => {
  let condition = "";
  if (temperature < 32) {
    condition = `<span style="color: #0000FF;">Extreme Low</span> (Severe hypothermia)`;
  } else if (temperature >= 32 && temperature < 35) {
    condition = `<span style="color: #0000FF;">Very Low</span> (Moderate to severe hypothermia)`;
  } else if (temperature >= 35 && temperature < 36.1) {
    condition = `<span style="color: #0000FF;">Low</span> (Mild hypothermia)`;
  } else if (temperature >= 36.1 && temperature < 37.2) {
    condition = `<span style="color: #00FF00;">Normal</span> (Normal body temperature)`;
  } else if (temperature >= 37.2 && temperature < 38.3) {
    condition = `<span style="color: #FFA500;">High</span> (Low-grade fever)`;
  } else if (temperature >= 38.3 && temperature < 41) {
    condition = `<span style="color: #FF0000;">Very High</span> (Fever)`;
  } else {
    condition = `<span style="color: #FF0000;">Extreme High</span> (Hyperpyrexia)`;
  }
  return condition;
};

// Function to determine the blood pressure condition
const getBloodPressureCondition = (systolic, diastolic) => {
  let condition = "";
  if (systolic < 70 || diastolic < 40) {
    condition = `<span style="color: #0000FF;">Extreme Low</span> (Severe hypotension)`;
  } else if (
    (systolic >= 70 && systolic < 90) ||
    (diastolic >= 40 && diastolic < 60)
  ) {
    condition = `<span style="color: #0000FF;">Very Low</span> (Moderate hypotension)`;
  } else if (
    (systolic >= 90 && systolic < 100) ||
    (diastolic >= 60 && diastolic < 70)
  ) {
    condition = `<span style="color: #0000FF;">Low</span> (Mild hypotension)`;
  } else if (
    (systolic >= 100 && systolic < 120) ||
    (diastolic >= 70 && diastolic < 80)
  ) {
    condition = `<span style="color: #00FF00;">Normal</span> (Normal blood pressure)`;
  } else if (
    (systolic >= 120 && systolic < 140) ||
    (diastolic >= 80 && diastolic < 90)
  ) {
    condition = `<span style="color: #FFA500;">High</span> (Pre-hypertension)`;
  } else if (
    (systolic >= 140 && systolic < 180) ||
    (diastolic >= 90 && diastolic < 120)
  ) {
    condition = `<span style="color: #FF0000;">Very High</span> (Hypertension)`;
  } else {
    condition = `<span style="color: #FF0000;">Extreme High</span> (Severe hypertension or hypertensive crisis)`;
  }
  return condition;
};

// Function to determine the heart rate condition
const getHeartRateCondition = (heartRate) => {
  let condition = "";
  if (heartRate < 40) {
    condition = `<span style="color: #0000FF;">Extreme Low</span> (Severe bradycardia)`;
  } else if (heartRate >= 40 && heartRate < 50) {
    condition = `<span style="color: #0000FF;">Very Low</span> (Moderate bradycardia)`;
  } else if (heartRate >= 50 && heartRate < 60) {
    condition = `<span style="color: #0000FF;">Low</span> (Mild bradycardia)`;
  } else if (heartRate >= 60 && heartRate < 100) {
    condition = `<span style="color: #00FF00;">Normal</span> (Normal heart rate)`;
  } else if (heartRate >= 100 && heartRate < 120) {
    condition = `<span style="color: #FFA500;">High</span> (Tachycardia)`;
  } else if (heartRate >= 120 && heartRate < 180) {
    condition = `<span style="color: #FF0000;">Very High</span> (Moderate to severe tachycardia)`;
  } else {
    condition = `<span style="color: #FF0000;">Extreme High</span> (Tachyarrhythmia or ventricular tachycardia)`;
  }
  return condition;
};

// Function to determine the blood glucose condition
const getBloodGlucoseCondition = (bloodGlucose) => {
  let condition = "";
  if (bloodGlucose < 40) {
    condition = `<span style="color: #0000FF;">Extreme Low</span> (Severe hypoglycemia)`;
  } else if (bloodGlucose >= 40 && bloodGlucose < 60) {
    condition = `<span style="color: #0000FF;">Very Low</span> (Moderate hypoglycemia)`;
  } else if (bloodGlucose >= 60 && bloodGlucose < 70) {
    condition = `<span style="color: #0000FF;">Low</span> (Mild hypoglycemia)`;
  } else if (bloodGlucose >= 70 && bloodGlucose < 140) {
    condition = `<span style="color: #00FF00;">Normal</span> (Normal blood glucose)`;
  } else if (bloodGlucose >= 140 && bloodGlucose < 180) {
    condition = `<span style="color: #FFA500;">High</span> (Hyperglycemia)`;
  } else if (bloodGlucose >= 180 && bloodGlucose < 250) {
    condition = `<span style="color: #FF0000;">Very High</span> (Moderate hyperglycemia)`;
  } else {
    condition = `<span style="color: #FF0000;">Extreme High</span> (Severe hyperglycemia)`;
  }
  return condition;
};

// Function to determine the oxygen saturation condition
const getOxygenSaturationCondition = (oxygenSaturation) => {
  let condition = "";
  if (oxygenSaturation < 85) {
    condition = `<span style="color: #FF0000;">Extreme Low</span> (Severe hypoxemia)`;
  } else if (oxygenSaturation >= 85 && oxygenSaturation < 90) {
    condition = `<span style="color: #FFA500;">Very Low</span> (Moderate hypoxemia)`;
  } else if (oxygenSaturation >= 90 && oxygenSaturation < 92) {
    condition = `<span style="color: #0000FF;">Low</span> (Mild hypoxemia)`;
  } else if (oxygenSaturation >= 95 && oxygenSaturation <= 100) {
    condition = `<span style="color: #00FF00;">Normal</span> (Normal oxygen saturation)`;
  } else {
    condition = `<span style="color: #FF0000;">High</span> (Rarely, values above 100%)`;
  }
  return condition;
};

const getBMICondition = (bmi) => {
  let condition = "";
  if (bmi < 18.5) {
    condition = `<span style="color: #0000FF;">Underweight</span>`;
  } else if (bmi >= 18.5 && bmi < 24.9) {
    condition = `<span style="color: #00FF00;">Normal weight</span>`;
  } else if (bmi >= 25 && bmi < 29.9) {
    condition = `<span style="color: #FFFF00;">Overweight</span>`;
  } else {
    condition = `<span style="color: #FF0000;">Obese</span>`;
  }
  return condition;
};



export const downloadPDFVitals = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }
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
    if(selectedVitalsDoctor!=null){
      const date = new Date();
      const vitals = await Vitals.find({
        patientId,
        doctorId:selectedVitalsDoctor
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
    const vitals = await Vitals.find({ patientId: ID }).populate("doctorId").populate("patientId");
    const latestVitals = await Vitals.findOne({ patientId: ID }).sort({
      date: -1,
    });
    res.status(200).json({ vitals, latestVitals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
