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

    let reportTitle = '';

    if (roles.includes('Doctor')) {
      reportTitle = 'Doctor Salary Details';
    } else if (roles.some(role => role.startsWith('Medical'))) {
      reportTitle = 'Medical Employees Salary Details';
    } else {
      reportTitle = 'General Employees Salary Details';
    }

    let currentDate = new Date().toLocaleDateString();

    let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>${reportTitle}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 800px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
            }
            h1 {
                font-weight: bold;
                color: #c0c0c0 ;
               
            }
            p {
                margin-bottom: 0;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            td {
                padding: 10px;
                text-align: left;
                color: #e4e4e4;
            }
            th {
                padding: 10px;
                text-align: left;
                background-color: #ffe77b;
                font-weight: bold;
                color: #c0c0c0;
            }
            .logo {
                display: flex;
                align-items: center;
            }
            .logo img {
                height: 50px;
                width: 50px;
                margin-right: 10px;
            }
        </style>
    </head>
    <body>
    <div style="border: 1px solid #d1d1d1; padding: 30px;">
        <div class="container">
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
            <h1 class="mt-5 mb-4">${reportTitle}</h1>
            <p class="mb-4">Report generated on: ${currentDate}</p>
            <table>
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Role</th>
                        ${roles.includes('Doctor') ? `<th>Type</th>` : ''}
                        <th>Salary</th>
                        ${roles.includes('Doctor') ? `<th>Consultation Fee</th>
                        <th>Consultations</th>` : ''}
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Iterate over filtered employees and add details to HTML content
    filteredEmployees.forEach(employee => {
      const userData = employee.userId;
      const roleDetails = getUserRole(userData);
      htmlContent += `
            <tr>
                <td>${userData.username}</td>
                <td>${roleDetails}</td>
                ${roles.includes('Doctor') ? `<td>${employee.doctortype || '-'}</td>` : ''}
                <td>${employee.salary || '-'}</td>
                ${roles.includes('Doctor') ? `
                <td>${employee.consultationFee || '-'}</td>
                <td>${employee.consultationN0 || '-'}</td>` : ''}
                <td>${employee.Final || '-'}</td>
            </tr>
      `;
    });

    htmlContent += `
                </tbody>
            </table>
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
    next(error);
  }
};
