import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/email.js";
import EmployeeDetails from "../models/empdata.model.js";
import generatePdfFromHtml from "../utils/PatientPDF.js";


// Controller function to add a new employee
export const addEMP = async (req, res, next) => {
    try {
      // Extract data from the request body
      const { username,Name, email, password, role, dateOfBirth, salary, gender, address, contactPhone, specialization, experience ,qualifications ,consultationFee ,bio,employeeimg } = req.body;
  
      // Hash the password using bcrypt.js
      const hashedPassword = await bcryptjs.hash(password, 10);
  
      // Create a new user record using the mongoose model
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword, // Store the hashed password
        [role]: true, // Set the selected role as true
        isUser: false
      });
  
      // Create a new employee details record using the EmployeeDetails model
      const newEmployeeDetails = await EmployeeDetails.create({
        userId: newUser._id, // Reference to the user ID
        dateOfBirth,
        salary,
        gender,
        address,
        contactPhone,
        specialization,
        Name,
        experience ,
        qualifications,
        consultationFee,
        bio,
        employeeimg,
      });
  
      // Send email to the new employee
      await sendEmail({
        to: email,
        subject: "Welcome to Our Company!",
        html: `
          <p>Dear ${Name},</p>
          <p>Welcome to our company! You have been successfully registered as a ${role}.</p>
          <p>Your login credentials:</p>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Password:</strong> ${password}</li>
          </ul>
          <p>Please keep this information secure.</p>
          <p>Best regards,<br>Your Company Name</p>
        `
      });
  
      // Send a success response to the client
      res.status(200).json({ message: "Employee created successfully", newUser, newEmployeeDetails });
    } catch (error) {
      // Handle any errors and pass them to the error handling middleware
      next(error);
    }
  };


  // Controller function to delete employee
