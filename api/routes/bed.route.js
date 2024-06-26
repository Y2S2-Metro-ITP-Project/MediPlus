import express from 'express';
import { admitPatientToBed, getAllBeds, getBedByNumber, updateBedAvailability, deleteBedByNumber, createBed, generateReport,generatePatientReport } from '../controller/bed.controller.js';

const router = express.Router();

router.post('/create', createBed);
router.post('/admitbed', admitPatientToBed); // Admit a patient to a bed
router.get('/getbed', getAllBeds); // Get all beds
router.get('/:number', getBedByNumber); // Get a single bed by number
router.put('/:number', updateBedAvailability); // Update bed availability by number
router.delete('/:number', deleteBedByNumber); // Delete a bed by number
router.post('/report', generateReport); // Generate a report
router.post('/downloadPatientReport/:id', generatePatientReport); 
export default router;
