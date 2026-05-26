export const createReport = async (
  req,
  res
) => {
  try {
    const {
      bodyPart,
      severity,
      symptoms,
      notes,
    } = req.body;

    console.log("NEW SYMPTOM REPORT:");
    console.log({
      bodyPart,
      severity,
      symptoms,
      notes,
    });

    res.status(201).json({
      success: true,
      message:
        "Symptom report created successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};