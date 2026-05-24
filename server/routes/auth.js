// server/routes/auth.js
import express  from "express";
import jwt      from "jsonwebtoken";
import passport from "passport";
import User     from "../models/User.js";

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET || "ruralcare_jwt", { expiresIn: "7d" });

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email, and password are required." });

  if (password.length < 8)
    return res.status(400).json({ message: "Password must be at least 8 characters." });

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "An account with that email already exists." });

    const user  = await User.create({ name, email, password, provider: "local" });
    const token = signToken(user);

    return res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err)   return next(err);
    if (!user) return res.status(401).json({ message: info?.message || "Login failed." });

    const token = signToken(user);
    return res.json({ token, user: user.toSafeObject() });
  })(req, res, next);
});

// ── GET /api/auth/google ──────────────────────────────────────────────────────
// Kicks off the Google OAuth flow
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ── GET /api/auth/google/callback ─────────────────────────────────────────────
// Google redirects here after user approves
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login?error=google" }),
  (req, res) => {
    const token = signToken(req.user);
    const user  = JSON.stringify(req.user.toSafeObject());

    // Redirect to frontend with token — the frontend reads it from the URL hash
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientURL}/auth/callback#token=${token}&user=${encodeURIComponent(user)}`);
  }
);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// Returns current user if JWT is valid
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided." });

  try {
    const payload = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET || "ruralcare_jwt"
    );
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ user: user.toSafeObject() });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post("/logout", (_req, res) => {
  // JWT is stateless — the frontend just deletes the token
  res.json({ message: "Logged out successfully." });
});

export default router;
