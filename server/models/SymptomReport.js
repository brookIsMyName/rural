const mongoose = require("mongoose");

const symptomSchema = new mongoose.Schema(
  {
    bodyPart: String,

    severity: Number,

    notes: String,
  },
  { _id: false }
);

const symptomReportSchema =
  new mongoose.Schema(
    {
      symptoms: [symptomSchema],

      createdAt: {
        type: Date,
        default: Date.now,
      },
    }
  );

module.exports = mongoose.model(
  "SymptomReport",
  symptomReportSchema
);