// src/layouts/Nav.jsx
import { useState } from "react";

const links = [
  { id: "home",       label: "Home" },
  { id: "chat",       label: "Health Chat" },
  { id: "outbreaks",  label: "Alerts" },
  { id: "firstaid",   label: "First Aid" },
  { id: "caregivers", label: "Find Care" },
];

export default function Nav({ page, setPage, user, onLogout, goToChat }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (id) => {
    if (id === "chat") { goToChat(); }
    else               { setPage(id); }
    setMenuOpen(false);
  };

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,14,20,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        {/* Logo */}
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #10b981, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏥</div>
          <span style={{ color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: "-0.3px" }}>
            RuralCare <span style={{ color: "#10b981" }}>AI</span>
          </span>
        </button>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="desktop-nav">
          {links.map((l) => (
            <button key={l.id} onClick={() => navigate(l.id)} style={{ background: page === l.id ? "rgba(16,185,129,0.15)" : "none", border: "none", borderRadius: 8, padding: "6px 14px", color: page === l.id ? "#10b981" : "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: page === l.id ? 600 : 400, transition: "all 0.2s" }}>
              {l.label}
            </button>
          ))}

          {/* Auth area */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 8, paddingLeft: 12, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
              {user.avatar
                ? <img src={user.avatar} alt={user.name} style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }} />
                : <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>{user.name?.[0]?.toUpperCase()}</div>
              }
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{user.name?.split(" ")[0]}</span>
              <button onClick={onLogout} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 7, padding: "4px 12px", color: "#f87171", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
              <button onClick={() => setPage("login")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Sign in</button>
              <button onClick={() => setPage("register")} style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, padding: "6px 14px", color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" }}>Sign up</button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{ display: "none", background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>☰</button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ background: "rgba(10,14,20,0.98)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "8px 20px 16px" }}>
          {links.map((l) => (
            <button key={l.id} onClick={() => navigate(l.id)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: page === l.id ? "#10b981" : "rgba(255,255,255,0.7)", padding: "10px 0", fontSize: 15, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
              {l.label}
            </button>
          ))}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12, marginTop: 4 }}>
            {user ? (
              <button onClick={() => { onLogout(); setMenuOpen(false); }} style={{ background: "none", border: "none", color: "#f87171", fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Sign out ({user.name?.split(" ")[0]})</button>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setPage("login");    setMenuOpen(false); }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 16px", color: "#fff", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Sign in</button>
                <button onClick={() => { setPage("register"); setMenuOpen(false); }} style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" }}>Sign up</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
