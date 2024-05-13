import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { addWard, getWard, deleteWard, updateWard,getDoctorWard,getWardID} from '../controller/ward.controller.js';
const router = express.Router();

router.post('/addWard', verifyToken, addWard);
router.get('/getWard', verifyToken, getWard);
router.get('/getWardId/:wardId', verifyToken, getWardID);
router.put('/updateWard/:wardId', verifyToken, updateWard); 
router.delete('/deleteWard/:wardId', verifyToken, deleteWard);
router.get('/getDoctorWard/:doctorId', verifyToken, getDoctorWard);
export default router;