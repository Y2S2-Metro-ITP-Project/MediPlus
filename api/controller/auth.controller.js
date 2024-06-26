import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";
import { sendEmail } from "../utils/email.js";
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    next(errorHandler(400, "All fields are required"));
  }

  const hashPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({ username, email, password: hashPassword });

  try {
    await newUser.save();
    res.json({ message: "Signup success" });
  } catch (error) {
    next(error);
  }
};

export const employeeSignUp = async (req, res, next) => {
  const { username, email, password, role } = req.body;
  console.log(req.body);
  /*if(!req.user.isAdmin && !req.user.isHRM){
    return next(errorHandler(403,"You are not allowed to access this function"));
  }*/
  if (
    !username ||
    !email ||
    !password ||
    !role ||
    username === "" ||
    email === "" ||
    password === "" ||
    role === ""
  ) {
    return next(errorHandler(400, "All fields are required"));
  }
  const hashPassword = bcryptjs.hashSync(password, 10);
  if (role === "admin") {
    return next(errorHandler(403, "You are not allowed to create an admin"));
  }
  if (role === "HRM") {
    return next(errorHandler(403, "You are not allowed to create an HRM"));
  }
  if (role === "receptionist") {
    const newReceptionist = new User({
      username,
      email,
      password: hashPassword,
      isReceptionist: true,
      isUser: false,
    });
    try {
      await newReceptionist.save();
      res.json({ message: "Signup success" });
    } catch (error) {
      next(error);
    }
  }
  if (role === "headNurse") {
    const newHeadNurse = new User({
      username,
      email,
      password: hashPassword,
      isHeadNurse: true,
      isUser: false,
    });
    try {
      await newHeadNurse.save();
      res.json({ message: "Signup success" });
    } catch (error) {
      next(error);
    }
  }
  if (role === "nurse") {
    const newNurse = new User({
      username,
      email,
      password: hashPassword,
      isNurse: true,
      isUser: false,
    });
    try {
      await newNurse.save();
      res.json({ message: "Signup success" });
    } catch (error) {
      next(error);
    }
  }
  if (role === "doctor") {
    const newDoctor = new User({
      username,
      email,
      password: hashPassword,
      isDoctor: true,
      isUser: false,
    });
    try {
      await newDoctor.save();
      res.json({ message: "Signup success" });
    } catch (error) {
      next(error);
    }
  }
  if (role === "pharmacist") {
    const newPharmacist = new User({
      username,
      email,
      password: hashPassword,
      isPharmacist: true,
      isUser: false,
    });
    try {
      await newPharmacist.save();
      res.json({ message: "Signup success" });
    } catch (error) {
      next(error);
    }
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "All fields are required"));
  }
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(400, "You are Not Registered"));
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, "Invalid Credentials"));
    }
    const token = jwt.sign(
      {
        id: validUser._id,
        isAdmin: validUser.isAdmin,
        isReceptionist: validUser.isReceptionist,
        isHRM: validUser.isHRM,
        isHeadNurse: validUser.isHeadNurse,
        isPharmacist: validUser.isPharmacist,
        isNurse: validUser.isNurse,
        isDoctor: validUser.isDoctor,
        isOutPatient: validUser.isOutPatient,
        isInPatient: validUser.isInPatient,
        isLabTech: validUser.isLabTech,
        isUser: validUser.isUser,
      },
      process.env.JWT_SECRET
    );
    const { password: pass, ...rest } = validUser._doc;
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  const { email, name, googlePhtotURL } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET
      );
      const { password: pass, ...rest } = user._doc;
      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(36).slice(-4),
        email,
        password: hashPassword,
        profilePicture: googlePhtotURL,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET
      );
      const { password: pass, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const test = (req, res) => {
  res.json({ message: "API is working!!!!!" });
};

function generateRandomPassword(length) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[{]}|;:,<.>/?";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email || email === "") {
    return next(errorHandler(400, "Email is required"));
  }
  try {
    const user = await User.findOne({ email });
    let password = generateRandomPassword(12);
    if (user) {
      const hashPassword = bcryptjs.hashSync(password, 10);
      await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            password: hashPassword,
          },
        },
        { new: true }
      );
      res.json({
        message: "Your password is successfully reset and sent to your email",
      });
    } else {
      return next(errorHandler(400, "Error in resetting password"));
    }
    if(user){
      try {
        await sendEmail({
          to: email,
          subject: "Welcome to Ismails Pvt Hospital!",
          html: `
          <p>Dear User,</p>
          <p>Your account password is successfully resetted.Here is your new password.</p>
          <ul>
            <li><strong>Password:</strong>${password}</li>
          </ul>
          <p>Please keep this information secure and change the password once you log back in.</p>
          <p>Best regards,<br>The MediPlus Team</p>
          <p>For any inquiries, please contact us at <strong> 0758 123 456</strong></p>
          <P>This is an auto-generated email. Please do not reply to this email.</p>
        `,
        });
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    next(error);
  }
};
