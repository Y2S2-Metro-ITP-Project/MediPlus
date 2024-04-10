import Bed from "../models/bed.model.js";
import Patient from "../models/patient.model.js";
import { errorHandler } from "../utils/error.js";
import moment from "moment";
import generatePdfFromHtml from "../utils/BedPDF.js";

export const generateReport = async (req, res, next) => {
  try {
    // Get all beds
    const countBeds = await Bed.countDocuments();
    const countAvailableBeds = await Bed.countDocuments({ isAvailable: true });
    const countOccupiedBeds = await Bed.countDocuments({ isAvailable: false });

    const htmlContent=`
    <h1>Bed Management</h1>
    <h1>count:${countBeds}</h1>
    <h1>Available:${countAvailableBeds}</h1>
    <h1>UnAvailable:${countOccupiedBeds}</h1>
    `
    // Generate the PDF report
    const report = await generatePdfFromHtml(htmlContent);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": report.length,
    
    })
    res.send(report);
  } catch (error) {
    console.error("Error generating report:", error);
    const errorMessage = error.message || "An unexpected error occured";
    next(errorHandler(500, errorMessage));
  }
};

export const generatePatientReport = async (req, res, next) => {
  const bedId=req.params.id;
  console.log(bedId);
  try {
    const bed = await Bed.findById(bedId).populate('patient');
    if (!bed) {
      return next(errorHandler(404, "Bed not found"));
    }
    const patient = bed.patient;
    const admissionDate = moment(patient.admissionDate).format("MMM Do YYYY");
    const name = patient.name;
    const gender = patient.gender;
    const contactEmail = patient.contactEmail;
    const contactPhone = patient.contactPhone;
    const createdAt = patient.createdAt;
    const dateOfBirth = patient.dateOfBirth;
    const address = patient.address;
    const identification = patient.identification;
    const emergencyName = patient.emergencyContact.name;
    const emergencyPhoneNumber = patient.emergencyContact.phoneNumber;
    const ward = patient.roomPreferences;
    const number=bed.number;
    const age=moment().diff(dateOfBirth, 'years');
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Patient Registration Report</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4; /* Light gray background */
                background-image: url('https://img.freepik.com/free-vector/medical-healthcare-blue-color_1017-26807.jpg'); /* Replace 'medical_background.jpg' with your image file */
                background-size: cover;
                background-repeat: no-repeat;
            }
            .container {
                max-width: 800px;
                margin: 20px auto;
                padding: 20px;
                background-color: rgba(255, 255, 255, 0.9); /* Semi-transparent white background */
                border-radius: 10px;
            }
            h1, h2 {
                margin-bottom: 10px;
                color: #007bff; /* Blue color for medical theme */
                text-align: center; /* Center align headings */
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
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Patient Medical Report</h1>
            <div class="section">
                <h2>Personal Information</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Gender:</strong> ${gender}</p>
                <p><strong>Date of Birth:</strong> ${dateOfBirth}</p>
                <p><strong>Age:</strong> ${age}</p> <!-- Corrected from "Date of Birth" to "Age" -->
                <p><strong>Contact Email:</strong> ${contactEmail}</p>
                <p><strong>Contact Phone:</strong> ${contactPhone}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Identification:</strong> ${identification}</p>
            </div>
            <div class="section">
                <h2>Emergency Contact Information</h2>
                <p><strong>Name:</strong> ${emergencyName}</p>
                <p><strong>Phone Number:</strong> ${emergencyPhoneNumber}</p>
            </div>
            <div class="section">
                <h2>Ward Information</h2>
                <p><strong>Room Preference:</strong> ${ward}</p>
                <p><strong>Bed Number:</strong> ${number}</p>
            </div>
        </div>
    </body>
    </html>    
    
`;
const pdfBuffer = await generatePdfFromHtml(htmlContent);
res.set({
  "Content-Type": "application/pdf",
  "Content-Length": pdfBuffer.length,
});
res.send(pdfBuffer);
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  }
}




// Controller function to admit a patient to a bed
export const admitPatientToBed = async (req, res, next) => {
  const { bedNumber, 
    patientId
 } = req.body;

  try {
    // Check if the bed exists
    const bed = await Bed.findOne({ number: bedNumber });
    if (!bed) {
      return next(errorHandler(404, "Bed not found"));
    }

    // Check if the bed is already occupied
    if (!bed.isAvailable) {
      return next(errorHandler(400, "Bed is already occupied"));
    }

   const patient = await Patient.findOne({ _id: patientId });
    
    // Update the bed with patient information
    bed.isAvailable = false;
    bed.patient = patientId;

    // Save the updated bed to the database
    await bed.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Patient admitted to bed successfully",
        bed,
      });
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  }
};

// Controller function to get all beds
export const getAllBeds = async (req, res, next) => {
    try {
      const beds = await Bed.find().populate('patient');
      res.status(200).json({ success: true, beds });
    } catch (error) {
      next(errorHandler(500, "Server Error"));
    }
  };
  

// Controller function to get bed by number
export const getBedByNumber = async (req, res, next) => {
    const { number } = req.params;
    try {
      const bed = await Bed.findOne({ number }).populate('patient', 'name admissionDate illness gender age');
      if (!bed) {
        return next(errorHandler(404, "Bed not found"));
      }
      res.status(200).json({ success: true, bed });
    } catch (error) {
      next(errorHandler(500, "Server Error"));
    }
  };

// Controller function to update bed availability
export const updateBedAvailability = async (req, res, next) => {
  const { number } = req.params;
  const { isAvailable } = req.body;
  try {
    const bed = await Bed.findOne({ number });
    if (!bed) {
      return next(errorHandler(404, "Bed not found"));
    }
    bed.isAvailable = isAvailable;
    await bed.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Bed availability updated successfully",
        bed,
      });
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  }
};

// Controller function to delete bed by number
export const deleteBedByNumber = async (req, res, next) => {
  const { number } = req.params;
  try {
    const deletedBed = await Bed.findOneAndDelete({ number });
    if (!deletedBed) {
      return next(errorHandler(404, "Bed not found"));
    }
    res
      .status(200)
      .json({ success: true, message: "Bed deleted successfully" });
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  }
};

export const createBed = async (req, res, next) => {
  const { number } = req.body;

  try {
    // Check if the bed number is provided
    if (!number) {
      return next(errorHandler(400, "Bed number is required"));
    }

    // Check if the bed number already exists
    const existingBed = await Bed.findOne({ number });
    if (existingBed) {
      return next(errorHandler(400, "Bed number already exists"));
    }

    // Create a new bed instance
    const newBed = new Bed({
      number,
    });

    // Save the new bed to the database
    await newBed.save();

    // Send success response
    res
      .status(201)
      .json({
        success: true,
        message: "Bed created successfully",
        bed: newBed,
      });
  } catch (error) {
    // Handle errors
    next(errorHandler(500, "Server Error"));
  }
};
