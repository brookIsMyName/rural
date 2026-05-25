// src/layouts/Nav.jsx
import { useState } from "react";
import { useLang } from "../utils/useLang";
import { t } from "../utils/translate";
import { LANGUAGES } from "../data/languages";

const links = [
  { id: "home",       key: "home" },
  { id: "chat",       key: "healthChat" },
  { id: "outbreaks",  key: "alerts" },
  { id: "firstaid",   key: "firstAid" },
  { id: "caregivers", key: "findCare" },
  {id: "bodymap", key: "bodyMap"},
];

export default function Nav({ page, setPage, user, onLogout, goToChat }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, changeLang } = useLang(); // ← drives re-renders on language change

  const navigate = (id) => {
    id === "chat" ? goToChat() : setPage(id);
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        .nav-link { transition: color 0.2s, background 0.2s; }
        .nav-link:hover { color: #10b981 !important; background: rgba(16,185,129,0.08) !important; }
        .lang-select option { background: #1a2030; color: #fff; }
        .auth-btn-outline:hover { border-color: rgba(255,255,255,0.3) !important; color: #fff !important; }
        .auth-btn-green:hover { opacity: 0.88; }
        .hamburger:hover { color: #10b981 !important; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .mobile-menu { animation: slideDown 0.18s ease; }
      `}</style>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(10,14,20,0.95)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62, padding: "0 20px" }}>

          {/* ── Logo ── */}
          <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#10b981,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🏥</div>
            <span style={{ color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
              RuralCare <span style={{ color: "#10b981" }}>AI</span>
            </span>
          </button>

          {/* ── Desktop centre links ── */}
          <div style={{ display: "flex", gap: 2, alignItems: "center" }} className="desktop-nav">
            {links.map((l) => (
              <button key={l.id} onClick={() => navigate(l.id)} className="nav-link" style={{
                background: page === l.id ? "rgba(16,185,129,0.12)" : "none",
                border: "none", borderRadius: 8, padding: "6px 13px",
                color: page === l.id ? "#10b981" : "rgba(255,255,255,0.55)",
                cursor: "pointer", fontSize: 13.5,
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: page === l.id ? 600 : 400,
              }}>
                {t(l.key)}
              </button>
            ))}
          </div>

          {/* ── Right side: lang + auth ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }} className="desktop-nav">

            {/* Language selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0 10px", height: 34 }}>
              <span style={{ fontSize: 13 }}>🌍</span>
              <select
                value={lang}
                onChange={(e) => changeLang(e.target.value)}
                className="lang-select"
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.75)", fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer", paddingRight: 4 }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* Auth */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 10, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                  : <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>{user.name?.[0]?.toUpperCase()}</div>
                }
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5, fontFamily: "'DM Sans',sans-serif" }}>{user.name?.split(" ")[0]}</span>
                <button onClick={onLogout} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "4px 10px", color: "#f87171", fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                  {t("signOut")}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={() => setPage("login")} className="auth-btn-outline" style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 7, padding: "5px 13px", color: "rgba(255,255,255,0.6)", fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
                  {t("signIn")}
                </button>
                <button onClick={() => setPage("register")} className="auth-btn-green" style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 7, padding: "5px 13px", color: "#fff", fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}>
                  {t("signUp")}
                </button>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn hamburger" style={{ display: "none", background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 22, cursor: "pointer", transition: "color 0.2s" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div className="mobile-menu" style={{ background: "rgba(10,14,20,0.98)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "12px 20px 20px" }}>
            {links.map((l) => (
              <button key={l.id} onClick={() => navigate(l.id)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: page === l.id ? "#10b981" : "rgba(255,255,255,0.65)", padding: "10px 0", fontSize: 15, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {t(l.key)}
              </button>
            ))}

            {/* Mobile lang selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: 14 }}>🌍</span>
              <select value={lang} onChange={(e) => changeLang(e.target.value)} className="lang-select" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 8, padding: "6px 10px", outline: "none", fontSize: 13, cursor: "pointer", width: "100%" }}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {user ? (
                <button onClick={() => { onLogout(); setMenuOpen(false); }} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "9px 18px", color: "#f87171", fontSize: 14, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                  {t("signOut")} ({user.name?.split(" ")[0]})
                </button>
              ) : (
                <>
                  <button onClick={() => { setPage("login"); setMenuOpen(false); }} style={{ flex: 1, background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "9px", color: "#fff", fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>{t("signIn")}</button>
                  <button onClick={() => { setPage("register"); setMenuOpen(false); }} style={{ flex: 1, background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, padding: "9px", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: "pointer" }}>{t("signUp")}</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
