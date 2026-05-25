// src/utils/useLocation.js
// Manages location detection, storage, and caching.
// Priority: 1) saved in MongoDB (for logged-in users)
//           2) localStorage cache (for returning visitors)
//           3) browser GPS (with permission prompt)
//           4) IP-based fallback (silent, no permission needed)

const CACHE_KEY = "rc_location";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getCachedLocation() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.savedAt > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
    return parsed;
  } catch { return null; }
}

function cacheLocation(loc) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ ...loc, savedAt: Date.now() }));
}

async function saveToServer(loc) {
  const token = localStorage.getItem("rc_token");
  try {
    await fetch("/api/location/save", {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(loc),
    });
  } catch { /* non-critical */ }
}

// Try to get city name from coordinates using free reverse geocoding
async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const d = await r.json();
    return {
      city:    d.address?.city || d.address?.town || d.address?.village || d.address?.county || "Unknown",
      region:  d.address?.state || d.address?.region || "",
      country: d.address?.country || "",
    };
  } catch { return { city: "Unknown", region: "", country: "" }; }
}

// Main function — call once on app load
export async function resolveLocation(user) {
  // 1. If logged-in user already has a saved location from MongoDB
  if (user?.location?.lat) {
    const loc = { ...user.location, source: user.location.source || "saved" };
    cacheLocation(loc);
    return loc;
  }

  // 2. Check localStorage cache
  const cached = getCachedLocation();
  if (cached) return cached;

  // 3. Try IP-based fallback first (silent — no permission needed, city-level only)
  try {
    const r = await fetch("/api/location/ip");
    const d = await r.json();
    if (d.location?.lat) {
      const loc = { ...d.location, source: "ip" };
      cacheLocation(loc);
      saveToServer(loc);
      return loc;
    }
  } catch { /* continue */ }

  return null; // Will trigger GPS prompt in components that need precise location
}

// Ask for GPS permission explicitly (call only when user clicks "Allow Location")
export async function requestGPSLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error("Geolocation not supported")); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const geo = await reverseGeocode(lat, lng);
        const loc = { lat, lng, ...geo, source: "gps" };
        cacheLocation(loc);
        saveToServer(loc);
        resolve(loc);
      },
      (err) => reject(err),
      { timeout: 10000, maximumAge: 300000 }
    );
  });
}
