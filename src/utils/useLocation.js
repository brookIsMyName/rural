
import { API_BASE } from "../config/api";

const CACHE_KEY = "rc_location";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function hasValidCoordinates(loc) {
  if (!loc) return false;

  const lat = Number(loc.lat);
  const lng = Number(loc.lng);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function getCachedLocation() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (
      !hasValidCoordinates(parsed) ||
      !Number.isFinite(parsed.savedAt) ||
      Date.now() - parsed.savedAt > CACHE_TTL ||
      parsed.savedAt > Date.now()
    ) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function cacheLocation(loc) {
  if (!hasValidCoordinates(loc)) return;

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        ...loc,
        lat: Number(loc.lat),
        lng: Number(loc.lng),
        savedAt: Date.now(),
      })
    );
  } catch {
    // Location can still be used if browser storage is unavailable.
  }
}

function clearCachedLocation() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Storage may be unavailable.
  }
}

async function saveToServer(loc) {
  const token = localStorage.getItem("rc_token");
  if (!token) return;

  try {
    await fetch(`${API_BASE}/api/location/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        lat: loc.lat,
        lng: loc.lng,
        city: loc.city,
        region: loc.region,
        country: loc.country,
        source: loc.source,
        locationUpdatedAt: new Date().toISOString(),
      }),
    });
  } catch {
    // Server persistence is optional; local location still works.
  }
}

async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed.");
    }

    const data = await response.json();
    const address = data.address ?? {};

    return {
      city:
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        "Unknown",
      region: address.state || address.region || "",
      country: address.country || "",
    };
  } catch {
    return {
      city: "Unknown",
      region: "",
      country: "",
    };
  }
}

// Use a saved account location only if it has a recent,
// explicit location timestamp. Older records may be stale.
function getRecentSavedLocation(user) {
  const loc = user?.location;
  if (!hasValidCoordinates(loc)) return null;

  const timestamp = loc.locationUpdatedAt || loc.savedAt;

  if (!timestamp) return null;

  const savedAt =
    typeof timestamp === "number"
      ? timestamp
      : Date.parse(timestamp);

  if (
    !Number.isFinite(savedAt) ||
    savedAt > Date.now() ||
    Date.now() - savedAt > CACHE_TTL
  ) {
    return null;
  }

  return {
    ...loc,
    lat: Number(loc.lat),
    lng: Number(loc.lng),
    source: loc.source || "saved",
  };
}

// Resolve a location without prompting for GPS permission.
// Explicitly requested GPS remains the best way to refresh location.
export async function resolveLocation(user) {
  // 1. Use a valid, recently refreshed browser location.
  const cached = getCachedLocation();

  if (cached) {
    return cached;
  }

  // 2. Use an account location only when its timestamp is recent.
  const saved = getRecentSavedLocation(user);

  if (saved) {
    cacheLocation(saved);
    return saved;
  }

  // 3. Fall back to an IP-based estimate.
  try {
    const response = await fetch(`${API_BASE}/api/location/ip`);

    if (!response.ok) {
      throw new Error("IP location lookup failed.");
    }

    const data = await response.json();
    const ipLocation = data.location;

    if (hasValidCoordinates(ipLocation)) {
      const loc = {
        ...ipLocation,
        lat: Number(ipLocation.lat),
        lng: Number(ipLocation.lng),
        source: "ip",
      };

      cacheLocation(loc);
      return loc;
    }
  } catch {
    // Let the UI offer an explicit GPS request.
  }

  return null;
}

// Call this only when the user chooses to refresh their location.
export async function requestGPSLocation() {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by this browser.");
  }

  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  const geo = await reverseGeocode(lat, lng);

  const loc = {
    lat,
    lng,
    ...geo,
    source: "gps",
  };

  cacheLocation(loc);

  // Do not block the UI while saving the location to the account.
  void saveToServer(loc);

  return loc;
}

// Useful when the user explicitly wants to discard the cached location.
export function clearLocationCache() {
  clearCachedLocation();
}
