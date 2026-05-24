// src/pages/HomePage.jsx
import { useEffect, useRef } from "react";
import { useLang } from "../utils/useLang";
import { t } from "../utils/translate";

export default function HomePage({ setPage, goToChat }) {
  useLang(); // re-render on language change
  const heroRef = useRef(null);

  const features = [
    { icon: "💬", title: t("healthChat"),   desc: t("featChatDesc"),      page: "chat",       color: "#10b981" },
    { icon: "🚨", title: t("alerts"),       desc: t("featAlertsDesc"),    page: "outbreaks",  color: "#ef4444" },
    { icon: "🩹", title: t("firstAid"),     desc: t("featFirstAidDesc"),  page: "firstaid",   color: "#f59e0b" },
    { icon: "🏥", title: t("findCare"),     desc: t("featFindCareDesc"),  page: "caregivers", color: "#0ea5e9" },
  ];

  const stats = [
    { stat: "600M+",   label: "people in rural Africa lack adequate healthcare access" },
    { stat: "1:40,000", label: "doctor-to-patient ratio in some rural regions" },
    { stat: "70%",     label: "of preventable deaths occur in low-resource settings" },
    { stat: "2hrs+",   label: "average travel time to reach a health facility" },
  ];

  const steps = [
    { step: "1", title: t("step1Title"), desc: t("step1Desc") },
    { step: "2", title: t("step2Title"), desc: t("step2Desc") },
    { step: "3", title: t("step3Title"), desc: t("step3Desc") },
    { step: "4", title: t("step4Title"), desc: t("step4Desc") },
  ];

  return (
    <div style={{ minHeight: "100vh", paddingTop: 62, overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatA {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(14px) rotate(-2deg); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .hero-title {
          background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.85) 50%, #10b981 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 5s ease infinite;
        }
        .feat-card {
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          cursor: pointer;
        }
        .feat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        }
        .stat-card {
          transition: transform 0.2s ease;
        }
        .stat-card:hover { transform: scale(1.04); }
        .cta-primary {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(16,185,129,0.5) !important;
        }
        .cta-secondary {
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .cta-secondary:hover {
          background: rgba(255,255,255,0.1) !important;
          border-color: rgba(255,255,255,0.3) !important;
        }
        .step-num {
          transition: transform 0.2s, background 0.2s;
        }
        .step-num:hover { transform: scale(1.1); background: rgba(16,185,129,0.3) !important; }
      `}</style>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ minHeight: "91vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 20px", position: "relative", overflow: "hidden" }}>

        {/* Animated background blobs */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)", top: "10%", left: "50%", transform: "translateX(-50%)", animation: "floatA 8s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)", bottom: "10%", right: "5%", animation: "floatB 10s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)", top: "20%", left: "5%", animation: "floatA 12s ease-in-out infinite 2s", pointerEvents: "none" }} />

        {/* Dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "38px 38px", pointerEvents: "none" }} />

        {/* Pulse ring behind badge */}
        <div style={{ position: "absolute", top: "calc(50% - 200px)", left: "50%", transform: "translateX(-50%)", width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(16,185,129,0.2)", animation: "pulseRing 3s ease-out infinite", pointerEvents: "none" }} />

        <div style={{ maxWidth: 740, position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{ animation: "fadeUp 0.6s ease both", display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 100, padding: "7px 18px", marginBottom: 30 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ color: "#10b981", fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{t("aiHealthcare")}</span>
          </div>

          {/* Headline */}
          <h1 className="hero-title" style={{ animation: "fadeUp 0.7s 0.1s ease both", fontFamily: "'Playfair Display',serif", fontSize: "clamp(38px,6vw,68px)", lineHeight: 1.12, marginBottom: 26, fontWeight: 700 }}>
            {t("heroTitle1")}{" "}{t("heroTitle2")}
          </h1>

          {/* Subheadline */}
          <p style={{ animation: "fadeUp 0.7s 0.2s ease both", color: "rgba(255,255,255,0.5)", fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.75, marginBottom: 42, fontFamily: "'DM Sans',sans-serif", maxWidth: 580, margin: "0 auto 42px" }}>
            {t("heroDesc")}
          </p>

          {/* CTAs */}
          <div style={{ animation: "fadeUp 0.7s 0.3s ease both", display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={goToChat} className="cta-primary" style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 14, padding: "15px 34px", color: "#fff", fontSize: 16, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: "pointer", boxShadow: "0 0 32px rgba(16,185,129,0.35)", letterSpacing: "0.01em" }}>
              {t("startChat")}
            </button>
            <button onClick={() => setPage("firstaid")} className="cta-secondary" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "15px 34px", color: "#fff", fontSize: 16, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, cursor: "pointer" }}>
              {t("firstAidGuide")}
            </button>
          </div>

          <p style={{ animation: "fadeIn 1s 0.6s ease both", opacity: 0, marginTop: 36, color: "rgba(255,255,255,0.25)", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
            {t("disclaimer")}
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "80px 20px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: "clamp(24px,3vw,38px)", marginBottom: 12 }}>{t("whatWeOffer")}</h2>
          <p style={{ color: "rgba(255,255,255,0.38)", fontFamily: "'DM Sans',sans-serif", fontSize: 15 }}>{t("builtFor")}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
          {features.map((f, i) => (
            <button key={f.page} onClick={() => f.page === "chat" ? goToChat() : setPage(f.page)} className="feat-card" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 20, padding: "28px 24px", textAlign: "left", display: "block", width: "100%", animationDelay: `${i * 0.08}s`, animation: "fadeUp 0.6s ease both", position: "relative", overflow: "hidden" }}>
              {/* Accent glow */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${f.color}60, transparent)`, borderRadius: "20px 20px 0 0" }} />
              <div style={{ fontSize: 34, marginBottom: 16, filter: "drop-shadow(0 0 8px rgba(255,255,255,0.1))" }}>{f.icon}</div>
              <h3 style={{ color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 9 }}>{f.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 13.5, lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif", margin: 0 }}>{f.desc}</p>
              <div style={{ marginTop: 18, color: f.color, fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, letterSpacing: "0.04em" }}>EXPLORE →</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 20px", background: "linear-gradient(180deg, rgba(16,185,129,0.03) 0%, transparent 100%)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: "clamp(24px,3vw,38px)", marginBottom: 56 }}>{t("howItWorks")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 36, position: "relative" }}>
            {/* Connecting line (desktop) */}
            <div style={{ position: "absolute", top: 24, left: "12.5%", right: "12.5%", height: 1, background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), rgba(16,185,129,0.3), transparent)", pointerEvents: "none" }} />
            {steps.map((s, i) => (
              <div key={s.step} style={{ textAlign: "center", animation: `fadeUp 0.6s ${i * 0.1}s ease both` }}>
                <div className="step-num" style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: "#10b981", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 18, position: "relative", zIndex: 1 }}>{s.step}</div>
                <h4 style={{ color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, marginBottom: 8, fontSize: 15 }}>{s.title}</h4>
                <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ── */}
      <section style={{ padding: "80px 20px", maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: "clamp(22px,3vw,34px)", marginBottom: 44 }}>{t("healthcareGap")}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 20 }}>
          {stats.map((s, i) => (
            <div key={s.stat} className="stat-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "28px 16px", animation: `countUp 0.5s ${i * 0.1}s ease both` }}>
              <div style={{ color: "#10b981", fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, marginBottom: 10, textShadow: "0 0 30px rgba(16,185,129,0.4)" }}>{s.stat}</div>
              <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.55, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ── */}
      <section style={{ margin: "0 20px 80px", maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(14,165,233,0.08) 100%)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 24, padding: "48px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(16,185,129,0.04) 1px, transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
          <h3 style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: "clamp(22px,3vw,30px)", marginBottom: 14, position: "relative" }}>
            Ready to get started?
          </h3>
          <p style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans',sans-serif", fontSize: 15, marginBottom: 28, position: "relative" }}>
            Describe your symptoms and get safe, AI-powered health guidance in seconds.
          </p>
          <button onClick={goToChat} className="cta-primary" style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 12, padding: "14px 32px", color: "#fff", fontSize: 15, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: "pointer", boxShadow: "0 0 24px rgba(16,185,129,0.3)", position: "relative" }}>
            {t("startChat")}
          </button>
        </div>
      </section>

    </div>
  );
}
