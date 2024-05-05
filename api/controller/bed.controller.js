import Bed from "../models/bed.model.js";
import Patient from "../models/patient.model.js";
import User from "../models/user.model.js";
import EmployeeDetails from "../models/empdata.model.js";
import { errorHandler } from "../utils/error.js";
import moment from "moment";
import generatePdfFromHtml from "../utils/BedPDF.js";
import { populate } from "dotenv";

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

    patient.assignedBeds.push(bed.number);
    patient.bed = bed._id;

    // Save the updated bed to the database
    await bed.save();
    console.log('Bed saved:', bed);

    await patient.save();
    console.log('Patient saved:', patient);

    res
      .status(200)
      .json({
        success: true,
        message: "Patient admitted to bed successfully",
        bed,
        patient,
      });
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  }
};



export const getBedByPatientId = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Find the patient by ID and populate the bed field
    const patient = await Patient.findById(patientId).populate('bed');

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Check if the patient has a bed assigned
    if (!patient.bed) {
      return res.status(200).json({ message: "No bed assigned to this patient" });
    }

    // The bed field is now populated with the bed document
    res.status(200).json({ bed: patient.bed, patient });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Controller function to get all beds
export const getAllBeds = async (req, res, next) => {
  try {
    const beds = await Bed.find().populate('patient');
    const totalbeds = await Bed.countDocuments();

    // Count available beds
    const availableBeds = await Bed.countDocuments({ isAvailable: true });

    // Count unavailable beds
    const unavailableBeds = await Bed.countDocuments({ isAvailable: false });

    res.status(200).json({
      success: true,
      beds,
      totalbeds,
      availableBeds,
      unavailableBeds,
    });
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  }
};
  export const getbedwithDoctor = async (req, res, next) => {
    try {
      // Fetch all beds from the database
      const beds = await Bed.find().populate(assignedDoctor);
  
      // Send the array of beds as JSON response
      res.status(200).json({ beds });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
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
  const { ward } = req.body;

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
      ward,
    });

    // Save the new bed to the database
  const bed=await newBed.save();
  console.log(bed._id);

  

    


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

export const transferPatientToBed = async (req, res, next) => {
  const { currentBedNumber, newBedNumber, patientId } = req.body;

  try {
    // Check if the current bed exists
    const currentBed = await Bed.findOne({ number: currentBedNumber });
    if (!currentBed) {
      return next(errorHandler(404, "Current bed not found"));
    }

    // Check if the new bed exists
    const newBed = await Bed.findOne({ number: newBedNumber });
    if (!newBed) {
      return next(errorHandler(404, "New bed not found"));
    }

    // Check if the new bed is available
    if (!newBed.isAvailable) {
      return next(errorHandler(400, "New bed is already occupied"));
    }

    // Update the current bed to make it available
    currentBed.isAvailable = true;
    currentBed.patient = null;
    await currentBed.save();

    // Update the new bed with the patient information
    newBed.isAvailable = false;
    newBed.patient = patientId;
    await newBed.save();

    res.status(200).json({
      success: true,
      message: "Patient transferred successfully",
      currentBed,
      newBed,
    });
  } catch (error) {
    next(errorHandler(500, "Server Error"));
  }
};



// Assign staff to a bed
export const assignStaffToBed = async (req, res) => {
  try {
    const { bedNumber, staffId } = req.body;

    // Find the bed by its number
    const bed = await Bed.findOne({ number: bedNumber });

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    // Find the staff member by their ID
    const staff = await EmployeeDetails.findById(staffId);

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Update the bed with the assigned staff member
    bed.assignedStaff = staff._id;
    await bed.save();

    res.status(200).json({ message: 'Staff member assigned to bed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    console.error(error);
  }
};

// Remove staff assignment from a bed
export const removeStaffFromBed = async (req, res) => {
  try {
    const { bedNumber } = req.params;

    // Find the bed by its number
    const bed = await Bed.findOne({ number: bedNumber });

    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    // Remove the assigned staff member from the bed
    bed.assignedStaff = null;
    await bed.save();

    res.status(200).json({ message: 'Staff member removed from bed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    console.error(error);
  }
};



// Assign a doctor to a bed
export const assignDoctor = async (req, res) => {
  try {
    const { bedNumber, doctorId } = req.body;

    // Find the bed by its number
    const bed = await Bed.findOne({ number: bedNumber });
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    // Find the doctor by their ID
    const doctor = await User.findById(doctorId);
    if (!doctor || !doctor.isDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Assign the doctor to the bed
    bed.assignedDoctor = doctorId;
    await bed.save();

    res.status(200).json({ message: 'Doctor assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller function to remove the assigned doctor from a bed
export const removeDoctor = async (req, res) => {
  try {
    const { bedNumber } = req.params;

    // Find the bed by its number
    const bed = await Bed.findOne({ number: bedNumber });
    if (!bed) {
      return res.status(404).json({ message: 'Bed not found' });
    }

    // Remove the assigned doctor from the bed
    bed.assignedDoctor = null;
    await bed.save();

    res.status(200).json({ message: 'Doctor removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
