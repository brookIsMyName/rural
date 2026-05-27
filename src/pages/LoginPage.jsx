// src/pages/LoginPage.jsx
import { useState } from "react";
import { API_BASE } from "../config/api";

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.2 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-8H6.4C9.8 35.6 16.4 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C41.1 36.1 44 30.5 44 24c0-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

export default function LoginPage({ setPage, onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("rc_token", data.token);
      localStorage.setItem("rc_user",  JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogle = () => {
    // Redirects to backend which handles Google OAuth flow
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <div style={styles.page}>
      {/* Background effects */}
      <div style={styles.bgGlow} />
      <div style={styles.bgGrid} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>🏥</div>
          <span style={styles.logoText}>Salvia <span style={{ color: "#10b981" }}>AI</span></span>
        </div>

        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subheading}>Sign in to continue your healthcare journey</p>

        {/* Google button */}
        <button onClick={handleGoogle} style={styles.googleBtn}>
          {GOOGLE_ICON}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div style={styles.dividerRow}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = "#10b981")}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <div style={styles.fieldGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={styles.label}>Password</label>
              <button type="button" style={styles.forgotBtn}>Forgot password?</button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = "#10b981")}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {error && <div style={styles.error}>⚠️ {error}</div>}

          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <button onClick={() => setPage("register")} style={styles.switchLink}>Create one</button>
        </p>

        <p style={styles.disclaimer}>
          ⚠️ This tool does not replace professional medical advice.
        </p>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
    background: "#0a0e14",
  },
  bgGlow: {
    position: "absolute", inset: 0, pointerEvents: "none",
    background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(16,185,129,0.07) 0%, transparent 70%)",
  },
  bgGrid: {
    position: "absolute", inset: 0, pointerEvents: "none",
    backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
    backgroundSize: "36px 36px",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 440,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: "40px 36px",
    backdropFilter: "blur(12px)",
  },
  logoRow: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 28,
  },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg, #10b981, #0ea5e9)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
  },
  logoText: {
    color: "#fff", fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px",
  },
  heading: {
    fontFamily: "'Playfair Display', serif",
    color: "#fff", fontSize: 28, fontWeight: 700, marginBottom: 6,
  },
  subheading: {
    color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif",
    fontSize: 14, marginBottom: 28,
  },
  googleBtn: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12, padding: "12px 20px",
    color: "#fff", fontFamily: "'DM Sans', sans-serif",
    fontSize: 14, fontWeight: 500, cursor: "pointer",
    transition: "all 0.2s",
  },
  dividerRow: {
    display: "flex", alignItems: "center", gap: 12, margin: "20px 0",
  },
  dividerLine: {
    flex: 1, height: 1, background: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
  },
  form: {
    display: "flex", flexDirection: "column", gap: 16,
  },
  fieldGroup: {
    display: "flex", flexDirection: "column", gap: 6,
  },
  label: {
    color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif",
    fontSize: 13, fontWeight: 500,
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "11px 14px",
    color: "#fff", fontFamily: "'DM Sans', sans-serif",
    fontSize: 14, outline: "none", transition: "border-color 0.2s",
    width: "100%",
  },
  forgotBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#10b981", fontFamily: "'DM Sans', sans-serif", fontSize: 12,
  },
  error: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 8, padding: "10px 14px",
    color: "#f87171", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
  },
  submitBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    border: "none", borderRadius: 12, padding: "13px",
    color: "#fff", fontFamily: "'DM Sans', sans-serif",
    fontSize: 15, fontWeight: 600, cursor: "pointer",
    marginTop: 4, transition: "opacity 0.2s",
    boxShadow: "0 0 24px rgba(16,185,129,0.25)",
  },
  switchText: {
    textAlign: "center", marginTop: 20,
    color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
  },
  switchLink: {
    background: "none", border: "none", cursor: "pointer",
    color: "#10b981", fontFamily: "'DM Sans', sans-serif",
    fontSize: 13, fontWeight: 600,
  },
  disclaimer: {
    textAlign: "center", marginTop: 20,
    color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif", fontSize: 11,
  },
};
