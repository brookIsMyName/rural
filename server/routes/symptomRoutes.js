
import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import {
  createReport,
  getReports,
} from "../controllers/symptomController.js";

const router = express.Router();

// Both endpoints require a valid login.
router.use(authenticateToken);

router.post("/", createReport);
router.get("/", getReports);

export default router;
