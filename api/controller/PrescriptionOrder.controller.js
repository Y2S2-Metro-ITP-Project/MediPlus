import PrescriptionOrder from "../models/PrecriptionOrder.model.js";
import Prescription from "../models/prescription.model.js";
import Inventory from "../models/inventory.model.js";
import Patient from "../models/patient.model.js";
import Payment from "../models/payment.model.js";
import generatePdfFromHtml from "../utils/PatientPDF.js";
import PaymentOrder from "../models/paymentOrder.model.js";
import { set } from "mongoose";
export const getPrescriptionOrderData = async (req, res, next) => {
  try {
    const prescriptionOrders1 = await PrescriptionOrder.find()
      .populate({
        path: "doctorId",
        select: "username",
      })
      .populate({
        path: "patientId",
        select: "name contactEmail contactPhone patientType",
      })
      .populate({
        path: "payment",
        select:
          "totalPayment status OrderType dateAndTime patientName patientEmail paymentType",
      });
    const prescriptionOrders = prescriptionOrders1.filter(
      (order) => order.patientId.patientType === "Outpatient"
    );
    console.log(prescriptionOrders);
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInPrescriptionOrderData = async (req, res, next) => {
  try {
    const prescriptionOrders1 = await PrescriptionOrder.find()
      .populate({
        path: "doctorId",
        select: "username",
      })
      .populate({
        path: "patientId",
        populate: {
          path: "bed",
          populate: {
            path: "ward",
            model: "Ward", // Assuming the name of the ward model is "Ward"
          },
        },
      })
      .populate({
        path: "payment",
        select:
          "totalPayment status OrderType dateAndTime patientName patientEmail paymentType",
      });

    // Filter prescriptionOrders based on patientType
    const prescriptionOrders = prescriptionOrders1.filter(
      (order) => order.patientId.patientType === "Inpatient"
    );
    console.log(prescriptionOrders);
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
    const prescriptionOrders = await PrescriptionOrder.findById(id)
      .populate("patientId")
      .populate("doctorId")
      .populate({
        path: "prescriptions",
        populate: { path: "itemId" },
      });
    res.status(200).json({ prescriptionOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

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
// ====================================necessary for payment lab =========
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
    const patientFind = await Patient.findById(patient.patientId._id);
    const patientName = patientFind.name;
    const patientEmail = patientFind.contactEmail;
    const payment = await Payment.create({
      patientId: patient.patientId._id,
      patientName: patientName,
      patientEmail: patientEmail,
      OrderType: "Pharmacy",
      totalPayment: req.body.totalPayment,
    });

    try {
      await createOrUpdatePaymentOrder(
        patient.patientId._id,
        patientName,
        patientEmail,
        payment._id
      );
    } catch (error) {
      res.status(500).json({ message: error.message });
    }

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
      { status: "Completed", payment: payment._id },
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

export const fullOrderRejection = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isPharmacist) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { id } = req.params;
  try {
    const updatedOrder = await PrescriptionOrder.findById(id);
    for (const prescriptionId of updatedOrder.prescriptions) {
      const prescription = await Prescription.findById(prescriptionId);
      await Prescription.findByIdAndUpdate(prescriptionId, {
        status: "Rejected",
      });
      const itemCode = prescription.itemId;
      const inventoryItem = await Inventory.findById(itemCode);
      if (inventoryItem) {
        inventoryItem.itemQuantity += prescription.dosage;
        await inventoryItem.save();
      }
      console.log(inventoryItem.itemQuantity);
    }
    const updatedOrder1 = await PrescriptionOrder.findByIdAndUpdate(
      id,
      { status: "Rejected" },
      { new: true }
    );
    res.status(200).json({ updatedOrder1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadPatientOrderData = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }

  const userId = req.params.id;

  try {
    const prescriptionOrders = await PrescriptionOrder.find({
      patientId: userId,
    })
      .populate("doctorId", "username")
      .populate("patientId", "name")
      .populate("payment", "status totalPayment");

    let htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <title>Patient Prescription Order Report</title>
              <style>
                  body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                  }
                  .section {
                    margin-bottom: 20px;
                    border: 1px solid #ccc;
                    padding: 15px;
                    border-radius: 10px;
                  }
                  .section h2 {
                    color: #555;
                    margin-bottom: 10px;
                  }
                  .section p {
                    color: #666;
                    margin-bottom: 5px;
                  }
                  .section p strong {
                    color: #333;
                  }
                  .status-pending {
                    color: orange;
                  }
                  .status-rejected {
                    color: red;
                  }
                  .status-completed {
                    color: green;
                  }
              </style>
          </head>
          <body>
        `;

    let prevDate = null;
    for (const order of prescriptionOrders) {
      const { date, prescriptions, payment, doctorId, patientId } = order;
      const formattedDate = new Date(date).toLocaleString();

      if (formattedDate !== prevDate) {
        htmlContent += `
              <div class="section">
                <h2>Date: ${formattedDate}</h2>
                <p><strong>Doctor who Prescribed:</strong> ${
                  doctorId ? doctorId.username : "N/A"
                }</p>
                <p><strong>Prescriptions:</strong></p>
                <ul>
            `;

        for (const prescriptionId of prescriptions) {
          const prescription = await Prescription.findById(
            prescriptionId
          ).exec();
          if (!prescription) continue;

          const {
            medicine,
            dosage,
            dosageType,
            route,
            frequency,
            duration,
            foodRelation,
            instructions,
          } = prescription;
          htmlContent += `
                <li>
                  <p><strong>Medicine:</strong> ${medicine}</p>
                  <p><strong>Dosage:</strong> ${dosage}</p>
                  <p><strong>Dosage Type:</strong> ${dosageType}</p>
                  <p><strong>Route:</strong> ${route}</p>
                  <p><strong>Frequency:</strong> ${frequency} Times per Day</p>
                  <p><strong>Duration:</strong> ${duration} Days</p>
                  <p><strong>Food Relation:</strong> ${foodRelation}</p>
                  <p><strong>Instructions:</strong> ${instructions}</p>
                </li>
              `;
        }

        htmlContent += `
                </ul>
          `;
      }

      if (payment) {
        htmlContent += `
            <p><strong>Payment Status:</strong> <span class="status-${payment.status.toLowerCase()}">${
          payment.status
        }</span></p>
            <p><strong>Total Payment:</strong> ${payment.totalPayment}</p>
          `;
      } else {
        htmlContent += `
            <p><strong>Payment Status:</strong> <span class="status-pending">Pending</span></p>
            <p><strong>Total Payment:</strong> N/A</p>
          `;
      }

      htmlContent += `</div>`;
      prevDate = formattedDate;
    }

    htmlContent += `</body></html>`;

    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `attachment; filename="patient-prescription-order-report.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadPatientOrderDateData = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }

  const selectedDate = req.body.date;
  console.log(selectedDate);
  const isoDate = new Date(selectedDate).toISOString();

  // Extract year, month, and day from the ISODate
  const year = new Date(isoDate).getFullYear();
  const month = new Date(isoDate).getMonth() + 1; // Months are 0-indexed in JavaScript, so add 1
  const day = new Date(isoDate).getDate();

  try {
    const prescriptionOrders1 = await PrescriptionOrder.find({
      date: {
        $gte: new Date(year, month - 1, day),
        $lt: new Date(year, month - 1, day + 1),
      },
    })
      .populate("doctorId", "username")
      .populate("patientId", "name patientType") // Include patientType in the population
      .populate("payment", "status totalPayment");

    // Filter outpatients
    const prescriptionOrders = prescriptionOrders1.filter((order) => {
      return order.patientId.patientType.toLowerCase() === "outpatient";
    });

    let htmlContent = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <title>Patient Prescription Order Report</title>
                  <style>
                      body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                      }
                      .section {
                        margin-bottom: 20px;
                        border: 1px solid #ccc;
                        padding: 15px;
                        border-radius: 10px;
                      }
                      .section h2 {
                        color: #555;
                        margin-bottom: 10px;
                      }
                      .section p {
                        color: #666;
                        margin-bottom: 5px;
                      }
                      .section p strong {
                        color: #333;
                      }
                      .status-pending {
                        color: orange;
                      }
                      .status-rejected {
                        color: red;
                      }
                      .status-completed {
                        color: green;
                      }
                  </style>
              </head>
              <body>
            `;

    let prevDate = null;
    for (const order of prescriptionOrders) {
      const { date, prescriptions, payment, doctorId, patientId } = order;
      const formattedDate = new Date(date).toLocaleString();

      if (formattedDate !== prevDate) {
        htmlContent += `
                  <div class="section">
                    <h2>Date: ${formattedDate}</h2>
                    <p><strong>Doctor who Prescribed:</strong> ${
                      doctorId ? doctorId.username : "N/A"
                    }</p>
                    <p><strong>Patient:</strong> ${
                      patientId ? patientId.name : "N/A"
                    }</p>
                    <p><strong>Prescriptions:</strong></p>
                    <ul>
                `;

        for (const prescriptionId of prescriptions) {
          const prescription = await Prescription.findById(
            prescriptionId
          ).exec();
          if (!prescription) continue;

          const {
            medicine,
            dosage,
            dosageType,
            route,
            frequency,
            duration,
            foodRelation,
            instructions,
          } = prescription;
          htmlContent += `
                    <li>
                      <p><strong>Medicine:</strong> ${medicine}</p>
                      <p><strong>Dosage:</strong> ${dosage}</p>
                      <p><strong>Dosage Type:</strong> ${dosageType}</p>
                      <p><strong>Route:</strong> ${route}</p>
                      <p><strong>Frequency:</strong> ${frequency} Times per Day</p>
                      <p><strong>Duration:</strong> ${duration} Days</p>
                      <p><strong>Food Relation:</strong> ${foodRelation}</p>
                      <p><strong>Instructions:</strong> ${instructions}</p>
                    </li>
                  `;
        }

        htmlContent += `
                    </ul>
              `;
      }

      if (payment) {
        htmlContent += `
                <p><strong>Payment Status:</strong> <span class="status-${payment.status.toLowerCase()}">${
          payment.status
        }</span></p>
                <p><strong>Total Payment:</strong> ${payment.totalPayment}</p>
              `;
      } else {
        htmlContent += `
                <p><strong>Payment Status:</strong> <span class="status-pending">Pending</span></p>
                <p><strong>Total Payment:</strong> N/A</p>
              `;
      }

      htmlContent += `</div>`;
      prevDate = formattedDate;
    }

    htmlContent += `</body></html>`;

    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `attachment; filename="patient-prescription-order-report.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadInPatientOrderDateData = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }

  const selectedDate = req.body.date;
  console.log(selectedDate);
  const isoDate = new Date(selectedDate).toISOString();

  // Extract year, month, and day from the ISODate
  const year = new Date(isoDate).getFullYear();
  const month = new Date(isoDate).getMonth() + 1; // Months are 0-indexed in JavaScript, so add 1
  const day = new Date(isoDate).getDate();

  try {
    const prescriptionOrders1 = await PrescriptionOrder.find({
      date: {
        $gte: new Date(year, month - 1, day),
        $lt: new Date(year, month - 1, day + 1),
      },
    })
      .populate("doctorId", "username")
      .populate("patientId", "name patientType") // Include patientType in the population
      .populate("payment", "status totalPayment");

    // Filter outpatients
    const prescriptionOrders = prescriptionOrders1.filter((order) => {
      return order.patientId.patientType.toLowerCase() === "inpatient";
    });

    let htmlContent = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <title>Patient Prescription Order Report</title>
                  <style>
                      body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                      }
                      .section {
                        margin-bottom: 20px;
                        border: 1px solid #ccc;
                        padding: 15px;
                        border-radius: 10px;
                      }
                      .section h2 {
                        color: #555;
                        margin-bottom: 10px;
                      }
                      .section p {
                        color: #666;
                        margin-bottom: 5px;
                      }
                      .section p strong {
                        color: #333;
                      }
                      .status-pending {
                        color: orange;
                      }
                      .status-rejected {
                        color: red;
                      }
                      .status-completed {
                        color: green;
                      }
                  </style>
              </head>
              <body>
            `;

    let prevDate = null;
    for (const order of prescriptionOrders) {
      const { date, prescriptions, payment, doctorId, patientId } = order;
      const formattedDate = new Date(date).toLocaleString();

      if (formattedDate !== prevDate) {
        htmlContent += `
                  <div class="section">
                    <h2>Date: ${formattedDate}</h2>
                    <p><strong>Doctor who Prescribed:</strong> ${
                      doctorId ? doctorId.username : "N/A"
                    }</p>
                    <p><strong>Patient:</strong> ${
                      patientId ? patientId.name : "N/A"
                    }</p>
                    <p><strong>Prescriptions:</strong></p>
                    <ul>
                `;

        for (const prescriptionId of prescriptions) {
          const prescription = await Prescription.findById(
            prescriptionId
          ).exec();
          if (!prescription) continue;

          const {
            medicine,
            dosage,
            dosageType,
            route,
            frequency,
            duration,
            foodRelation,
            instructions,
          } = prescription;
          htmlContent += `
                    <li>
                      <p><strong>Medicine:</strong> ${medicine}</p>
                      <p><strong>Dosage:</strong> ${dosage}</p>
                      <p><strong>Dosage Type:</strong> ${dosageType}</p>
                      <p><strong>Route:</strong> ${route}</p>
                      <p><strong>Frequency:</strong> ${frequency} Times per Day</p>
                      <p><strong>Duration:</strong> ${duration} Days</p>
                      <p><strong>Food Relation:</strong> ${foodRelation}</p>
                      <p><strong>Instructions:</strong> ${instructions}</p>
                    </li>
                  `;
        }

        htmlContent += `
                    </ul>
              `;
      }

      if (payment) {
        htmlContent += `
                <p><strong>Payment Status:</strong> <span class="status-${payment.status.toLowerCase()}">${
          payment.status
        }</span></p>
                <p><strong>Total Payment:</strong> ${payment.totalPayment}</p>
              `;
      } else {
        htmlContent += `
                <p><strong>Payment Status:</strong> <span class="status-pending">Pending</span></p>
                <p><strong>Total Payment:</strong> N/A</p>
              `;
      }

      htmlContent += `</div>`;
      prevDate = formattedDate;
    }

    htmlContent += `</body></html>`;

    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `attachment; filename="patient-prescription-order-report.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadDoctorOrderReport = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }
  try {
    const prescriptionOrders1 = await PrescriptionOrder.find({
      doctorId: req.params.id,
    })
      .populate("doctorId", "username")
      .populate("patientId", "name patientType") // Include patientType in the population
      .populate("payment", "status totalPayment");

    // Filter outpatients
    const prescriptionOrders = prescriptionOrders1.filter((order) => {
      return order.patientId.patientType.toLowerCase() === "outpatient";
    });

    let htmlContent = `
                  <!DOCTYPE html>
                  <html lang="en">
                  <head>
                      <meta charset="UTF-8">
                      <title>Patient Prescription Order Report</title>
                      <style>
                          body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                          }
                          .section {
                            margin-bottom: 20px;
                            border: 1px solid #ccc;
                            padding: 15px;
                            border-radius: 10px;
                          }
                          .section h2 {
                            color: #555;
                            margin-bottom: 10px;
                          }
                          .section p {
                            color: #666;
                            margin-bottom: 5px;
                          }
                          .section p strong {
                            color: #333;
                          }
                          .status-pending {
                            color: orange;
                          }
                          .status-rejected {
                            color: red;
                          }
                          .status-completed {
                            color: green;
                          }
                      </style>
                  </head>
                  <body>
                  <div class="header">
                  <h1>Patient Precription Order Report</h1>
                  <h2>Doctor:${req.body.seleactedDoctor.label}</h2>
              </div>
                `;

    let prevDate = null;
    for (const order of prescriptionOrders) {
      const { date, prescriptions, payment, doctorId, patientId } = order;
      const formattedDate = new Date(date).toLocaleString();

      if (formattedDate !== prevDate) {
        htmlContent += `
                      <div class="section">
                        <h2>Date: ${formattedDate}</h2>
                        <p><strong>Doctor who Prescribed:</strong> ${
                          doctorId ? doctorId.username : "N/A"
                        }</p>
                        <p><strong>Patient:</strong> ${
                          patientId ? patientId.name : "N/A"
                        }</p>
                        <p><strong>Prescriptions:</strong></p>
                        <ul>
                    `;

        for (const prescriptionId of prescriptions) {
          const prescription = await Prescription.findById(
            prescriptionId
          ).exec();
          if (!prescription) continue;

          const {
            medicine,
            dosage,
            dosageType,
            route,
            frequency,
            duration,
            foodRelation,
            instructions,
          } = prescription;
          htmlContent += `
                        <li>
                          <p><strong>Medicine:</strong> ${medicine}</p>
                          <p><strong>Dosage:</strong> ${dosage}</p>
                          <p><strong>Dosage Type:</strong> ${dosageType}</p>
                          <p><strong>Route:</strong> ${route}</p>
                          <p><strong>Frequency:</strong> ${frequency} Times per Day</p>
                          <p><strong>Duration:</strong> ${duration} Days</p>
                          <p><strong>Food Relation:</strong> ${foodRelation}</p>
                          <p><strong>Instructions:</strong> ${instructions}</p>
                        </li>
                      `;
        }

        htmlContent += `
                        </ul>
                  `;
      }

      if (payment) {
        htmlContent += `
                    <p><strong>Payment Status:</strong> <span class="status-${payment.status.toLowerCase()}">${
          payment.status
        }</span></p>
                    <p><strong>Total Payment:</strong> ${
                      payment.totalPayment
                    }</p>
                  `;
      } else {
        htmlContent += `
                    <p><strong>Payment Status:</strong> <span class="status-pending">Pending</span></p>
                    <p><strong>Total Payment:</strong> N/A</p>
                  `;
      }

      htmlContent += `</div>`;
      prevDate = formattedDate;
    }

    htmlContent += `</body></html>`;

    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `attachment; filename="patient-prescription-order-report.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadInDoctorOrderReport = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isDoctor &&
    !req.user.isNurse &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isOutPatient &&
    !req.user.isInPatient
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to access these resources" });
  }
  try {
    const prescriptionOrders1 = await PrescriptionOrder.find({
      doctorId: req.params.id,
    })
      .populate("doctorId", "username")
      .populate("patientId", "name patientType") // Include patientType in the population
      .populate("payment", "status totalPayment");

    // Filter outpatients
    const prescriptionOrders = prescriptionOrders1.filter((order) => {
      return order.patientId.patientType.toLowerCase() === "inpatient";
    });

    let htmlContent = `
                  <!DOCTYPE html>
                  <html lang="en">
                  <head>
                      <meta charset="UTF-8">
                      <title>Patient Prescription Order Report</title>
                      <style>
                          body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                          }
                          .section {
                            margin-bottom: 20px;
                            border: 1px solid #ccc;
                            padding: 15px;
                            border-radius: 10px;
                          }
                          .section h2 {
                            color: #555;
                            margin-bottom: 10px;
                          }
                          .section p {
                            color: #666;
                            margin-bottom: 5px;
                          }
                          .section p strong {
                            color: #333;
                          }
                          .status-pending {
                            color: orange;
                          }
                          .status-rejected {
                            color: red;
                          }
                          .status-completed {
                            color: green;
                          }
                      </style>
                  </head>
                  <body>
                  <div class="header">
                  <h1>Patient Precription Order Report</h1>
                  <h2>Doctor:${req.body.seleactedDoctor.label}</h2>
              </div>
                `;

    let prevDate = null;
    for (const order of prescriptionOrders) {
      const { date, prescriptions, payment, doctorId, patientId } = order;
      const formattedDate = new Date(date).toLocaleString();

      if (formattedDate !== prevDate) {
        htmlContent += `
                      <div class="section">
                        <h2>Date: ${formattedDate}</h2>
                        <p><strong>Doctor who Prescribed:</strong> ${
                          doctorId ? doctorId.username : "N/A"
                        }</p>
                        <p><strong>Patient:</strong> ${
                          patientId ? patientId.name : "N/A"
                        }</p>
                        <p><strong>Prescriptions:</strong></p>
                        <ul>
                    `;

        for (const prescriptionId of prescriptions) {
          const prescription = await Prescription.findById(
            prescriptionId
          ).exec();
          if (!prescription) continue;

          const {
            medicine,
            dosage,
            dosageType,
            route,
            frequency,
            duration,
            foodRelation,
            instructions,
          } = prescription;
          htmlContent += `
                        <li>
                          <p><strong>Medicine:</strong> ${medicine}</p>
                          <p><strong>Dosage:</strong> ${dosage}</p>
                          <p><strong>Dosage Type:</strong> ${dosageType}</p>
                          <p><strong>Route:</strong> ${route}</p>
                          <p><strong>Frequency:</strong> ${frequency} Times per Day</p>
                          <p><strong>Duration:</strong> ${duration} Days</p>
                          <p><strong>Food Relation:</strong> ${foodRelation}</p>
                          <p><strong>Instructions:</strong> ${instructions}</p>
                        </li>
                      `;
        }

        htmlContent += `
                        </ul>
                  `;
      }

      if (payment) {
        htmlContent += `
                    <p><strong>Payment Status:</strong> <span class="status-${payment.status.toLowerCase()}">${
          payment.status
        }</span></p>
                    <p><strong>Total Payment:</strong> ${
                      payment.totalPayment
                    }</p>
                  `;
      } else {
        htmlContent += `
                    <p><strong>Payment Status:</strong> <span class="status-pending">Pending</span></p>
                    <p><strong>Total Payment:</strong> N/A</p>
                  `;
      }

      htmlContent += `</div>`;
      prevDate = formattedDate;
    }

    htmlContent += `</body></html>`;

    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `attachment; filename="patient-prescription-order-report.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getFilteredOrderData = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isPharmacist) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const filterOption = req.body.filterValue;
    if (filterOption === "Pending") {
      try {
        const prescriptionOrders1 = await PrescriptionOrder.find({
          status: "Pending",
        })
          .populate({
            path: "doctorId",
          })
          .populate({
            path: "patientId",
            match: { patientType: "Outpatient" }, // Filtering based on patientType
          })
          .populate({
            path: "payment",
          })
          .exec();

        // Filter out prescriptions where patientId is null (not matched with patientType: "Outpatient")
        const prescriptionOrders = prescriptionOrders1.filter(
          (order) => order.patientId !== null
        );
        res.status(200).json({ prescriptionOrders });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
    if (filterOption === "Completed") {
      try {
        const prescriptionOrders1 = await PrescriptionOrder.find({
          status: "Completed",
        })
          .populate({
            path: "doctorId",
          })
          .populate({
            path: "patientId",
            match: { patientType: "Outpatient" }, // Filtering based on patientType
          })
          .populate({
            path: "payment",
          })
          .exec();

        // Filter out prescriptions where patientId is null (not matched with patientType: "Outpatient")
        const prescriptionOrders = prescriptionOrders1.filter(
          (order) => order.patientId !== null
        );
        res.status(200).json({ prescriptionOrders });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
    if (filterOption === "Rejected") {
      try {
        const prescriptionOrders1 = await PrescriptionOrder.find({
          status: "Rejected",
        })
          .populate({
            path: "doctorId",
          })
          .populate({
            path: "patientId",
            match: { patientType: "Outpatient" }, // Filtering based on patientType
          })
          .populate({
            path: "payment",
          })
          .exec();

        // Filter out prescriptions where patientId is null (not matched with patientType: "Outpatient")
        const prescriptionOrders = prescriptionOrders1.filter(
          (order) => order.patientId !== null
        );
        res.status(200).json({ prescriptionOrders });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getInFilteredOrderData = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isPharmacist) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const filterOption = req.body.filterValue;
    if (filterOption === "Pending") {
      try {
        const prescriptionOrders1 = await PrescriptionOrder.find({
          status: "Pending",
        })
          .populate({
            path: "doctorId",
          })
          .populate({
            path: "patientId",
            match: { patientType: "Inpatient" }, // Filtering based on patientType
          })
          .populate({
            path: "payment",
          })
          .exec();

        // Filter out prescriptions where patientId is null (not matched with patientType: "Outpatient")
        const prescriptionOrders = prescriptionOrders1.filter(
          (order) => order.patientId !== null
        );
        res.status(200).json({ prescriptionOrders });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
    if (filterOption === "Completed") {
      try {
        const prescriptionOrders1 = await PrescriptionOrder.find({
          status: "Completed",
        })
          .populate({
            path: "doctorId",
          })
          .populate({
            path: "patientId",
            match: { patientType: "Inpatient" }, // Filtering based on patientType
          })
          .populate({
            path: "payment",
          })
          .exec();

        // Filter out prescriptions where patientId is null (not matched with patientType: "Outpatient")
        const prescriptionOrders = prescriptionOrders1.filter(
          (order) => order.patientId !== null
        );
        res.status(200).json({ prescriptionOrders });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
    if (filterOption === "Rejected") {
      try {
        const prescriptionOrders1 = await PrescriptionOrder.find({
          status: "Rejected",
        })
          .populate({
            path: "doctorId",
          })
          .populate({
            path: "patientId",
            match: { patientType: "Inpatient" }, // Filtering based on patientType
          })
          .populate({
            path: "payment",
          })
          .exec();

        // Filter out prescriptions where patientId is null (not matched with patientType: "Outpatient")
        const prescriptionOrders = prescriptionOrders1.filter(
          (order) => order.patientId !== null
        );
        res.status(200).json({ prescriptionOrders });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFilteredOrderByPaymentStatusData = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isPharmacist) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const filterOption = req.body.filterValue;
    if (
      filterOption === "Pending" ||
      filterOption === "Completed" ||
      filterOption === "Rejected"
    ) {
      try {
        const prescriptionOrders1 = await PrescriptionOrder.find()
          .populate({
            path: "doctorId",
          })
          .populate({
            path: "patientId",
            match: { patientType: "Outpatient" },
          })
          .populate({
            path: "payment",
          });

        const prescriptionOrders2 = prescriptionOrders1.filter((order) => {
          return order.payment && order.payment.status === filterOption;
        });

        const prescriptionOrders = prescriptionOrders2.filter(
          (order) => order.patientId !== null
        );

        res.status(200).json({ prescriptionOrders });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInFilteredOrderByPaymentStatusData = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isDoctor && !req.user.isPharmacist) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const filterOption = req.body.filterValue;
    if (
      filterOption === "Pending" ||
      filterOption === "Completed" ||
      filterOption === "Rejected"
    ) {
      try {
        const prescriptionOrders1 = await PrescriptionOrder.find()
          .populate({
            path: "doctorId",
          })
          .populate({
            path: "patientId",
            match: { patientType: "Inpatient" },
          })
          .populate({
            path: "payment",
          });

        const prescriptionOrders2 = prescriptionOrders1.filter((order) => {
          return order.payment && order.payment.status === filterOption;
        });
        const prescriptionOrders = prescriptionOrders2.filter(
          (order) => order.patientId !== null
        );

        res.status(200).json({ prescriptionOrders });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
