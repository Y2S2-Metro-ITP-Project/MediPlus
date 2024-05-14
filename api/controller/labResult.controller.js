import labResult from "../models/labResult.model.js";
import { errorHandler } from "../utils/error.js";

import multer from "multer";
import TestOrder from "../models/orderedTest.model.js";
import Sample from "../models/sample.model.js";

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
      const sampleId = req.body.sampleId;
      const testOrderId = req.body.testOrderId;
      const resultPDF = req.file.originalname;

      const newResult = new labResult({
        patientId,
        sampleId,
        testOrderId,
        resultPDF,
      });

      await newResult.save();

      try {
        const updatedTestOrder = await TestOrder.findByIdAndUpdate(
          testOrderId,
          {
            orderStages: "Complete",
          }
        );
      } catch (error) {
        console.log(error);
      }

      try {
        const updatedSample = await Sample.findByIdAndUpdate(sampleId, {
          sampleStatus: "complete",
        });
      } catch (error) {
        console.log(error);
      }

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

// GET RESULT FOR OUTPATIENT

export const getResultOfOutPatient = async (req, res, next) => {
  try {
    const patientResults = await labResult.find({
      patientId: req.params.patientId,
      testOrderId: req.body.testOrderId,
    });

    if (!patientResults) {
      return next(
        errorHandler(
          404,
          "No Results found for patient with this ID and test ID "
        )
      );
    }
    res.status(200).json(patientResults);
  } catch (error) {
    next(error);
  }
};
