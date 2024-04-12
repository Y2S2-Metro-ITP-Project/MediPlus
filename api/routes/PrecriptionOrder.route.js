import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { getPrescriptionOrderData, deletePrescriptionOrderData, updatePrescriptionOrderData,getPrescriptionPatientOrder,confirmPrescriptionOrderData,rejectPrescriptionOrderData} from '../controller/PrescriptionOrder.controller.js';
const router = express.Router();

router.get('/getPrescriptionOrder', verifyToken, getPrescriptionOrderData);
router.delete('/deletePrescriptionOrder/:id', verifyToken, deletePrescriptionOrderData);
router.get('/getPrescriptionPatientOrder/:id', verifyToken, getPrescriptionPatientOrder);
router.post('/confirmPrescriptionOrder/:id', verifyToken, confirmPrescriptionOrderData);
router.get('/rejectPrescriptionOrder/:id', verifyToken, rejectPrescriptionOrderData);
export default router;
