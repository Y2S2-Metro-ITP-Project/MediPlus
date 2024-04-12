import PrescriptionOrder from "../models/PrecriptionOrder.model.js";
import Prescription from "../models/prescription.model.js";
import Inventory from "../models/inventory.model.js";
import Patient from "../models/patient.model.js";
import { Payment } from "../models/payment.model.js";
export const getPrescriptionOrderData = async (req, res) => {
  try {
    const prescriptionOrders = await PrescriptionOrder.find()
      .populate({
        path: "doctorId",
        select: "username",
      })
      .populate({
        path: "patientId",
        select: "name contactEmail contactPhone",
      });
    const totalOrders = prescriptionOrders.length;
    const totalCompletedOrders = prescriptionOrders.filter(
      (order) => order.status === "Completed"
    ).length;
    const totalPendingOrders = prescriptionOrders.filter(
      (order) => order.status === "Pending"
    ).length;
    const totalRejectedOrders = prescriptionOrders.filter(
      (order) => order.status === "Rejected"
    ).length;
    res.status(200).json({
      prescriptionOrders,
      totalOrders,
      totalCompletedOrders,
      totalPendingOrders,
      totalRejectedOrders,
    });
    console.log(prescriptionOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePrescriptionOrderData = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await PrescriptionOrder.findById(id);
    for (const prescriptionId of order.prescriptions) {
      const prescription = await Prescription.findById(prescriptionId);
      if (prescription && prescription.status === "Pending") {
        prescription.status = "Rejected";
        await prescription.save();
      }
    }
    const deletedOrder = await PrescriptionOrder.findByIdAndDelete(id);
    res.status(200).json({ deletedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePrescriptionOrderData = async (req, res) => {};

export const getPrescriptionPatientOrder = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isPharmacist) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { id } = req.params;
  try {
    const prescriptionOrders = await PrescriptionOrder.findById(id);
    res.status(200).json({ prescriptionOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

export const confirmPrescriptionOrderData = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isPharmacist) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { id } = req.params;
  try {
    const patient = await PrescriptionOrder.findById(id).populate({
      path: "patientId",
      select: "_id",
    });
    console.log(patient.patientId._id);
    const patientFind = await Patient.findById(patient.patientId._id);
    const patientName = patientFind.name;
    const patientEmail = patientFind.contactEmail;
    console.log(req.body);
    await Payment.create({
      patientId: patient.patientId._id,
      patientName: patientName,
      patientEmail: patientEmail,
      OrderType: "Pharmacy",
      totalPayment: req.body.totalPayment,
    });

    const updatedOrder = await PrescriptionOrder.findById(id);
    for (const prescriptionId of updatedOrder.prescriptions) {
      const prescription = await Prescription.findById(prescriptionId);
      if (prescription.status === "Pending") {
        await Prescription.findByIdAndUpdate(prescriptionId, {
          status: "Completed",
        });
        const itemCode = prescription.itemId;
        const inventoryItem = await Inventory.findById(itemCode);
        if (inventoryItem) {
          inventoryItem.itemQuantity -= prescription.dosage;
          await inventoryItem.save();
        }
        console.log(inventoryItem.itemQuantity);
      }
    }
    const updatedOrder1 = await PrescriptionOrder.findByIdAndUpdate(
      id,
      { status: "Completed" },
      { new: true }
    );
    res.status(200).json({ updatedOrder1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectPrescriptionOrderData = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isPharmacist) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { id } = req.params;
  try {
    const updatedOrder = await PrescriptionOrder.findByIdAndUpdate(
      id,
      { status: "Rejected" },
      { new: true }
    );
    for (const prescriptionId of updatedOrder.prescriptions) {
      await Prescription.findByIdAndUpdate(prescriptionId, {
        status: "Rejected",
      });
    }
    res.status(200).json({ updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
