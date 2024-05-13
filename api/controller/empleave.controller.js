// empleave.controller.js
import Leave from "../models/empleave.model.js";
import User from "../models/user.model.js";
import mongoose from 'mongoose';
import { errorHandler } from "../utils/error.js";
import generatePdfFromHtml from "../utils/PatientPDF.js";



// Controller function to create a leave application
export const createLeave = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return next(errorHandler(403, "You are not allowed to access these resources"));
    }

    // Extract user ID from request parameters
    const userId = req.params.userId;

    // Extract leave details from request body
    const { startDate, endDate, reason } = req.body;

    // Create new leave instance
    const newLeave = new Leave({ user: userId, startDate, endDate, reason });

    // Save leave to database
    await newLeave.save();

    // Return success response
    res.status(201).json(newLeave);
  } catch (error) {
    next(error);
  }
};


const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate({
        path: 'user',
        select: 'username isAdmin isDoctor isNurse isPharmacist isReceptionist isHeadNurse isHRM isCashier',
        options: {
          strict: false
        }
      })
      .select('reason startDate endDate status');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export { getAllLeaves };


// Function to update leave status
async function approveRejectLeave(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Find the leave by ID
    const leave = await Leave.findById(id);

    // If leave is not found, return 404 Not Found
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // Update the status of the leave
    leave.status = status;

    // Save the updated leave
    await leave.save();

    // Return a success message
    res.status(200).json({ message: `Leave ${status}` });
  } catch (error) {
    console.error("Error approving/rejecting leave:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export { approveRejectLeave };

// Controller function to delete a leave by ID
const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid leave ID' });
    }

    // Find the leave by ID and delete it
    const deletedLeave = await Leave.findByIdAndDelete(id);

    if (!deletedLeave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Respond with success message
    res.json({ message: 'Leave deleted successfully' });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { deleteLeave };


// Function to get leaves of a specific user
export const getUserLeaves = async (req, res) => {
  try {
    const { userId } = req.params;
    const leaves = await Leave.find({ user: userId });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTodaysTotalLeave = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todaysTotalLeave = await Leave.countDocuments({
      $and: [
        { $or: [
            { startDate: { $gte: startOfDay, $lt: endOfDay } }, // Leave starts today
            { endDate: { $gte: startOfDay, $lt: endOfDay } },   // Leave ends today
            { $and: [
                { startDate: { $lt: startOfDay } },            // Leave starts before today
                { endDate: { $gte: endOfDay } }                // Leave ends after today
              ]
            }
          ]
        },
        { status: 'approved' } // Condition for leave status being 'approved'
      ]
    });

    res.status(200).json({ todaysTotalLeave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  
export const getTotalPendingLeave = async (req, res) => {
  try {
    const totalPendingLeave = await Leave.countDocuments({ status: "pending" });
    console.log("Total pending leave count:", totalPendingLeave);
    res.status(200).json({ totalPendingLeave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeesSummary = async (req, res, next) => {
  try {
    // Construct query to filter users with employee roles
    const query = {
      $or: [
        { isAdmin: true },
        { isHRM: true },
        { isHeadNurse: true },
        { isNurse: true },
        { isPharmacist: true },
        { isReceptionist: true },
        { isDoctor: true },
        { isLabTech: true },
        { isCashier: true }
      ]
    };

    // Find users based on the query
    const users = await User.find(query);

    // Count total employees for each role
    const employeesSummary = {
      totalEmployees: users.length,
      totalAdmins: users.filter(user => user.isAdmin).length,
      totalHRMs: users.filter(user => user.isHRM).length,
      totalHeadNurses: users.filter(user => user.isHeadNurse).length,
      totalNurses: users.filter(user => user.isNurse).length,
      totalPharmacists: users.filter(user => user.isPharmacist).length,
      totalReceptionists: users.filter(user => user.isReceptionist).length,
      totalDoctors: users.filter(user => user.isDoctor).length,
      totalLabTechs: users.filter(user => user.isLabTech).length,
      totalCashiers: users.filter(user => user.isCashier).length
    };

    // Send response with employees summary
    res.status(200).json(employeesSummary);
  } catch (error) {
    next(error);
  }
};

// Define getUserRole function
const getUserRole = (user) => {
  if (!user) return "Unknown";

  if (user.isPatient || user.isUser) {
    if (user.isAdmin) return "Admin";
  } else {
    if (user.isDoctor) return "Doctor";
    if (user.isNurse) return "Nurse";
    if (user.isPharmacist) return "Pharmacist";
    if (user.isReceptionist) return "Receptionist";
    if (user.isHeadNurse) return "Head Nurse";
    if (user.isHRM) return "HRM";
    if (user.isAdmin) return "Admin";
    if (user.isCashier) return "Cashier"
    if (user.isLabTech) return "Lab Tech";
  }
  return "Employee";
};

export const deleteOldLeaves = async (req, res, next) => {
  try {
    // Calculate the date 3 months ago
    const currentDate = new Date();
    const threeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);

    // Delete leave records whose end date is before 3 months ago
    const result = await Leave.deleteMany({ endDate: { $lt: threeMonthsAgo } });

    // Send a response indicating the number of deleted records
    res.json({ message: `${result.deletedCount} old leave records deleted successfully` });
  } catch (error) {
    next(error);
  }
};



export const PDFEmployeeLeave = async (req, res, next) => {
  try {
    const { leaves, selectedMonth } = req.body;
    if (!leaves || !Array.isArray(leaves)) {
      throw new Error("Invalid data received");
    }

    let filteredLeaves = leaves;
    if (selectedMonth !== "") {
      // Filter leaves based on selected month
      filteredLeaves = leaves.filter(leave => {
        const leaveStartDate = new Date(leave.startDate);
        const leaveEndDate = new Date(leave.endDate);
        const startMonth = leaveStartDate.getMonth();
        const endMonth = leaveEndDate.getMonth();
        return startMonth == selectedMonth || endMonth == selectedMonth;
      });
    }

    // Group leaves by role
    const leavesByRole = {};
    filteredLeaves.forEach(leave => {
      const userRole = getUserRole(leave.user);
      if (!leavesByRole[userRole]) {
        leavesByRole[userRole] = {};
      }
      const employeeId = leave.user ? leave.user._id : 'Unknown';
      if (!leavesByRole[userRole][employeeId]) {
        leavesByRole[userRole][employeeId] = [];
      }
      leavesByRole[userRole][employeeId].push(leave);
    });

    // Generate HTML content for each role and employee
    const htmlContent = Object.keys(leavesByRole).map(role => {
      const roleLeaves = leavesByRole[role];
      const roleHtmlContent = Object.keys(roleLeaves).map(employeeId => {
        const employeeLeaves = roleLeaves[employeeId];
        const tableRows = employeeLeaves.map(leave => `
          <tr>
            <td>${leave.user ? leave.user.username : 'Unknown User'}</td>
            <td>${new Date(leave.startDate).toLocaleDateString()}</td>
            <td>${new Date(leave.endDate).toLocaleDateString()}</td>
            <td>${leave.reason}</td>
            <td>${leave.status}</td>
          </tr>
        `).join('');

        return `
          <h3>Employee: ${employeeLeaves[0].user ? employeeLeaves[0].user.username : 'Unknown Employee'}</h3>
          <table  border: 1px solid #ddd;>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        `;
      }).join('');

      return `
        <br/>
        <h2>Role: ${role}</h2>
        ${roleHtmlContent}
      `;
    }).join('');

    // Combine HTML content for all roles
    const fullHtmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Employee Leave Details</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px;
            text-align: left;
          }
          td {
            background-color: #f2f2f2;
            color: #c0c0c0;
          }
          th {
            color: #a2a2a2 ;
            font-weight: bold;
          }
          h1{
            font-weight: bold;
            color: brown ;
        }
          h2 {
            font-weight: bold;
            color: #a2a2a2 ;
        }
        </style>
      </head>
      <body>
      <div style="border: 1px solid #d1d1d1; padding: 30px;">
        <table>
          <tr>
            <td class="logo">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgQ_m4DUpDZtd5CnGPtFUpGMXXEoPWNSVnAA&usqp=CAU" alt="Logo">
              <span class="whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white">
                <span class="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">Medi</span>
                Plus
              </span>
            </td>
            <td align="left" bgcolor="#ffe77b" style="background-color: #fff;">
              <h1 style="font-weight: 900;color: brown;">Ismail's Pvt Hospital</h1>
              <p> Masjid Rd, Puttalam 61300 <br/> 
                http://mediplus/home | mediplus@hospital.com +94 74 043 1333
              </p>
            </td>
          </tr>
        </table>
        <hr/> 
        <h1>Employee Leave Report</h1>
        ${htmlContent}
        </div>
      </body>
      </html>
    `;

    // Generate PDF from HTML content
    const pdfBuffer = await generatePdfFromHtml(fullHtmlContent);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
