
import { useState, useEffect } from "react";
import { useLang } from "../utils/useLang";
import { t } from "../utils/translate";
import {
  resolveLocation,
  requestGPSLocation,
} from "../utils/useLocation";
import caregivers from "../data/caregivers.json";
import { API_BASE } from "../config/api";

const TYPE_COLOR = {
  Clinic: "#0ea5e9",
  NGO: "#8b5cf6",
  CHW: "#10b981",
  Hotline: "#f59e0b",
};

const TYPES = ["All", "Clinic", "NGO", "CHW", "Hotline"];

// Normalize text so city/country matching is case-insensitive.
function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

// Filter facilities by the known city, region, and country.
// Nationwide resources and hotlines can remain visible.
function filterByLocation(list, loc) {
  if (!loc?.city && !loc?.country && !loc?.region) {
    return list;
  }

  const locationWords = [
    loc.city,
    loc.region,
    loc.country,
  ]
    .filter(Boolean)
    .map(normalize)
    .filter((word) => word.length > 2);

  const national = list.filter(
    (item) => item.type === "Hotline" || item.nationwide
  );

  const matched = list.filter((item) => {
    // Keep nationwide services even if they have no location match.
    if (item.type === "Hotline" || item.nationwide) {
      return true;
    }

    const searchableText = [
      item.region,
      item.name,
      item.country,
      item.city,
    ]
      .filter(Boolean)
      .map(normalize)
      .join(" ");

    // Avoid treating a broad country match as proof of proximity.
    return locationWords.some((word) =>
      searchableText.includes(word)
    );
  });

  return [
    ...new Map(
      [...matched, ...national].map((item) => [item.id, item])
    ).values(),
  ];
}

