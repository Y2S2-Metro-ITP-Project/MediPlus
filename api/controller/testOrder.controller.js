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
    }).populate({
      path: "DoctorId",
      select: "username",
    }
  ).populate({
    path: "testId",
    select: "name sampleType",
  }
).populate({
  path: "patientId",
  select: "name",
}
)
//.populate({
//   path: "patientId",
//   select: "name",
// }
// )
.sort({createdAt:sortDirection}).skip(startIndex).limit(limit);

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

    const testOrders = await TestOrder.find(
    ).populate({
      path: "DoctorId",
      select: "username",
    }
  ).populate({
    path: "testId",
    select: "name sampleType",
  }
).populate({
  path: "patientId",
  select: "name",
}
).sort({createdAt:sortDirection}).skip(startIndex).limit(limit);

    res.status(200).json(testOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//DELETE A TEST ORDER

  export const deleteTestOrder = async(req,res) =>{

    if (
      !req.user.isAdmin && 
      !req.user.isReceptionist &&
      !req.user.isLabTech
    ) {
      return res
        .status(403)
        .json({ message: "You are not allowed to modify these resources" });
    }

    try {
      const  {id} = req.params;

      const testOrder = await TestOrder.findByIdAndDelete(id);

      if(!testOrder){
        return res.status(404).json({message: "test order not found"});
      }

      res.status(200).json({message: "test order deleted succesfully"})
    } catch (error) {
      res.status(500).json({ message: error.message });
    }

  }
