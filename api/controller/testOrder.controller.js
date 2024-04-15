import TestOrder from "../models/orderedTest.model.js";

import { errorHandler } from "../utils/error.js";

// CREATE A LAB ORDER

export const createTestOrder = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isLabTech && !req.user.isReceptionist) {
    return next(
      errorHandler(403, "user is not authorized to create lab orders")
    );
  }

  try {
    const DoctorId = req.params.id;
    const testId = req.body.formData.testId;
    const patientId = req.body.formData.patientId;
    const highPriority = req.body.formData.highPriority;

    const newOrder = new TestOrder({
      testId,
      patientId,
      DoctorId,
      highPriority,
    });

    await newOrder.save();
    res.status(200).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET TEST ORDERS

export const getAllTestOrders = async (req, res) => {
  try {
    const testOrders = await TestOrder.find();

    res.json(testOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH API TO UPDATE PAYMENT STATUS
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const testOrderId = req.params.id;

    const testOrder = await TestOrder.findById(testOrderId);

    if (!testOrder) {
      return res.status(404).json({ error: "Test Order Not Found" });
    }

    testOrder.paymentComplete = true;
    testOrder.orderStages="sampleCollection";

    await testOrder.save();
    res.json(testOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH API TO UPDATE PRIORITY STATUS
export const updatePriorityStatus = async (req, res, next) => {
  try {
    const testOrderId = req.params.id;

    const testOrder = await TestOrder.findById(testOrderId);

    if (!testOrder) {
      return res.status(404).json({ error: "Test Order Not Found" });
    }

    testOrder.highPriority = true;
    

    await testOrder.save();
    res.json(testOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
