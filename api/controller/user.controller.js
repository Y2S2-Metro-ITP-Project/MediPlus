import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bdcrpytjs from "bcryptjs";
export const test = (req, res) => {
  res.json({ message: "API is working!!!!!" });
};

export const signout = (req, res, next) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Signout success" });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(
      errorHandler(403, "You are not allowed to perform this action")
    );
  }
  if (req.body.password) {
    if (req.body.password.lenght < 6) {
      return next(
        errorHandler(403, "Password must be at least 6 characters long")
      );
    }
    req.body.password = bdcrpytjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(
        errorHandler(403, "Username must be between 7 and 20 characters long")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(403, "Username must not contain spaces"));
    }

    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(403, "Username must be in lowercase"));
    }

    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(403, "Username must contain only letters and numbers")
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!(req.user.isAdmin || req.user.isHRM) && req.user.id !== req.params.userId) {
    return next(
      errorHandler(403, "You are not allowed to delete this account")
    );
  }

  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};


export const getusers = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isHRM) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access all the user of the database"
      )
    );
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;
    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const usersWithourPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });
    const totalUser = await User.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUser = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res
      .status(200)
      .json({ users: usersWithourPassword, totalUser, lastMonthUser });
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





import bcryptjs from "bcryptjs";

// Controller function to add a new employee
export const addEMP = async (req, res, next) => {
  try {
    // Extract data from the request body
    const { username, email, password, role } = req.body;

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

    // Send a success response to the client
    res.status(201).json({ message: "Employee created successfully", newUser });
  } catch (error) {
    // Handle any errors and pass them to the error handling middleware
};
}

export const filterUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access all the users of the database"
      )
    );
  }

  const filterOption = req.body.filterOption;

  try {
    let users;
    switch (filterOption) {
      case "user":
        users = await User.find({ isUser: true });
        break;
      case "outPatients":
        users = await User.find({ isOutPatient: true });
        break;
      case "inPatients":
        users = await User.find({ isInPatient: true });
        break;
      case "doctor":
        users = await User.find({ isDoctor: true });
        break;
      case "nurse":
        users = await User.find({ isNurse: true });
        break;
      case "hrManager":
        users = await User.find({ isHRM: true });
        break;
      case "labTechnician":
        users = await User.find({ isLabTech: true });
        break;
      case "pharmacist":
        users = await User.find({ isPharmacist: true });
        break;
      case "receptionist":
        users = await User.find({ isReceptionist: true });
        break;
      default:
        return next(
          errorHandler(
            400,
            "Invalid filter option provided. Please provide a valid filter option."
          )
        );
    }
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

  
// Controller function to update employee information
export const updateEmp = async (req, res, next) => {
  // Check if the user performing the action is an admin or HRM
  if (!req.user.isAdmin && !req.user.isHRM) {
    return next(
      errorHandler(403, "You are not allowed to update this user's information")
    );
  }

  // Validate and update user information
  try {
    // Hash the password if provided in the request body
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return next(
          errorHandler(403, "Password must be at least 6 characters long")
        );
      }
      req.body.password = await bcryptjs.hash(req.body.password, 10);
    }

    // Validate username
    if (req.body.username) {
      if (req.body.username.length < 7 || req.body.username.length > 20) {
        return next(
          errorHandler(403, "Username must be between 7 and 20 characters long")
        );
      }
      if (req.body.username.includes(" ")) {
        return next(errorHandler(403, "Username must not contain spaces"));
      }
      if (req.body.username !== req.body.username.toLowerCase()) {
        return next(errorHandler(403, "Username must be in lowercase"));
      }
      if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
        return next(
          errorHandler(403, "Username must contain only letters and numbers")
        );
      }
    }

    // Retrieve user's current roles
    const currentUser = await User.findById(req.params.userId);
    const currentRoles = {
      isAdmin: currentUser.isAdmin,
      isHRM: currentUser.isHRM,
      isDoctor: currentUser.isDoctor,
      isNurse: currentUser.isNurse,
      isPharmacist: currentUser.isPharmacist,
      isReceptionist: currentUser.isReceptionist,
      isHeadNurse: currentUser.isHeadNurse,
      // Add more roles here if needed
    };

    // Update user's information
    const updatedUserData = {
      username: req.body.username,
      email: req.body.email,
      profilePicture: req.body.profilePicture,
      password: req.body.password, // Use the hashed password
      // If a role is being updated, set all other roles to false
      ...req.body.role && Object.keys(currentRoles).reduce((acc, key) => {
        acc[key] = key === req.body.role;
        return acc;
      }, {}),
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updatedUserData },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access all the users of the database"
      )
    );
  }
  const searchTerm = req.body.search;
  try {
    const users = await User.find({
      $or: [
        { username: { $regex: new RegExp(searchTerm, "i") } },
        { email: { $regex: new RegExp(searchTerm, "i") } },
      ],
    });
    if (!users || users.length === 0) {
      return next(errorHandler(404, "User not found"));
    }
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

