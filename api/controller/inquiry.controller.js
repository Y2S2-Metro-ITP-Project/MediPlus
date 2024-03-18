import Inquiry from "../models/inquiry.model.js";
import { errorHandler } from "../utils/error.js";
export const submit = async (req, res, next) => {
  const { name, email, phone, message, userid } = req.body;
  console.log(req.body);
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
};

export const getInquiries = async (req, res, next) => {
  if (!req.user.isAdmin) {
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
    res.status(200).json({ inquiries, totalInquiries, lastMonthInquiries });
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.inquiryId) {
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
  if (!req.user.isAdmin && req.user.id !== req.params.inquiryId) {
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
  if (!req.user.isAdmin && req.user.id !== req.params.inquiryId) {
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
  if (!req.user.isAdmin) {
    return next(
      errorHandler(403, "You are not allowed to access these resources")
    );
  }
  try {
    const { filterOption } = req.body;
    console.log(filterOption);
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
