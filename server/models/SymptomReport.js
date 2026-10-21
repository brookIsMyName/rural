
import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema(
  {
    bodyPart: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
  },
  { _id: false }
);

const symptomReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  symptoms: {
    type: [symptomSchema],
    required: true,
    validate: {
      validator: (symptoms) => symptoms.length > 0,
      message: "At least one symptom is required.",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SymptomReport = mongoose.model(
  "SymptomReport",
  symptomReportSchema
);

export default SymptomReport;
