// src/pages/OutbreaksPage.jsx
import { useState } from "react";
import outbreaks from "../data/outbreaks.json";

const SEV_COLOR = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };

export default function OutbreaksPage() {
  const [selected, setSelected] = useState(null);

  const high   = outbreaks.filter((o) => o.severity === "High").length;
  const medium = outbreaks.filter((o) => o.severity === "Medium").length;
  const low    = outbreaks.filter((o) => o.severity === "Low").length;

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, padding: "80px 20px 40px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(24px,4vw,36px)", marginBottom: 10 }}>
          Outbreak Alert Dashboard
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: 15 }}>
          Regional disease alerts for East &amp; Central Africa — updated mock data for demonstration
        </p>
      </div>

      {/* Summary bar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        {[
          { label: "Active Alerts",   val: outbreaks.length, color: "#fff" },
          { label: "High Severity",   val: high,             color: "#ef4444" },
          { label: "Medium Severity", val: medium,           color: "#f59e0b" },
          { label: "Low Severity",    val: low,              color: "#22c55e" },
        ].map((s) => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 20px", flex: "1 1 100px" }}>
            <div style={{ color: s.color, fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 }}>{s.val}</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {outbreaks.map((o) => {
          const isOpen = selected?.id === o.id;
          return (
            <div
              key={o.id}
              onClick={() => setSelected(isOpen ? null : o)}
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${isOpen ? o.color + "50" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.2s", boxShadow: isOpen ? `0 0 20px ${o.color}20` : "none" }}
            >
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{o.disease}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>📍 {o.region}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span style={{ background: `${SEV_COLOR[o.severity]}20`, border: `1px solid ${SEV_COLOR[o.severity]}40`, borderRadius: 6, padding: "3px 10px", color: SEV_COLOR[o.severity], fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                    {o.severity}
                  </span>
                  <span style={{ color: o.trend === "↑" ? "#ef4444" : o.trend === "↓" ? "#22c55e" : "#f59e0b", fontSize: 18 }}>{o.trend}</span>
                </div>
              </div>

              <span style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                {o.cases} reported cases
              </span>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 16, paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <div style={{ color: "#10b981", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 6 }}>PREVENTION TIPS</div>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, margin: 0 }}>{o.advice}</p>
                  </div>
                  <div style={{ background: `${SEV_COLOR[o.severity]}15`, border: `1px solid ${SEV_COLOR[o.severity]}30`, borderRadius: 8, padding: "8px 12px" }}>
                    <span style={{ color: SEV_COLOR[o.severity], fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                      Recommended: {o.action}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