// Haversine distance in kilometres.
function distKm(lat1, lng1, lat2, lng2) {
  const values = [lat1, lng1, lat2, lng2].map(Number);

  if (!values.every(Number.isFinite)) {
    return null;
  }

  const [latitude1, longitude1, latitude2, longitude2] = values;
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371;

  const dLat = radians(latitude2 - latitude1);
  const dLng = radians(longitude2 - longitude1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(latitude1)) *
      Math.cos(radians(latitude2)) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function hasCoordinates(location) {
  return (
    Number.isFinite(Number(location?.lat)) &&
    Number.isFinite(Number(location?.lng))
  );
}

function getDistanceLabel(km) {
  if (km == null) return null;
  if (km < 1) return "<1 km";
  return `${Math.round(km)} km`;
}

export default function CaregiversPage({ user }) {
  useLang();

  const [filter, setFilter] = useState("All");
  const [location, setLocation] = useState(null);
  const [asking, setAsking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(caregivers);
  const [locationError, setLocationError] = useState("");

  // Load cached or account location on mount.
  useEffect(() => {
    const cached = getCachedLocation();

    if (cached) {
      setLocation(cached);
      return;
    }

    if (hasCoordinates(user?.location)) {
      setLocation(user.location);
      return;
    }

    setAsking(true);
  }, [user]);

  // Filter and sort the available local dataset.
  useEffect(() => {
    if (!location) {
      setList(caregivers);
      return;
    }

    const filtered = filterByLocation(caregivers, location);

    const withDistance = filtered.map((item) => {
      const canCalculateDistance =
        hasCoordinates(location) &&
        hasCoordinates({ lat: item.lat, lng: item.lng });

      return {
        ...item,
        _km: canCalculateDistance
          ? distKm(
              location.lat,
              location.lng,
              item.lat,
              item.lng
            )
          : null,
      };
    });

    withDistance.sort((a, b) => {
      if (a._km == null && b._km == null) return 0;
      if (a._km == null) return 1;
      if (b._km == null) return -1;
      return a._km - b._km;
    });

    setList(withDistance);
  }, [location]);

  const handleAllow = async () => {
    setLoading(true);
    setLocationError("");

    try {
      // Try the device's current GPS location first.
      const loc = await requestGPSLocation();

      if (!loc || !hasCoordinates(loc)) {
        throw new Error("GPS did not return valid coordinates.");
      }

      setLocation(loc);
      setAsking(false);
    } catch {
      // If GPS fails, try the backend's IP-based estimate.
      try {
        const response = await fetch(`${API_BASE}/api/location/ip`);

        if (!response.ok) {
          throw new Error("IP location lookup failed.");
        }

        const data = await response.json();

        if (data.location && hasCoordinates(data.location)) {
          setLocation(data.location);
          setAsking(false);
        } else {
          setLocation(null);
          setLocationError(
            "We couldn't determine your location. You can try again or browse the available directory."
          );
          setAsking(false);
        }
      } catch {
        setLocation(null);
        setLocationError(
          "Location detection failed. You can try again or browse the available directory."
        );
        setAsking(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLocation = () => {
    setLocation(null);
    setLocationError("");
    setAsking(true);
  };

  const filtered =
    filter === "All"
      ? list
      : list.filter((item) => item.type === filter);

  const locationLabel = location
    ? [location.city, location.country].filter(Boolean).join(", ")
    : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "80px 20px 40px",
        maxWidth: 1100,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#fff",
            fontSize: "clamp(24px, 4vw, 36px)",
            marginBottom: 10,
          }}
        >
          {t("caregivNearYou")}
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
          }}
        >
          {location
            ? `📍 ${locationLabel} — ${t("caregivSubtitle")}`
            : t("caregivSubtitle")}
        </p>
      </div>

      {/* Location permission prompt */}
      {asking && (
        <div
          style={{
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 16,
            padding: "28px 24px",
            textAlign: "center",
            margin: "0 auto 32px",
            maxWidth: 520,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>📍</div>

          <h3
            style={{
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 17,
              marginBottom: 8,
            }}
          >
            {t("locationPromptTitle")}
          </h3>

          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            {t("locationPromptDesc")}
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleAllow}
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
                borderRadius: 10,
                padding: "10px 22px",
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? t("locationDetecting") : t("locationAllow")}
            </button>

            <button
              onClick={() => setAsking(false)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "10px 22px",
                color: "rgba(255,255,255,0.65)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {t("locationSkip")}
            </button>
          </div>

          <p
            style={{
              marginTop: 14,
              color: "rgba(255,255,255,0.35)",
              fontSize: 11,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            If GPS is unavailable, we'll try estimating your location using
            your IP address.
          </p>
        </div>
      )}

      {/* Location error */}
      {locationError && (
        <div
          role="status"
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(245,158,11,0.3)",
            background: "rgba(245,158,11,0.08)",
            color: "#fbbf24",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {locationError}
        </div>
      )}

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 28,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              background:
                filter === type
                  ? "rgba(16,185,129,0.15)"
                  : "rgba(255,255,255,0.04)",
              border: `1px solid ${
                filter === type
                  ? "rgba(16,185,129,0.4)"
                  : "rgba(255,255,255,0.1)"
              }`,
              borderRadius: 8,
              padding: "7px 18px",
              color:
                filter === type
                  ? "#10b981"
                  : "rgba(255,255,255,0.65)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: filter === type ? 600 : 400,
            }}
          >
            {type}
          </button>
        ))}

        {location && (
          <button
            onClick={handleChangeLocation}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "7px 14px",
              color: "rgba(255,255,255,0.6)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            📍 Change location
          </button>
        )}
      </div>

      {/* Facility cards */}
      {filtered.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((c) => (
            <div
              key={c.id}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#fff",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      lineHeight: 1.4,
                      marginBottom: 8,
                    }}
                  >
                    {c.name}
                  </div>

                  <span
                    style={{
                      background: `${TYPE_COLOR[c.type] ?? "#64748b"}20`,
                      border: `1px solid ${TYPE_COLOR[c.type] ?? "#64748b"}40`,
                      borderRadius: 6,
                      padding: "2px 10px",
                      color: TYPE_COLOR[c.type] ?? "#94a3b8",
                      fontSize: 11,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {c.type}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  {c.emergency && (
                    <span
                      style={{
                        background: "rgba(239,68,68,0.15)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: 6,
                        padding: "3px 8px",
                        color: "#ef4444",
                        fontSize: 11,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      🔴 24/7
                    </span>
                  )}

                  {c._km != null && (
                    <span
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {getDistanceLabel(c._km)}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(c.services ?? []).map((service) => (
                  <span
                    key={service}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 6,
                      padding: "3px 10px",
                      color: "rgba(255,255,255,0.65)",
                      fontSize: 12,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {service}
                  </span>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  paddingTop: 14,
                }}
              >
                {[
                  { icon: "📍", text: c.region },
                  { icon: "🕐", text: c.availability },
                  { icon: "📏", text: c.distance },
                ]
                  .filter((row) => row.text)
                  .map((row) => (
                    <div
                      key={row.icon}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{row.icon}</span>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: 13,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {row.text}
                      </span>
                    </div>
                  ))}
              </div>

              {c.phone && (
                <a
                  href={`tel:${c.phone}`}
                  style={{
                    display: "block",
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    color: "#10b981",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  📞 {c.phone}
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.7)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>📍</div>
          <h3 style={{ color: "#fff", marginBottom: 8 }}>
            No matching listings found
          </h3>
          <p style={{ fontSize: 13, lineHeight: 1.7 }}>
            We couldn't find relevant listings for this location in the
            directory currently available. This doesn't mean there are no
            healthcare facilities nearby.
          </p>
          <button
            onClick={handleChangeLocation}
            style={{
              marginTop: 16,
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 10,
              padding: "10px 16px",
              color: "#10b981",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
            }}
          >
            Try another location
          </button>
        </div>
      )}
    </div>
  );
}
