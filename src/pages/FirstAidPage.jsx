// src/pages/FirstAidPage.jsx
import { useState, useMemo } from "react";
import { useLang }           from "../utils/useLang";
import { t }                 from "../utils/translate";
import firstaidBase from "../data/firstaid.json";
import firstaidExtra from "../data/firstaid_extra.json";
import firstaidFr from "../data/firstaid_fr.json";
import firstaidSw from "../data/firstaid_sw.json";
import firstaidAm from "../data/firstaid_am.json";
import firstaidRw from "../data/firstaid_rw.json";

const ALL_FIRSTAID = [...firstaidBase, ...firstaidExtra];
const ALL_FIRSTAID_FR = [...firstaidFr, ...firstaidExtra];
const ALL_FIRSTAID_SW = [...firstaidSw, ...firstaidExtra];
const ALL_FIRSTAID_AM = [...firstaidAm, ...firstaidExtra];
const ALL_FIRSTAID_RW = [...firstaidRw, ...firstaidExtra];

// Tag each entry so we can category-filter
const EMERGENCY_IDS = [2, 3, 5, 9, 11, 13, 14, 15]; // Bleeding, Choking, Snake, Drowning, Allergy, Chest, Head, Poison
const CHRONIC_IDS   = [12];                           // Diabetic

function tagCategory(id) {
  if (EMERGENCY_IDS.includes(id)) return "emergency";
  if (CHRONIC_IDS.includes(id))   return "chronic";
  return "common";
}

export default function FirstAidPage() {
  const { lang } = useLang();
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);
  const [catTab,   setCatTab]   = useState("all");

  const firstAidData = useMemo(() => {
    switch (lang) {
      case "fr":
        return ALL_FIRSTAID_FR;
      case "sw":
        return ALL_FIRSTAID_SW;
      case "am":
        return ALL_FIRSTAID_AM;
      case "rw":
        return ALL_FIRSTAID_RW;
      default:
        return ALL_FIRSTAID;
    }
  }, [lang]);

  const categories = useMemo(
    () => [
      { key: "all",       label: t("all") },
      { key: "emergency", label: `🔴 ${t("emergency")}` },
      { key: "common",    label: `🟡 ${t("common")}` },
      { key: "chronic",   label: `🟢 ${t("chronic")}` },
    ],
    [lang],
  );

  const filtered = useMemo(() => {
    return firstAidData.filter((f) => {
      const matchSearch = f.category.toLowerCase().includes(search.toLowerCase());
      const matchCat    = catTab === "all" || tagCategory(f.id) === catTab;
      return matchSearch && matchCat;
    });
  }, [firstAidData, search, catTab]);

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, padding: "80px 20px 40px", maxWidth: 920, margin: "0 auto" }}>
      <style>{`
        .fa-card { transition: border-color 0.2s, box-shadow 0.2s; }
        .fa-card:hover { border-color: rgba(255,255,255,0.15) !important; }
        .fa-btn:hover { opacity: 0.85; }
        .search-input:focus { border-color: #10b981 !important; outline: none; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: "clamp(24px,4vw,36px)", marginBottom: 10 }}>
          {t("firstAid")} {t("guide")}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", fontSize: 15, marginBottom: 24 }}>
          {firstAidData.length} {t("emergencySituationsCovered")}
        </p>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("firstAidSearchPlaceholder")}
          className="search-input"
          style={{ width: "100%", maxWidth: 460, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "12px 18px", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 14, transition: "border-color 0.2s" }}
        />

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
          {categories.map((c) => (
            <button key={c.key} onClick={() => setCatTab(c.key)} style={{ background: catTab === c.key ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${catTab === c.key ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "6px 16px", color: catTab === c.key ? "#10b981" : "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer", fontWeight: catTab === c.key ? 600 : 400 }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((f) => {
          const isOpen = expanded === f.id;
          const cat    = tagCategory(f.id);
          const catColor = cat === "emergency" ? "#ef4444" : cat === "chronic" ? "#10b981" : "#f59e0b";

          return (
            <div key={f.id} className="fa-card" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${isOpen ? f.color + "50" : "rgba(255,255,255,0.07)"}`, borderRadius: 16, overflow: "hidden", boxShadow: isOpen ? `0 0 20px ${f.color}15` : "none" }}>

              {/* Header */}
              <button onClick={() => setExpanded(isOpen ? null : f.id)} style={{ width: "100%", background: "none", border: "none", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 26 }}>{f.icon}</span>
                  <div style={{ textAlign: "left" }}>
                    <span style={{ color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 16, display: "block" }}>{f.category}</span>
                    <span style={{ color: catColor, fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, letterSpacing: "0.05em" }}>
{cat === "emergency"
  ? `🔴 ${t("emergency")}`
  : cat === "chronic"
  ? `🟢 ${t("chronic")}`
  : `🟡 ${t("common")}`}                    </span>
                  </div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 16, transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "none" }}>▼</span>
              </button>

              {/* Body */}
              {isOpen && (
                <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Signs */}
                  <div style={{ background: `${f.color}0d`, border: `1px solid ${f.color}25`, borderRadius: 10, padding: "12px 16px" }}>
                    <div style={{ color: f.color, fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, marginBottom: 8, letterSpacing: "0.05em" }}>⚠️ {t("recognizeSigns")}</div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {f.signs.map((s, i) => <li key={i} style={{ color: "rgba(255,255,255,0.65)", fontSize: 13.5, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.65, marginBottom: 4 }}>{s}</li>)}
                    </ul>
                  </div>

                  {/* Do's and Don'ts */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 12, padding: "14px" }}>
                      <div style={{ color: "#22c55e", fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, marginBottom: 8, letterSpacing: "0.05em" }}>✅ {t("whatToDo")}</div>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {f.dos.map((d, i) => <li key={i} style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.65, marginBottom: 5 }}>{d}</li>)}
                      </ul>
                    </div>
                    <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 12, padding: "14px" }}>
                      <div style={{ color: "#ef4444", fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, marginBottom: 8, letterSpacing: "0.05em" }}>❌ {t("whatNotToDo")}</div>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {f.donts.map((d, i) => <li key={i} style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.65, marginBottom: 5 }}>{d}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* When to seek care */}
                  <div style={{ background: `${f.color}12`, border: `1px solid ${f.color}28`, borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>🚨</span>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6, margin: 0 }}>
                      <strong style={{ color: f.color }}>{t("whenToSeekUrgentCare")}: </strong>{f.urgent}
                    </p>
                  </div>

                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.25)", textAlign: "center", fontFamily: "'DM Sans',sans-serif", padding: 48 }}>
            {t("noResultsFor")} "{search}"
          </p>
        )}
      </div>
    </div>
  );
}
