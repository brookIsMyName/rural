// server/index.js
import dotenv    from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join }  from "path";

// Resolve __dirname in ES modules, then point dotenv at the .env file
// right next to index.js — no matter where you run node from
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

// ── Debug: confirm vars loaded (remove these lines after it works) ────────────
console.log("MONGODB_URI loaded:", !!process.env.MONGODB_URI);
console.log("GOOGLE_CLIENT_ID loaded:", !!process.env.GOOGLE_CLIENT_ID);

import express               from "express";
import cors                  from "cors";
import mongoose              from "mongoose";
import session               from "express-session";
import passport              from "passport";
import { initGoogleStrategy } from "./config/passport.js";
import authRoutes            from "./routes/auth.js";

initGoogleStrategy();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin:      process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret:            process.env.SESSION_SECRET || "ruralcare_secret",
  resave:            false,
  saveUninitialized: false,
  cookie:            { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB (Health / UserInfo)");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
 .catch((err) => {
  console.error("❌ FULL ERROR:");
  console.error(err);
  process.exit(1);
});