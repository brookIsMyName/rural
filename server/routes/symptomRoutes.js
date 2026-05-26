import express from "express";

const router = express.Router();

import {
  createReport,
} from "../controllers/symptomController.js";

router.post("/", createReport);

export default router;