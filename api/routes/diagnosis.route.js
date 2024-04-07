import express from 'express';
import { addDiagnosisData ,getDiagnosisData,deleteDiagnosisData} from '../controller/diagnosis.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
const router = express.Router();

router.post('/addDiagnosticData/:id',verifyToken,addDiagnosisData);
router.get('/getDiagnosticData/:id',verifyToken,getDiagnosisData);
router.delete('/deleteDiagnosticData/:id',verifyToken,deleteDiagnosisData);

export default router;