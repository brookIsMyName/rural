// server/routes/location.js
// Saves user location to MongoDB and provides IP-based fallback

import express  from "express";
import jwt      from "jsonwebtoken";
import User     from "../models/User.js";

const router = express.Router();

// Middleware — optionally attach user from JWT (won't fail if not logged in)
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET || "ruralcare_jwt");
      req.userId = payload.id;
    } catch {}
  }
  next();
}

// POST /api/location/save
// Body: { lat, lng, city, country, region }
// Saves to the user's MongoDB document if logged in, otherwise just returns 200
router.post("/save", optionalAuth, async (req, res) => {
  const { lat, lng, city, country, region } = req.body;
  if (!lat || !lng) return res.status(400).json({ message: "lat and lng are required" });

  if (req.userId) {
    try {
      await User.findByIdAndUpdate(req.userId, {
        location: { lat, lng, city, country, region, updatedAt: new Date() },
      });
    } catch (err) {
      console.error("Location save error:", err.message);
    }
  }

  res.json({ ok: true, location: { lat, lng, city, country, region } });
});

// GET /api/location/me
// Returns saved location for logged-in user
router.get("/me", optionalAuth, async (req, res) => {
  if (!req.userId) return res.json({ location: null });
  try {
    const user = await User.findById(req.userId).select("location");
    return res.json({ location: user?.location || null });
  } catch {
    return res.json({ location: null });
  }
});

// GET /api/location/ip
// Returns approximate location from the requester's IP using free ip-api.com
// Legal: ip-api.com is free for non-commercial use and does not require consent
// for approximate city-level location — it's the same as any website knowing your city.
router.get("/ip", async (req, res) => {
  try {
    // Get the real IP (handles proxies / Render deployments)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "";

    // Skip loopback — ip-api won't resolve 127.0.0.1 or ::1
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("::ffff:127")) {
      return res.json({ location: null, note: "Localhost IP — no geo available" });
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,lat,lon`);
    const data     = await response.json();

    if (data.status !== "success") return res.json({ location: null });

    return res.json({
      location: {
        lat:     data.lat,
        lng:     data.lon,
        city:    data.city,
        region:  data.regionName,
        country: data.country,
        source:  "ip",
      },
    });
  } catch (err) {
    console.error("IP geo error:", err.message);
    return res.json({ location: null });
  }
});

export default router;
