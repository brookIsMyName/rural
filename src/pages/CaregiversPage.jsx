
import { useState, useEffect } from "react";
import { useLang } from "../utils/useLang";
import { t } from "../utils/translate";
import {
  resolveLocation,
  requestGPSLocation,
  clearLocationCache,
} from "../utils/useLocation";
import { API_BASE } from "../config/api";

const TYPE_COLOR = {
  Hospital: "#0ea5e9",
  Clinic: "#10b981",
  Doctor: "#8b5cf6",
  Pharmacy: "#f59e0b",
};

const TYPES = ["All", "Hospital", "Clinic", "Doctor", "Pharmacy"];

function hasCoordinates(location) {
  if (
    location?.lat === null ||
    location?.lat === undefined ||
    location?.lng === null ||
    location?.lng === undefined ||
    location.lat === "" ||
    location.lng === ""
  ) {
    return false;
  }

  const lat = Number(location.lat);
  const lng = Number(location.lng);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function distKm(lat1, lng1, lat2, lng2) {
  const values = [lat1, lng1, lat2, lng2].map(Number);

  if (!values.every(Number.isFinite)) {
    return null;
  }

  const [latitude1, longitude1, latitude2, longitude2] = values;
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadius = 6371;

  const dLat = radians(latitude2 - latitude1);
  const dLng = radians(longitude2 - longitude1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(latitude1)) *
      Math.cos(radians(latitude2)) *
      Math.sin(dLng / 2) ** 2;

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

function getDistanceLabel(km) {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;

  return `${km.toFixed(1)} km`;
}

const panelStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 24,
  color: "#fff",
  fontFamily: "'DM Sans', sans-serif",
};

const buttonStyle = {
  borderRadius: 10,
  padding: "10px 18px",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

export default function CaregiversPage({ user }) {
  useLang();

  const [filter, setFilter] = useState("All");
  const [location, setLocation] = useState(null);
  const [asking, setAsking] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [list, setList] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [facilitiesError, setFacilitiesError] = useState("");
  const [locationError, setLocationError] = useState("");

  // Resolve a recent location on page load.
  useEffect(() => {
    let cancelled = false;

    async function loadLocation() {
      try {
        const loc = await resolveLocation(user);

        if (cancelled) return;

        if (loc && hasCoordinates(loc)) {
          setLocation(loc);
        } else {
          setAsking(true);
        }
      } catch {
        if (!cancelled) {
          setAsking(true);
        }
      }
    }

    loadLocation();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Fetch actual nearby facilities whenever the location changes.
  useEffect(() => {
    if (!location || !hasCoordinates(location)) {
      setList([]);
      setFacilitiesError("");
      setFacilitiesLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadFacilities() {
      setFacilitiesLoading(true);
      setFacilitiesError("");

      try {
        const params = new URLSearchParams({
          lat: String(location.lat),
          lng: String(location.lng),
          radius: "5000",
        });

        const response = await fetch(
          `${API_BASE}/api/caregivers/nearby?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          throw new Error(
            errorData.message ||
              "We couldn't retrieve nearby healthcare facilities."
          );
        }

        const data = await response.json();

        const facilities = (data.facilities ?? [])
          .filter((facility) => hasCoordinates(facility))
          .map((facility) => ({
            ...facility,
            _km: distKm(
              location.lat,
              location.lng,
              facility.lat,
              facility.lng
            ),
          }))
          .filter((facility) => facility._km !== null)
          .sort((a, b) => a._km - b._km);

        if (!controller.signal.aborted) {
          setList(facilities);
        }
      } catch (error) {
        if (error.name !== "AbortError" && !controller.signal.aborted) {
          setList([]);
          setFacilitiesError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setFacilitiesLoading(false);
        }
      }
    }

    loadFacilities();

    return () => {
      controller.abort();
    };
  }, [location]);

  // Request fresh GPS coordinates, with IP lookup as a fallback.
  const handleAllow = async () => {
    setLocationLoading(true);
    setLocationError("");

    try {
      const loc = await requestGPSLocation();

      if (!hasCoordinates(loc)) {
        throw new Error("GPS did not return valid coordinates.");
      }

      setLocation(loc);
      setAsking(false);
    } catch {
      try {
        const response = await fetch(`${API_BASE}/api/location/ip`);

        if (!response.ok) {
          throw new Error("IP location lookup failed.");
        }

        const data = await response.json();
        const loc = data.location;

        if (!hasCoordinates(loc)) {
          throw new Error("No valid location was returned.");
        }

        const fallbackLocation = {
          ...loc,
          lat: Number(loc.lat),
          lng: Number(loc.lng),
          source: "ip",
        };

        setLocation(fallbackLocation);
        setAsking(false);
      } catch {
        setLocation(null);
        setAsking(false);
        setLocationError(
          "We couldn't determine your location. Please try again or check your browser's location permissions."
        );
      }
    } finally {
      setLocationLoading(false);
    }
  };

  // Clear old cached coordinates before asking the user to refresh.
  const handleChangeLocation = () => {
    clearLocationCache();
    setLocation(null);
    setList([]);
    setLocationError("");
    setFacilitiesError("");
    setAsking(true);
  };

  const filtered =
    filter === "All"
      ? list
      : list.filter((item) => item.type === filter);

  const locationLabel = location
    ? [location.city, location.region, location.country]
        .filter(Boolean)
        .filter((value, index, values) => values.indexOf(value) === index)
        .join(", ")
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
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
          }}
        >
          {location
            ? `📍 ${locationLabel} — ${t("caregivSubtitle")}`
            : t("caregivSubtitle")}
        </p>
      </div>

      {asking && (
        <div
          style={{
            ...panelStyle,
            maxWidth: 520,
            margin: "0 auto 32px",
            textAlign: "center",
            borderColor: "rgba(16,185,129,0.25)",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>📍</div>

          <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>
            {t("locationPromptTitle")}
          </h3>

          <p
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 13,
              lineHeight: 1.7,
              marginBottom: 20,
            }}
          >
            Enable location to find mapped healthcare facilities near you.
            Your GPS location gives a more accurate search than an IP estimate.
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
              disabled={locationLoading}
              style={{
                ...buttonStyle,
                background: "#059669",
                color: "#fff",
                border: "none",
                opacity: locationLoading ? 0.7 : 1,
              }}
            >
              {locationLoading
                ? "Finding your location…"
                : t("locationAllow")}
            </button>

            <button
              onClick={() => setAsking(false)}
              disabled={locationLoading}
              style={{
                ...buttonStyle,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            >
              {t("locationSkip")}
            </button>
          </div>
        </div>
      )}

      {locationError && (
        <div
          role="alert"
          style={{
            ...panelStyle,
            marginBottom: 24,
            color: "#fbbf24",
            borderColor: "rgba(245,158,11,0.3)",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          {locationError}
          <div>
            <button
              onClick={handleChangeLocation}
              style={{
                ...buttonStyle,
                marginTop: 12,
                color: "#10b981",
                background: "transparent",
                border: "1px solid rgba(16,185,129,0.4)",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              ...buttonStyle,
              padding: "8px 16px",
              background:
                filter === type
                  ? "rgba(16,185,129,0.15)"
                  : "rgba(255,255,255,0.04)",
              border: `1px solid ${
                filter === type
                  ? "rgba(16,185,129,0.45)"
                  : "rgba(255,255,255,0.1)"
              }`,
              color: filter === type ? "#10b981" : "#d1d5db",
            }}
          >
            {type}
          </button>
        ))}

        {location && (
          <button
            onClick={handleChangeLocation}
            style={{
              ...buttonStyle,
              padding: "8px 14px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#d1d5db",
            }}
          >
            📍 Change location
          </button>
        )}
      </div>

      {facilitiesLoading && (
        <div
          role="status"
          style={{
            color: "#d1d5db",
            textAlign: "center",
            padding: 32,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 12 }}>🔎</div>
          Searching OpenStreetMap for nearby healthcare facilities…
        </div>
      )}

      {!facilitiesLoading && facilitiesError && (
        <div
          role="alert"
          style={{
            ...panelStyle,
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          <h3>Search temporarily unavailable</h3>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
            {facilitiesError}
          </p>
          <button
            onClick={() => setLocation((current) => current ? { ...current } : null)}
            style={{
              ...buttonStyle,
              background: "#059669",
              color: "#fff",
              border: "none",
            }}
            disabled={!location}
          >
            Retry search
          </button>
        </div>
      )}

      {!facilitiesLoading &&
        !facilitiesError &&
        location &&
        filtered.length > 0 && (
          <>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              Found {filtered.length} mapped result
              {filtered.length === 1 ? "" : "s"} within 5 km. Results are
              ordered by straight-line distance.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
                gap: 16,
              }}
            >
              {filtered.map((facility) => (
                <article
                  key={facility.id}
                  style={{
                    ...panelStyle,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: 16,
                          lineHeight: 1.5,
                          margin: "0 0 10px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {facility.name}
                      </h3>

                      <span
                        style={{
                          display: "inline-block",
                          background: `${
                            TYPE_COLOR[facility.type] ?? "#64748b"
                          }20`,
                          border: `1px solid ${
                            TYPE_COLOR[facility.type] ?? "#64748b"
                          }60`,
                          color: TYPE_COLOR[facility.type] ?? "#cbd5e1",
                          borderRadius: 6,
                          padding: "3px 9px",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {facility.type}
                      </span>
                    </div>

                    <span
                      style={{
                        color: "#6ee7b7",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getDistanceLabel(facility._km)}
                    </span>
                  </div>

                  {facility.services?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {facility.services.map((service) => (
                        <span
                          key={service}
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: 6,
                            padding: "4px 8px",
                            color: "#d1d5db",
                            fontSize: 12,
                          }}
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      paddingTop: 14,
                      display: "grid",
                      gap: 10,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.7)",
                      overflowWrap: "anywhere",
                    }}
                  >
                    <div>📍 {facility.region}</div>

                    {facility.availability && (
                      <div>🕐 {facility.availability}</div>
                    )}

                    {facility.emergency && (
                      <div style={{ color: "#fca5a5" }}>
                        Emergency service tagged in map data
                      </div>
                    )}

                    {facility.phone && (
                      <div>
                        📞{" "}
                        <a
                          href={`tel:${facility.phone}`}
                          style={{ color: "#6ee7b7" }}
                        >
                          {facility.phone}
                        </a>
                      </div>
                    )}

                    {facility.website && (
                      <div>
                        🌐{" "}
                        <a
                          href={facility.website}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#6ee7b7",
                            overflowWrap: "anywhere",
                          }}
                        >
                          Official website
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

      {!facilitiesLoading &&
        !facilitiesError &&
        location &&
        filtered.length === 0 && (
          <div
            style={{
              ...panelStyle,
              textAlign: "center",
              padding: "40px 24px",
              lineHeight: 1.7,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>📍</div>
            <h3>No mapped facilities found nearby</h3>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 13,
              }}
            >
              No matching facilities were found in the current map data within
              5 km. This does not mean there are no healthcare facilities in
              your area.
            </p>
            <button
              onClick={() => {
                setFilter("All");
                setLocation((current) =>
                  current ? { ...current } : null
                );
              }}
              style={{
                ...buttonStyle,
                marginTop: 12,
                background: "#059669",
                color: "#fff",
                border: "none",
              }}
            >
              Search again
            </button>
          </div>
        )}

      {!location && !asking && !locationError && (
        <div style={{ ...panelStyle, textAlign: "center", lineHeight: 1.7 }}>
          <h3>Location needed</h3>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
            Set your location to search for healthcare facilities nearby.
          </p>
          <button
            onClick={handleChangeLocation}
            style={{
              ...buttonStyle,
              background: "#059669",
              color: "#fff",
              border: "none",
            }}
          >
            Find facilities near me
          </button>
        </div>
      )}

      <p
        style={{
          color: "rgba(255,255,255,0.4)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          textAlign: "center",
          marginTop: 32,
          lineHeight: 1.7,
        }}
      >
        Map data © OpenStreetMap contributors. Listings may be incomplete or
        outdated. Verify facility details before relying on them.
      </p>
    </div>
  );
}