export const deleteEmp = async (req, res, next) => {
    if (!(req.user.isAdmin || req.user.isHRM) && req.user.id !== req.params.userId) {
      return next(
        errorHandler(403, "You are not allowed to delete this account")
      );
    }
    try {
      const userId = req.params.userId;
      await User.findByIdAndDelete(userId);
      await EmployeeDetails.findOneAndDelete({ userId: userId });
  
      res.status(200).json({ message: "Account and details deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  export const getUser = async (req, res, next) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
  
        return next(errorHandler(404, 'User not found'));
  
      }
      const { password, ...rest } = user._doc;
      res.status(200).json(rest);
    } catch (error) {
      next(error);
    }
  
  }


  export const getemployee = async (req, res, next) => {
    try {
      // Check if the user is an admin or HR manager
      if (!req.user.isAdmin && !req.user.isHRM) {
        return next(
          errorHandler(
            403,
            "You are not allowed to access employee data"
          )
        );
      }
  
      const startIndex = parseInt(req.query.startIndex) || 0;
      const limit = parseInt(req.query.limit) || 9;
      const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;
  
      // Construct query to filter users with isAdmin or isHRM role
      const query = {
        $or: [
          { isAdmin: true },
          { isHRM: true },
          { isHeadNurse: true },
          { isNurse: true },
          { isPharmacist: true },
          { isReceptionist: true },
          { isDoctor: true }
        ]
      };
  
      // Find users based on the query
      const users = await User.find(query)
        .sort({ createdAt: sortDirection })
        .skip(startIndex)
        .limit(limit);
  
      // Remove password field from users
      const usersWithoutPassword = users.map((user) => {
        const { password, ...rest } = user._doc;
        return rest;
      });
  
      // Count total users
      const totalUser = await User.countDocuments(query);
  
      // Count users created last month
      const now = new Date();
      const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      const lastMonthUser = await User.countDocuments({
        ...query,
        createdAt: { $gte: oneMonthAgo }
      });
  
      // Send response with filtered users
      res.status(200).json({ users: usersWithoutPassword, totalUser, lastMonthUser });
    } catch (error) {
      next(error);
    }
  };


  export const getEMPById = async (req, res, next) => {
    try {
      const userId = req.params.userId;
  
      // Find the corresponding EmployeeDetails document based on the userId
      const employeeDetails = await EmployeeDetails.findOne({ userId: userId });
  
      if (!employeeDetails) {
        return res.status(404).json({ message: 'Employee details not found' });
      }
  
      // If employee details are found, return them
      return res.status(200).json({ employeeDetails });
    } catch (error) {
      console.error('Error fetching employee details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  // updateEmp function
export const updateEmp = async (req, res) => {
    const userId = req.params.userId; // Get the user ID from request parameters
    const { userData, employeeDetails, role } = req.body; // Get updated user data, employee details, and role from request body
  
    try {
      // Update user document
      await User.findByIdAndUpdate(userId, userData);
  
      // Check if user has employee details
      const existingEmployeeDetails = await EmployeeDetails.findOne({ userId });
  
      if (existingEmployeeDetails) {
        // If employee details exist, update them
        await EmployeeDetails.findOneAndUpdate({ userId }, employeeDetails);
      } else {
        // If employee details do not exist, create them
        await EmployeeDetails.create({ userId, ...employeeDetails });
      }
  
      // Update user role based on the received role value
      let updatedRole = {};
  
      // Set all role fields to false
      const allRoles = ["isAdmin", "isHRM", "isDoctor", "isNurse", "isPharmacist", "isReceptionist", "isHeadNurse"];
      allRoles.forEach(field => {
        updatedRole[field] = false;
      });
  
      // Set the selected role field to true
      switch (role) {
        case "Admin":
          updatedRole.isAdmin = true;
          break;
        case "HRM":
          updatedRole.isHRM = true;
          break;
        case "Doctor":
          updatedRole.isDoctor = true;
          break;
        case "Nurse":
          updatedRole.isNurse = true;
          break;
        case "Pharmacist":
          updatedRole.isPharmacist = true;
          break;
        case "Receptionist":
          updatedRole.isReceptionist = true;
          break;
        case "HeadNurse":
          updatedRole.isHeadNurse = true;
          break;
        default:
          // If the received role value is not recognized, do nothing
          break;
      }
  
      // Update user role in the database
      await User.findByIdAndUpdate(userId, updatedRole);
  
      // Send success response
      res.status(200).json({ message: "User details updated successfully" });
    } catch (error) {
      // If an error occurs, send error response
      console.error("Error updating user details:", error);
      res.status(500).json({ message: "Failed to update user details" });
    }
  };


  export const updateUserDetails = async (req, res) => {
    const userId = req.params.userId; // Get the user ID from request parameters
    const { userData ,role} = req.body; // Get updated user data from request body
  
    try {
      // Update user document
      await User.findByIdAndUpdate(userId, userData);
  
      // If role is provided in userData, update user role
      
        let updatedRole = {};
  
        // Set all role fields to false
        const allRoles = ["isAdmin", "isHRM", "isDoctor", "isNurse", "isPharmacist", "isReceptionist", "isHeadNurse"];
        allRoles.forEach(field => {
          updatedRole[field] = false;
        });
  
        // Set the selected role field to true
        switch (role) {
          case "Admin":
            updatedRole.isAdmin = true;
            break;
          case "HRM":
            updatedRole.isHRM = true;
            break;
          case "Doctor":
            updatedRole.isDoctor = true;
            break;
          case "Nurse":
            updatedRole.isNurse = true;
            break;
          case "Pharmacist":
            updatedRole.isPharmacist = true;
            break;
          case "Receptionist":
            updatedRole.isReceptionist = true;
            break;
          case "HeadNurse":
            updatedRole.isHeadNurse = true;
            break;
          default:
            // If the received role value is not recognized, do nothing
            break;
        
        // Update user role in the database
        await User.findByIdAndUpdate(userId, updatedRole);
      }
  
      // Send success response
      res.status(200).json({ message: "User details updated successfully" });
    } catch (error) {
      // If an error occurs, send error response
      console.error("Error updating user details:", error);
      res.status(500).json({ message: "Failed to update user details" });
    }
  };
  

  // createEmployeeDetails function
  export const createEmployeeDetails = async (req, res, next) => {
    try {
      // Extract data from the request body
      const { userId, dateOfBirth, salary, gender, address, contactPhone, specialization,  Name,
        experience ,
        qualifications,
        consultationFee,
        bio, 
        employeeimg,} = req.body;
  
      // Check if employee details already exist for the given userId
      const existingEmployeeDetails = await EmployeeDetails.findOne({ userId });
  
      if (existingEmployeeDetails) {
        // If employee details already exist, update them instead of creating a new entry
        await EmployeeDetails.findOneAndUpdate({ userId }, { dateOfBirth, salary, gender, address, contactPhone, specialization, Name,
          experience ,
          qualifications,
          consultationFee,
          bio,
          employeeimg, });
        return res.status(200).json({ message: "Employee details updated successfully" });
      }
  
      // Create a new employee details record using the EmployeeDetails model
      const newEmployeeDetails = await EmployeeDetails.create({
        userId,
        dateOfBirth,
        salary,
        gender,
        address,
        contactPhone,
        specialization,
        Name,
        experience ,
        qualifications,
        consultationFee,
        bio,
        employeeimg,
      });
  
      // Send a success response to the client
      res.status(200).json({ message: "Employee details created successfully", newEmployeeDetails });
    } catch (error) {
      // Handle any errors and pass them to the error handling middleware
      next(error);
    }
  };
  
  
  

  
  export const DownloadPDFEmployee = async (req, res, next) => {
    try {
      const employee = await EmployeeDetails.findOne({ userId: req.body.userId }).populate(
        "userId"
      );
      if (!employee) {
        return next(new Error("No employee found with this ID"));
      }
  
      const userData = employee.userId; // Access the populated user object
  
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Employee Details Report</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
              }
              h1, h2 {
                  margin-bottom: 10px;
                  color: #333;
              }
              p {
                  margin-bottom: 5px;
                  color: #666;
              }
              .section {
                  margin-bottom: 20px;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Employee Details Report</h1>
          </div>
          <div class="section">
              <h2>User ID:</h2>
              <p>${userData._id}</p> <!-- Access user ID from the populated object -->
          </div>
          <div class="section">
              <h2>Personal Information</h2>
              <p><strong>Date of Birth:</strong> ${employee.dateOfBirth}</p>
              <p><strong>Salary:</strong> ${employee.salary}</p>
              <p><strong>Gender:</strong> ${employee.gender}</p>
              <p><strong>Address:</strong> ${employee.address}</p>
              <p><strong>Contact Phone:</strong> ${employee.contactPhone}</p>
          </div>
          <div class="section">
              <h2>Specialization</h2>
              <p>${employee.specialization}</p>
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
  
  export const getDoctorDetailsById = async (req, res, next) => {
    try {
        const doctorId = req.params.doctorId;
        
        // Find the corresponding EmployeeDetails document based on the doctorId
        const doctorDetails = await EmployeeDetails.findOne({ userId: doctorId });
        
        if (!doctorDetails) {
            return res.status(404).json({ message: 'Doctor details not found' });
        }
        
        // If doctor details are found, return them
        return res.status(200).json({ doctorDetails });
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};