import TestOrder from "../models/orderedTest.model.js";

import { errorHandler } from "../utils/error.js";

// CREATE A LAB ORDER

export const createTestOrder = async (req, res) => {
  const {
    testId,
    patientId,
    highPriority,
    paymentComplete,
    orderStages,
    orderCompletionTime,
    totalPrice,
  } = req.body;

  if (
    !testId ||
    !patientId ||
    !highPriority ||
    !paymentComplete ||
    !orderStages ||
    !orderCompletionTime ||
    !totalPrice
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newOrder = new TestOrder({
    testId,
    patientId,
    highPriority,
    paymentComplete,
    orderStages,
    orderCompletionTime,
    totalPrice,
  });

  try {
    await newOrder.save();
    res.status(200).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET TEST ORDERS


