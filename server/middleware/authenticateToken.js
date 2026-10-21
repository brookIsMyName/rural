
import jwt from "jsonwebtoken";

export default function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Please sign in to access symptom reports.",
    });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "ruralcare_jwt"
    );

    if (!payload.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    req.userId = payload.id;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Your session is invalid or has expired. Please sign in again.",
    });
  }
}
