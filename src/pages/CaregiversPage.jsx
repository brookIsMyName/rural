// src/pages/CaregiversPage.jsx
import { useState, useEffect } from "react";
import { useLang }             from "../utils/useLang";
import { t }                   from "../utils/translate";
import { getCachedLocation, requestGPSLocation } from "../utils/useLocation";
import caregivers from "../data/caregivers.json";

const TYPE_COLOR = { Clinic: "#0ea5e9", NGO: "#8b5cf6", CHW: "#10b981", Hotline: "#f59e0b" };
const TYPES      = ["All", "Clinic", "NGO", "CHW", "Hotline"];

// Filter caregivers by location keywords (city / country / region matching)
function filterByLocation(list, loc) {
  if (!loc?.city && !loc?.country) return list;
  const query = [loc.city, loc.region, loc.country].filter(Boolean).join(" ").toLowerCase();
  // Always include Hotlines (phone-only, nationwide)
  const national = list.filter((c) => c.type === "Hotline" || c.nationwide);
  // Try to find region-matched cards
  const matched  = list.filter((c) => {
    const haystack = [c.region, c.name].join(" ").toLowerCase();
    return query.split(" ").some((word) => word.length > 2 && haystack.includes(word));
  });
  // Merge, deduplicate, fill with all if nothing matched
  const merged = [...new Map([...matched, ...national].map((c) => [c.id, c])).values()];
  return merged.length >= 2 ? merged : list;
}

// Haversine distance in km
function distKm(lat1, lng1, lat2, lng2) {
  const R   = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a   = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CaregiversPage({ user }) {
  useLang();
  const [filter,   setFilter]   = useState("All");
  const [location, setLocation] = useState(null);
  const [asking,   setAsking]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [list,     setList]     = useState(caregivers);

  // On mount: check for cached / saved location
  useEffect(() => {
    const cached = getCachedLocation();
    if (cached) { setLocation(cached); return; }
    if (user?.location?.lat) { setLocation(user.location); return; }
    // No location at all — show prompt
    setAsking(true);
  }, [user]);

  // When location is known, filter the list
  useEffect(() => {
    if (!location) { setList(caregivers); return; }
    const filtered = filterByLocation(caregivers, location);
    // Sort by distance if we have GPS coords for each entry
    const withDist = filtered.map((c) => ({
      ...c,
      _km: c.lat && c.lng ? distKm(location.lat, location.lng, c.lat, c.lng) : 9999,
    }));
    withDist.sort((a, b) => a._km - b._km);
    setList(withDist);
  }, [location]);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const loc = await requestGPSLocation();
      setLocation(loc);
      setAsking(false);
    } catch {
      // GPS denied — try IP fallback
      try {
        const r = await fetch("/api/location/ip");
        const d = await r.json();
        if (d.location?.lat) { setLocation(d.location); setAsking(false); }
        else { setAsking(false); } // show all
      } catch { setAsking(false); }
    }
    setLoading(false);
  };

  const filtered = filter === "All" ? list : list.filter((c) => c.type === filter);

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, padding: "80px 20px 40px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: "clamp(24px,4vw,36px)", marginBottom: 10 }}>
          {t("caregivNearYou")}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", fontSize: 15 }}>
          {location
            ? `📍 ${[location.city, location.country].filter(Boolean).join(", ")} — ${t("caregivSubtitle")}`
            : t("caregivSubtitle")}
        </p>
      </div>

      {/* Location permission prompt */}
      {asking && (
        <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, padding: "28px 24px", textAlign: "center", marginBottom: 32, maxWidth: 520, margin: "0 auto 32px" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📍</div>
          <h3 style={{ color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 8 }}>
            {t("locationPromptTitle")}
          </h3>
          <p style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
            {t("locationPromptDesc")}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={handleAllow} disabled={loading} style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 10, padding: "10px 22px", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              {loading ? t("locationDetecting") : t("locationAllow")}
            </button>
            <button onClick={() => setAsking(false)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 22px", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, cursor: "pointer" }}>
              {t("locationSkip")}
            </button>
          </div>
          <p style={{ marginTop: 14, color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "'DM Sans',sans-serif" }}>
            If you decline, we'll estimate your location from your IP address automatically.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, justifyContent: "center", flexWrap: "wrap" }}>
        {TYPES.map((type) => (
          <button key={type} onClick={() => setFilter(type)} style={{ background: filter === type ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${filter === type ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "7px 18px", color: filter === type ? "#10b981" : "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, cursor: "pointer", fontWeight: filter === type ? 600 : 400 }}>
            {type}
          </button>
        ))}
        {location && (
          <button onClick={() => { setLocation(null); setAsking(true); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans',sans-serif", fontSize: 12, cursor: "pointer" }}>
            📍 Change location
          </button>
        )}
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
        {filtered.map((c) => (
          <div key={c.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 14, transition: "border-color 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 16, lineHeight: 1.3, marginBottom: 6 }}>{c.name}</div>
                <span style={{ background: `${TYPE_COLOR[c.type]}20`, border: `1px solid ${TYPE_COLOR[c.type]}40`, borderRadius: 6, padding: "2px 10px", color: TYPE_COLOR[c.type], fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{c.type}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                {c.emergency && <span style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "3px 8px", color: "#ef4444", fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>🔴 24/7</span>}
                {c._km && c._km < 9999 && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'DM Sans',sans-serif" }}>{c._km < 1 ? "<1 km" : `${Math.round(c._km)} km`}</span>}
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {c.services.map((s) => <span key={s} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 10px", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>{s}</span>)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
              {[{ icon: "📍", text: c.region }, { icon: "🕐", text: c.availability }, { icon: "📏", text: c.distance }].map((row) => (
                <div key={row.icon} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 14 }}>{row.icon}</span>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>{row.text}</span>
                </div>
              ))}
            </div>
            <a href={`tel:${c.phone}`} style={{ display: "block", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10, padding: "10px 16px", color: "#10b981", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, textAlign: "center", textDecoration: "none" }}>
              📞 {c.phone}
            </a>
          </div>
        ))}
      </div>

    </div>
  );
}
