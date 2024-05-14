import TestOrder from "../models/orderedTest.model.js";
import LabTest from "../models/labtest.model.js";
import Payment from "../models/payment.model.js";
import PaymentOrder from "../models/paymentOrder.model.js";
import Patient from "../models/patient.model.js";

import { errorHandler } from "../utils/error.js";

// CREATE A LAB ORDER

export const createTestOrder = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isLabTech &&
    !req.user.isReceptionist &&
    !req.user.isDoctor
  ) {
    return next(
      errorHandler(403, "user is not authorized to create lab orders")
    );
  }

  try {
    const DoctorId = req.params.id;
    const testId = req.body.formData.testId;
    const patientId = req.body.formData.patientId;
    const highPriority = req.body.formData.highPriority;
    const advice = req.body.formData.advice;
    const paymentComplete = req.body.formData.paymentComplete;

    const orderedTestArray = await LabTest.find({ _id: testId });

    // console.log(orderedTestArray);

    let totalPrice = 0;

    orderedTestArray.forEach((element) => {
      const temp = parseInt(element.price);
      totalPrice = totalPrice + temp;
    });

    // console.log("total sum is:", totalPrice)

    const newOrder = new TestOrder({
      testId,
      patientId,
      DoctorId,
      highPriority,
      totalPrice,
      advice,
      paymentComplete,
    });

    await newOrder.save();

    const outPatient = await Patient.findById({_id: patientId})
    const opName = outPatient.name;
    const opEmail = outPatient.contactEmail;

    const payment = await Payment.create({
      patientId: patientId,
      patientName: opName,
      patientEmail: opEmail,
      OrderType: "Laboratory",
      totalPayment: totalPrice,
      labOrderId: newOrder._id,
    });

    try {
      await createOrUpdatePaymentOrder(
        patientId,
        opName,
        opEmail,
        payment._id
      )
      
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  

    res.status(200).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET TEST ORDERS FOR COLLECTION

export const getAllTestOrdersForCollection = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isLabTech
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;

    const testOrders = await TestOrder.find({
      orderStages: "sampleCollection",
      paymentComplete: true,
    })
      .populate({
        path: "DoctorId",
        select: "username",
      })
      .populate({
        path: "testId",
        select: "name sampleType",
      })
      .populate({
        path: "patientId",
        select: "name",
      })
      //.populate({
      //   path: "patientId",
      //   select: "name",
      // }
      // )
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json(testOrders);
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
    testOrder.orderStages = "sampleCollection";

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

// GET ALL TEST ORDERS

export const getAllTestOrders = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isLabTech
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;

    const testOrders = await TestOrder.find()
      .populate({
        path: "DoctorId",
        select: "username",
      })
      .populate({
        path: "testId",
        select: "name sampleType",
      })
      .populate({
        path: "patientId",
        select: "name",
      })
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json(testOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//DELETE A TEST ORDER

export const deleteTestOrder = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isReceptionist && !req.user.isLabTech) {
    return res
      .status(403)
      .json({ message: "You are not allowed to modify these resources" });
  }

  try {
    const { id } = req.params;

    const testOrder = await TestOrder.findByIdAndDelete(id);

    if (!testOrder) {
      return res.status(404).json({ message: "test order not found" });
    }

    res.status(200).json({ message: "test order deleted succesfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET ORDERS UNIQUE TO PATIENT

export const getTestOrderByPatientId = async (req, res, next) => {
  try {
    const patientTests = await TestOrder.find({
      patientId: req.params.patientId,
    })
      .populate({
        path: "DoctorId",
        select: "username",
      })
      .populate({
        path: "testId",
        select: "name",
      });

    if (!patientTests) {
      return next(errorHandler(404, "No tests for patient with this ID"));
    }
    res.status(200).json(patientTests);
  } catch (error) {
    next(error);
  }
};

//=======================================================

const createOrUpdatePaymentOrder = async (
  patientId,
  patientName,
  patientEmail,
  paymentId,
  paymentStatus
) => {
  try {
    // Find all payment orders for the patient ID
    const paymentOrders = await PaymentOrder.find({ PatientID: patientId });

    let paymentOrder;

    if (paymentOrders.length > 0) {
      // If payment orders exist for the patient ID
      paymentOrder = paymentOrders.find((order) => order.status === "Pending");

      if (!paymentOrder) {
        // If there are no pending orders, create a new one
        paymentOrder = new PaymentOrder({
          PatientID: patientId,
          PatientName: patientName,
          PatientEmail: patientEmail,
          Payment: [paymentId],
          status: "Pending",
        });
      } else {
        // If there is a pending order, add the payment to it
        paymentOrder.Payment.push(paymentId);
      }
    } else {
      // If no payment orders exist, create a new one
      paymentOrder = new PaymentOrder({
        PatientID: patientId,
        PatientName: patientName,
        PatientEmail: patientEmail,
        Payment: [paymentId],
        Status: paymentStatus === "Pending" ? "Pending" : "Completed", // Set status based on payment status
      });
    }

    // Save the payment order
    await paymentOrder.save();

    return paymentOrder;
  } catch (error) {
    throw new Error("Failed to create or update payment order");
  }
};
