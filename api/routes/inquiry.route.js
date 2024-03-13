import express from "express";
import { submit } from "../controller/inquiry.controller.js";
const router = express.Router();

router.post("/submit",submit)


export default router;