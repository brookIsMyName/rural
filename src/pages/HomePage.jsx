// src/pages/HomePage.jsx
import { LANGUAGES } from "../data/languages";
import { getLanguage, setLanguage } from "../utils/language";
import { useState, useEffect } from "react";
const features = [
  { icon: "💬", title: "AI Health Chat",      desc: "Describe your symptoms. Get safe, urgency-assessed guidance powered by Claude AI.",           page: "chat" },
  { icon: "🚨", title: "Outbreak Alerts",     desc: "Real-time regional disease alerts with prevention tips and severity indicators.",              page: "outbreaks" },
  { icon: "🩹", title: "First Aid Guide",     desc: "Step-by-step emergency first aid for burns, bites, bleeding, and more.",                       page: "firstaid" },
  { icon: "🏥", title: "Find Local Care",     desc: "Clinics, NGOs, community health workers, and emergency contacts near you.",                    page: "caregivers" },
];

const stats = [
  { stat: "600M+",   label: "people in rural Africa lack adequate healthcare access" },
  { stat: "1:40,000", label: "doctor-to-patient ratio in some rural African regions" },
  { stat: "70%",     label: "of preventable deaths occur in low-resource settings" },
  { stat: "2hrs+",   label: "average travel time to reach a health facility" },
];

const steps = [
  { step: "1", title: "Describe symptoms",  desc: "Tell the AI what you or your patient is experiencing" },
  { step: "2", title: "AI asks questions",  desc: "Claude asks follow-up questions to better understand the situation" },
  { step: "3", title: "Get guidance",       desc: "Receive safe, urgency-classified advice in simple language" },
  { step: "4", title: "Find care",          desc: "Connect to nearby clinics, CHWs, or emergency contacts" },
];

export default function HomePage({ setPage }) {

    


const [lang, setLang] = useState(getLanguage());

const changeLang = (e) => {
  setLang(e.target.value);
  setLanguage(e.target.value);
};


  return (
    <div style={{ minHeight: "100vh", paddingTop: 60 }}>

      {/* ── Hero ── */}
      <section style={{ minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
            <div
  style={{
    marginTop: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    maxWidth: 420,
  }}
>
  <div
    style={{
      fontSize: 14,
      marginBottom: 10,
      color: "rgba(255,255,255,0.7)",
    }}
  >
    🌍 Select Language
  </div>

  <select
    value={lang}
    onChange={changeLang}
    style={{
      width: "100%",
      padding: 10,
      borderRadius: 10,
      background: "rgba(0,0,0,0.3)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.1)",
      outline: "none",
    }}
  >
    {LANGUAGES.map((l) => (
      <option key={l.code} value={l.code}>
        {l.label}
      </option>
    ))}
  </select>
</div>
        <div style={{ maxWidth: 720, position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ color: "#10b981", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>AI-Powered Healthcare Guidance</span>
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 6vw, 64px)", color: "#fff", lineHeight: 1.15, marginBottom: 24, fontWeight: 700 }}>
            Healthcare guidance for{" "}
            <span style={{ color: "#10b981" }}>every community</span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(16px, 2vw, 19px)", lineHeight: 1.7, marginBottom: 40, fontFamily: "'DM Sans', sans-serif" }}>
            RuralCare AI provides accessible, safe healthcare guidance to underserved communities across Africa — where clinics are far, but care should never be.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPage("chat")} style={{ background: "linear-gradient(135deg, #10b981, #059669)", border: "none", borderRadius: 12, padding: "14px 32px", color: "#fff", fontSize: 16, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer", boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}>
              Start Health Chat →
            </button>
            <button onClick={() => setPage("firstaid")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 32px", color: "#fff", fontSize: 16, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: "pointer" }}>
              First Aid Guide
            </button>
          </div>

          <p style={{ marginTop: 32, color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
            ⚠️ This tool does not replace professional medical advice. Always consult a qualified healthcare provider.
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "60px 20px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(24px, 3vw, 36px)", textAlign: "center", marginBottom: 12 }}>
          What RuralCare AI offers
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 48, fontFamily: "'DM Sans', sans-serif" }}>
          Built for low-resource environments. Designed for real lives.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {features.map((f) => (
            <button key={f.page} onClick={() => setPage(f.page)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28, textAlign: "left", cursor: "pointer", display: "block", width: "100%", transition: "all 0.2s" }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{f.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "60px 20px", background: "rgba(16,185,129,0.03)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(24px, 3vw, 36px)", marginBottom: 48 }}>
            How it works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32 }}>
            {steps.map((s) => (
              <div key={s.step} style={{ textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#10b981", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18 }}>
                  {s.step}
                </div>
                <h4 style={{ color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 8, fontSize: 15 }}>{s.title}</h4>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact stats ── */}
      <section style={{ padding: "60px 20px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(22px, 3vw, 32px)", marginBottom: 40 }}>
          The healthcare gap we're addressing
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24 }}>
          {stats.map((s) => (
            <div key={s.stat} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px 16px" }}>
              <div style={{ color: "#10b981", fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, marginBottom: 8 }}>{s.stat}</div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
