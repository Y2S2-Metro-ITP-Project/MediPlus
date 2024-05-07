import User from "../models/user.model.js";
import EmployeeDetails from "../models/empdata.model.js";
import mongoose from 'mongoose';
import generatePdfFromHtml from "../utils/PatientPDF.js";

export const getAllSalary = async (req, res) => {
  try {
      const Employeesalaries = await EmployeeDetails.find()
          .populate({
              path: 'userId',
              select: 'username isAdmin isDoctor isNurse isPharmacist isReceptionist isHeadNurse isHRM isCashier isLabTech ',
              options: {
                  strict: false
              }
          })
          .select('salary consultationFee consultationN0 doctortype');

      // Calculate the Final salary for each employee
      const employeesWithFinalSalary = Employeesalaries.map(employee => {
          const { salary, consultationFee, consultationN0 } = employee;
          const finalSalary = salary + (consultationFee * consultationN0);
          return { ...employee.toObject(), Final: finalSalary };
      });

      res.json(employeesWithFinalSalary);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
}
  
  export const updateSalary = async (req, res) => {
  const { id } = req.params;
  const { salary, consultationFee } = req.body;

  try {
    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Invalid ID' });
    }

    // Find the employee details by ID
    const employeeDetails = await EmployeeDetails.findById(id);

    // Check if employee details exist
    if (!employeeDetails) {
      return res.status(404).json({ error: 'Employee details not found' });
    }

    // Update salary and consultationFee fields
    employeeDetails.salary = salary;
    employeeDetails.consultationFee = consultationFee;

    // Save the updated employee details
    await employeeDetails.save();

    // Send success response
    res.json({ message: 'Salary updated successfully', updatedSalary: employeeDetails });
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({ error: 'Failed to update salary' });
  }
}

// Define getUserRole function outside of the component
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



export const DownloadSalaryReport = async (req, res, next) => {
  try {
    const roles = req.body.roles;
    const Salary = req.body.Salary;

    // Filter employees based on roles
    const filteredEmployees = Salary.filter(employee => roles.includes(getUserRole(employee.userId)));

    let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Salary Report</title>
        <style>
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                border: 1px solid #dddddd;
                text-align: left;
                padding: 8px;
            }
            th {
                background-color: #f2f2f2;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Salary Report</h1>
        </div>
        <br/>
        <table>
            <tr>
                <th>Employee</th>
                <th>Role</th>
                ${roles.includes('Doctor') ? `<th>Type</th>` : ''}
                <th>Salary</th>
                ${roles.includes('Doctor') ? `<th>Consultation Fee</th>
                <th>Consultations</th>` : ''}
                <th>Final</th>
            </tr>
    `;

    // Iterate over filtered employees and add details to HTML content
    filteredEmployees.forEach(employee => {
      const userData = employee.userId;
      const roleDetails = getUserRole(userData);
      htmlContent += `
        <tr>
            <td>${userData.username}</td>
            <td>${roleDetails}</td>
            ${roles.includes('Doctor') ? `<td>${employee.doctortype}</td>` : ''}
            <td>${employee.salary}</td>
            ${roles.includes('Doctor') ? `
            <td>${employee.consultationFee}</td>
            <td>${employee.consultationN0}</td>` : ''}
            <td>${employee.Final}</td>
        </tr>
      `;
    });

    htmlContent += `
        </table>
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
    next(error);
  }
};
