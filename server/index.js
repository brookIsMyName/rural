// server/index.js

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";

import { initGoogleStrategy } from "./config/passport.js";

import authRoutes from "./routes/auth.js";
import locationRoutes from "./routes/location.js";
import chatRoutes from "./routes/chatRoutes.js";

initGoogleStrategy();

const app = express();

const PORT = process.env.PORT || 5000;

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* -------------------- JSON -------------------- */
app.use(express.json());

/* ------------------- SESSION ------------------ */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ruralcare_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

/* ------------------ PASSPORT ------------------ */
app.use(passport.initialize());
app.use(passport.session());

/* -------------------- ROUTES ------------------ */
app.use("/api/auth", authRoutes);

app.use("/api/location", locationRoutes);

app.use("/api/chat", chatRoutes);

/* ------------------ HEALTH -------------------- */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

/* ---------------- ROOT TEST ------------------- */
app.get("/", (_req, res) => {
  res.send("API running...");
});

/* ------------------ MONGODB ------------------- */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB failed:", err.message);
    process.exit(1);
  });