
import SymptomReport from "../models/SymptomReport.js";

export const createReport = async (req, res) => {
  try {
    const { symptoms } = req.body ?? {};

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one symptom."
      });
    }

    const report = await SymptomReport.create({
      user: req.userId,
      symptoms: symptoms.map((symptom) => ({
        bodyPart: symptom.bodyPart,
        severity: Number(symptom.severity),
        notes: symptom.notes || ""
      }))
    });

    return res.status(201).json({
      success: true,
      message: "Symptom report saved successfully.",
      report
    });
  } catch (error) {
    console.error("Error saving symptom report:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save the symptom report."
    });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await SymptomReport.find({
      user: req.userId
    }).sort({ createdAt: -1 });

    return res.json({ success: true, reports });
  } catch (error) {
    console.error("Error retrieving symptom reports:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve symptom reports."
    });
  }
};
