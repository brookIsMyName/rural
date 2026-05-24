// src/pages/CaregiversPage.jsx
import { useState } from "react";
import caregivers from "../data/caregivers.json";

const TYPE_COLOR = { Clinic: "#0ea5e9", NGO: "#8b5cf6", CHW: "#10b981", Hotline: "#f59e0b" };
const TYPES      = ["All", "Clinic", "NGO", "CHW", "Hotline"];

export default function CaregiversPage() {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? caregivers : caregivers.filter((c) => c.type === filter);

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, padding: "80px 20px 40px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(24px,4vw,36px)", marginBottom: 10 }}>
          Find Healthcare Support
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: 15 }}>
          Clinics, NGOs, community health workers, and emergency lines near you
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, justifyContent: "center", flexWrap: "wrap" }}>
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              background: filter === t ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === t ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8, padding: "7px 18px",
              color: filter === t ? "#10b981" : "rgba(255,255,255,0.5)",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, cursor: "pointer",
              fontWeight: filter === t ? 600 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {filtered.map((c) => (
          <div key={c.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Name + type badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, lineHeight: 1.3, marginBottom: 6 }}>{c.name}</div>
                <span style={{ background: `${TYPE_COLOR[c.type]}20`, border: `1px solid ${TYPE_COLOR[c.type]}40`, borderRadius: 6, padding: "2px 10px", color: TYPE_COLOR[c.type], fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                  {c.type}
                </span>
              </div>
              {c.emergency && (
                <span style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "3px 8px", color: "#ef4444", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>
                  🔴 24/7
                </span>
              )}
            </div>

            {/* Service tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {c.services.map((s) => (
                <span key={s} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 10px", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                  {s}
                </span>
              ))}
            </div>

            {/* Meta info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
              {[
                { icon: "📍", text: c.region },
                { icon: "🕐", text: c.availability },
                { icon: "📏", text: c.distance },
              ].map((row) => (
                <div key={row.icon} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 14 }}>{row.icon}</span>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{row.text}</span>
                </div>
              ))}
            </div>

            {/* Call button */}
            <a
              href={`tel:${c.phone}`}
              style={{ display: "block", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10, padding: "10px 16px", color: "#10b981", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, textAlign: "center", textDecoration: "none" }}
            >
              📞 {c.phone}
            </a>

          </div>
        ))}
      </div>

    </div>
  );
}
