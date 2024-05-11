import labResult from "../models/labResult.model.js";

import multer from "multer";
import TestOrder from "../models/orderedTest.model.js";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "client/public/labResults/");
  }, //storage spot

  filename: (req, file, callback) => {
    callback(null, file.originalname);
  }, //store the file with it's original name
});


const upload = multer({ storage: storage });

export const uploadTestResults = [
  upload.single("resultPDF"),
  async (req, res, next) => {
    try {
      const patientId = req.body.patientId;
      const sampleId = req.body.sampleIdl;
      const testOrderId = req.body.testOrderId;
      const resultPDF = req.file.originalname;

      const newResult = new labResult({
        patientId,
        sampleId,
        testOrderId,
        resultPDF,
      });

      await newResult.save();

      const updatedTestOrder = await TestOrder.findByIdAndUpdate(testOrderId, {
        orderStages: "Complete",
      });

      res.status(200).json({ message: "test results uplaoded succesfully!" });
    } catch (error) {
      console.error("Error uploading test result:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

// export const getLabTests = async (req, res, next) => {
// if (!req.user.isAdmin && !req.user.isLabTech && !req.user.isDoctor && !req.user.isOutPatient) {
//   return next(
//     errorHandler(403, "you are not allowed to access all lab tests")
//   );
// }
//     try {
//       const labtests = await LabTest.find();

//       res.status(200).json({ labtests });
//     } catch (error) {
//       next(error);
//     }
//   };
