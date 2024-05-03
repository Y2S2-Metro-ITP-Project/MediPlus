import Inquiry from "../models/inquiry.model.js";
import { errorHandler } from "../utils/error.js";
import { sendEmail } from "../utils/email.js";
export const submit = async (req, res, next) => {
  const { name, email, phone, message, userid } = req.body;
  if (
    !name ||
    !email ||
    !phone ||
    !message ||
    name === "" ||
    email === "" ||
    phone === "" ||
    message === ""
  ) {
    next(errorHandler(400, "All fields are required"));
  }
  const newInquiry = new Inquiry({
    name,
    email,
    phone,
    message,
    userId: userid,
  });
  try {
    await newInquiry.save();
    res.json({ message: "Inquiry submitted Successfully." });
  } catch (error) {
    next(error);
  }
  try {
    await sendEmail({
      to: email,
      subject: "Welcome to Ismails Pvt Hospital!",
      html: ` 
      <p>Dear ${name},</p>
      <p>Your inquiry has been successfully submitted. Here is a summary of your message:</p>
      <blockquote style="background-color: #f2f2f2; border-left: 5px solid #3498db; padding: 10px 20px; margin: 0; font-family: Arial, sans-serif; font-size: 16px;">
      <p style="margin: 0;">${message}</p>
    </blockquote>
      <p>We will get back to you immediately.</p>
      <p>Best regards,<br>MediPlus Team</p>
      <p>For any inquiries, please contact us at <strong> 0758 123 456</strong></p>
      <P>This is an auto-generated email. Please do not reply to this email.</p>
    `,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getInquiries = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isReceptionist &&
    !req.user.isUser &&
    !req.user.isHeadNurse
  ) {
    return next(
      errorHandler(403, "You are not allowed to access these resources")
    );
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;
    const inquiries = await Inquiry.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalInquiries = await Inquiry.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthInquiries = await Inquiry.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    const totalAnswered = await Inquiry.countDocuments({ isAnswer: true });
    const totalAnsweredOneMonth = await Inquiry.countDocuments({
      isAnswer: true,
      createdAt: { $gte: oneMonthAgo },
    });
    const totalNotAnsweredOneMonth = await Inquiry.countDocuments({
      isAnswer: false,
      createdAt: { $gte: oneMonthAgo },
    });
    const totalNotAnswered = await Inquiry.countDocuments({ isAnswer: false });
    res.status(200).json({
      inquiries,
      totalInquiries,
      lastMonthInquiries,
      totalAnswered,
      totalNotAnswered,
      totalAnsweredOneMonth,
      totalNotAnsweredOneMonth,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isReceptionist &&
    !req.user.isUser &&
    !req.user.isHeadNurse
  ) {
    return next(
      errorHandler(403, "You are not allowed to delete these resources")
    );
  }
  try {
    await Inquiry.findByIdAndDelete(req.params.inquiryId);
    res.status(200).json({ message: "Inquiry deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateInquiry = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isReceptionist &&
    req.user.id !== req.params.inquiryId
  ) {
    return next(
      errorHandler(403, "You are not allowed to update these resources")
    );
  }
  try {
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.inquiryId,
      {
        $set: {
          isAnswer: true,
          reply: req.body.reply,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedInquiry);
  } catch (error) {
    next(error);
  }
};

export const searchInquiry = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isReceptionist &&
    !req.user.isUser &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return next(
      errorHandler(403, "You are not allowed to access these resources")
    );
  }
  try {
    const searchTerm = req.body.search;
    const inquiries = await Inquiry.find({
      $or: [{ name: { $regex: new RegExp(searchTerm, "i") } }],
    });
    if (!inquiries || inquiries.length === 0) {
      return next(errorHandler(404, "Inquiry not found"));
    }
    res.status(200).json(inquiries);
  } catch (error) {
    next(error);
  }
};

export const filterInquiry = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isReceptionist &&
    !req.user.isUser &&
    !req.user.isHeadNurse
  ) {
    return next(
      errorHandler(403, "You are not allowed to access these resources")
    );
  }
  try {
    const { filterOption } = req.body;
    let query = {};
    if (filterOption === "answer") {
      query = { isAnswer: true };
    } else if (filterOption === "notanswer") {
      query = { isAnswer: false };
    } else {
      query = {};
    }
    const inquiries = await Inquiry.find(query);
    if (!inquiries || inquiries.length === 0) {
      return next(errorHandler(404, "Inquiries not found"));
    }
    res.status(200).json(inquiries);
  } catch (error) {
    next(error);
  }
};

export const getUserInquiry = async (req, res, next) => {
  if (
    !req.user &&
    !req.user.isAdmin &&
    !req.user.isReceptionist &&
    !req.user.isUser &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return next(
      errorHandler(403, "You are not allowed to access these resources")
    );
  }
  try {
    const userId = req.params.userId;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;

    const inquiries = await Inquiry.find({ userId })
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalInquiries = await Inquiry.countDocuments({ userId });

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthInquiries = await Inquiry.countDocuments({
      userId,
      createdAt: { $gte: oneMonthAgo },
    });
    const totalAnswered = await Inquiry.countDocuments({
      userId,
      isAnswer: true,
    });
    const totalAnsweredOneMonth = await Inquiry.countDocuments({
      userId,
      isAnswer: true,
      createdAt: { $gte: oneMonthAgo },
    });
    const totalNotAnsweredOneMonth = await Inquiry.countDocuments({
      userId,
      isAnswer: false,
      createdAt: { $gte: oneMonthAgo },
    });
    const totalNotAnswered = await Inquiry.countDocuments({
      userId,
      isAnswer: false,
    });

    res.status(200).json({
      inquiries,
      totalInquiries,
      lastMonthInquiries,
      totalAnswered,
      totalNotAnswered,
      totalAnsweredOneMonth,
      totalNotAnsweredOneMonth,
    });
  } catch (error) {
    next(error);
  }
};

export const filterUserInquiry = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isReceptionist &&
    !req.user.isUser &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return next(
      errorHandler(403, "You are not allowed to access these resources")
    );
  }
  try {
    const userId = req.params.userId;
    const { filterOption } = req.body;
    let query = {};
    if (filterOption === "answer") {
      query = { isAnswer: true, userId };
    } else if (filterOption === "notanswer") {
      query = { isAnswer: false, userId };
    } else {
      query = {};
    }
    const inquiries = await Inquiry.find(query);
    if (!inquiries || inquiries.length === 0) {
      return next(errorHandler(404, "Inquiries not found"));
    }
    res.status(200).json(inquiries);
  } catch (err) {
    console.error("Error filtering inquiries:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const searchUserInquiries = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isReceptionist &&
    !req.user.isUser &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return next(
      errorHandler(403, "You are not allowed to access these resources")
    );
  }
  try {
    const userId = req.params.userId;
    const searchTerm = req.body.searchTerm;
    console.log(req.body);
    const inquiries = await Inquiry.find({
      userId,
      $or: [{ name: { $regex: new RegExp(searchTerm, "i") } }],
    });
    if (!inquiries || inquiries.length === 0) {
      return next(errorHandler(404, "Inquiry not found"));
    }
    res.status(200).json(inquiries);
  } catch (error) {
    next(error);
  }
}