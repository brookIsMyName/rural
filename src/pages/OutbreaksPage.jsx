// src/pages/OutbreaksPage.jsx
import { useState, useEffect } from "react";
import { useLang }             from "../utils/useLang";
import { t }                   from "../utils/translate";
import { getCachedLocation }   from "../utils/useLocation";
import outbreaks from "../data/outbreaks.json";

const SEV_COLOR = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };

export default function OutbreaksPage({ user }) {
  useLang();
  const [selected, setSelected] = useState(null);
  const [location, setLocation] = useState(null);
  const [list,     setList]     = useState(outbreaks);

  useEffect(() => {
    const loc = getCachedLocation() || user?.location || null;
    setLocation(loc);
    if (loc?.country || loc?.region) {
      const query   = [loc.city, loc.region, loc.country].filter(Boolean).join(" ").toLowerCase();
      const matched = outbreaks.filter((o) => query.split(" ").some((w) => w.length > 2 && o.region.toLowerCase().includes(w)));
      setList(matched.length >= 1 ? matched : outbreaks);
    }
  }, [user]);

  const high   = list.filter((o) => o.severity === "High").length;
  const medium = list.filter((o) => o.severity === "Medium").length;
  const low    = list.filter((o) => o.severity === "Low").length;

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, padding: "80px 20px 40px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: "clamp(24px,4vw,36px)", marginBottom: 10 }}>
          {t("outbreakNearYou")}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", fontSize: 15 }}>
          {location
            ? `📍 ${[location.city, location.country].filter(Boolean).join(", ")} — ${t("outbreakSubtitle")}`
            : "East & Central Africa — mock data for demonstration"}
        </p>
      </div>

      {/* Summary bar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        {[
          { label: "Active Alerts",   val: list.length, color: "#fff" },
          { label: "High Severity",   val: high,        color: "#ef4444" },
          { label: "Medium Severity", val: medium,      color: "#f59e0b" },
          { label: "Low Severity",    val: low,         color: "#22c55e" },
        ].map((s) => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 20px", flex: "1 1 100px" }}>
            <div style={{ color: s.color, fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700 }}>{s.val}</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
        {list.map((o) => {
          const isOpen = selected?.id === o.id;
          return (
            <div key={o.id} onClick={() => setSelected(isOpen ? null : o)} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${isOpen ? o.color + "50" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.2s", boxShadow: isOpen ? `0 0 20px ${o.color}20` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{o.disease}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>📍 {o.region}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span style={{ background: `${SEV_COLOR[o.severity]}20`, border: `1px solid ${SEV_COLOR[o.severity]}40`, borderRadius: 6, padding: "3px 10px", color: SEV_COLOR[o.severity], fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{o.severity}</span>
                  <span style={{ color: o.trend === "↑" ? "#ef4444" : o.trend === "↓" ? "#22c55e" : "#f59e0b", fontSize: 18 }}>{o.trend}</span>
                </div>
              </div>
              <span style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
                {o.cases} reported cases
              </span>
              {isOpen && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 16, paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <div style={{ color: "#10b981", fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, marginBottom: 6 }}>PREVENTION TIPS</div>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6, margin: 0 }}>{o.advice}</p>
                  </div>
                  <div style={{ background: `${SEV_COLOR[o.severity]}15`, border: `1px solid ${SEV_COLOR[o.severity]}30`, borderRadius: 8, padding: "8px 12px" }}>
                    <span style={{ color: SEV_COLOR[o.severity], fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>Recommended: {o.action}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif", gridColumn: "1/-1", textAlign: "center", padding: 40 }}>
            No active alerts found for your region.
          </p>
        )}
      </div>
    </div>
  );
}
