// src/pages/FirstAidPage.jsx
import { useState } from "react";
import firstaid from "../data/firstaid.json";

export default function FirstAidPage() {
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);

  const filtered = firstaid.filter((f) =>
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, padding: "80px 20px 40px", maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(24px,4vw,36px)", marginBottom: 10 }}>
          First Aid Guide
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: 15, marginBottom: 24 }}>
          Step-by-step emergency guidance. Simple. Clear. Accessible.
        </p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search situations (e.g. burns, snake bite...)"
          style={{ width: "100%", maxWidth: 440, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 18px", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none" }}
        />
      </div>

      {/* Accordion cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((f) => {
          const isOpen = expanded === f.id;
          return (
            <div
              key={f.id}
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${isOpen ? f.color + "40" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, overflow: "hidden", transition: "all 0.2s" }}
            >
              {/* Accordion header */}
              <button
                onClick={() => setExpanded(isOpen ? null : f.id)}
                style={{ width: "100%", background: "none", border: "none", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 28 }}>{f.icon}</span>
                  <span style={{ color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 17 }}>{f.category}</span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>{isOpen ? "▲" : "▼"}</span>
              </button>

              {/* Accordion body */}
              {isOpen && (
                <div style={{ padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: 18 }}>

                  {/* Signs */}
                  <div>
                    <div style={{ color: f.color, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 10, letterSpacing: "0.05em" }}>
                      ⚠️ EMERGENCY SIGNS
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {f.signs.map((s, i) => (
                        <li key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, marginBottom: 4 }}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Do's and Don'ts */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: 16 }}>
                      <div style={{ color: "#22c55e", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 10, letterSpacing: "0.05em" }}>✅ WHAT TO DO</div>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {f.dos.map((d, i) => (
                          <li key={i} style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65, marginBottom: 5 }}>{d}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 16 }}>
                      <div style={{ color: "#ef4444", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 10, letterSpacing: "0.05em" }}>❌ WHAT NOT TO DO</div>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {f.donts.map((d, i) => (
                          <li key={i} style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65, marginBottom: 5 }}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Urgent care callout */}
                  <div style={{ background: `${f.color}15`, border: `1px solid ${f.color}30`, borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>🚨</span>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, margin: 0 }}>
                      <strong style={{ color: f.color }}>When to seek urgent care: </strong>
                      {f.urgent}
                    </p>
                  </div>

                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", fontFamily: "'DM Sans', sans-serif", padding: 40 }}>
            No results for "{search}"
          </p>
        )}
      </div>

    </div>
  );
}
