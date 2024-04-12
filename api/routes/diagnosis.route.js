import express from 'express';
import { addDiagnosisData ,getDiagnosisData,deleteDiagnosisData,getPatientDiagnosisData,downloadPatientPDFDiagnosis,downloadPatientDoctorPDFDiagnosis} from '../controller/diagnosis.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
const router = express.Router();

router.post('/addDiagnosticData/:id',verifyToken,addDiagnosisData);
router.get('/getDiagnosticData/:patientId',verifyToken,getDiagnosisData);
router.delete('/deleteDiagnosticData/:id',verifyToken,deleteDiagnosisData);
router.get('/getPatientDiagnosticData/:UserId',verifyToken,getPatientDiagnosisData);
router.post('/DownloadPDFPatientDiagnostic/:Id',verifyToken,downloadPatientPDFDiagnosis);
router.post('/DownloadPDFPatientDoctorDiagnostic/:Id',verifyToken,downloadPatientDoctorPDFDiagnosis);

export default router;