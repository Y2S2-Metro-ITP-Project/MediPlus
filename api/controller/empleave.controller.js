// empleave.controller.js
import Leave from "../models/empleave.model.js";
import mongoose from 'mongoose';
import { errorHandler } from "../utils/error.js";



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
              select: 'username',
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
