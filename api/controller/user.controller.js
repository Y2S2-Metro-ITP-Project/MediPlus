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
  if (!req.user.isAdmin && !req.user.isHRM && !req.user.isReceptionist && !req.user.isDoctor && !req.user.isNurse && !req.user.isPharmacist && !req.user.isLabTech && !req.user.isHeadNurse) {
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

export const getdoctors = async (req, res, next) => {
  try {
    // Find users where isDoctor is true
    const doctors = await User.find({ isDoctor: true });

    // Check if any doctors are found
    if (!doctors || doctors.length === 0) {
      return next(errorHandler(404, "No doctors found"));
    }

    // Send the list of doctors in the response
    res.status(200).json(doctors);
  } catch (error) {
    // Handle errors
    next(error);
  }
}

export const getPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ isOutPatient: true });
    if (!patients || patients.length === 0) {
      return res.status(404).json({ message: "No patients found" });
    }
    res.status(200).json(patients);
  } catch (error) {
    next(error);
  }
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ isDoctor: true });
    if (!doctors || doctors.length === 0) {
      return next(errorHandler(404, "No doctors found"));
    }
    res.status(200).json(doctors);
  } catch (error) {
    next(error);
  }
};


