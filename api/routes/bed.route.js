import express from 'express';
import { getbedwithDoctor } from '../controller/bed.controller.js';
import { admitPatientToBed, getAllBeds, transferPatientToBed, getBedByNumber, updateBedAvailability, deleteBedByNumber, createBed, generateReport,generatePatientReport } from '../controller/bed.controller.js';
import { getBedByPatientId } from '../controller/bed.controller.js';
import { assignStaffToBed, removeStaffFromBed } from '../controller/bed.controller.js';
import { assignDoctor,removeDoctor } from '../controller/bed.controller.js';
const router = express.Router();

router.post('/create', createBed);
router.post('/admitbed', admitPatientToBed); // Admit a patient to a bed
router.get('/getbed', getAllBeds); // Get all beds
router.get('/:number', getBedByNumber); // Get a single bed by number
router.put('/:number', updateBedAvailability); // Update bed availability by number
router.delete('/:number', deleteBedByNumber); // Delete a bed by number
router.post('/report', generateReport); // Generate a report
router.post('/downloadPatientReport/:id', generatePatientReport); 
router.put('/transfer',transferPatientToBed);
router.get('/:patientId', getBedByPatientId); // Get a single bed by ID
router.post('/assignStaff', assignStaffToBed); // Assign staff to a bed
router.delete('/:bedNumber/removeStaff', removeStaffFromBed);
router.post('/assignDoctor', assignDoctor);
router.get('/getbeddoctor',getbedwithDoctor)

// Route to remove the assigned doctor from a bed
router.delete('/:bedNumber/removeDoctor', removeDoctor); // Remove staff from a bed
export default router;
