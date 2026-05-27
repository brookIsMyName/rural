// src/pages/WhatsAppDashboard.jsx
// Simple dashboard to monitor WhatsApp bot activity

import { useState, useEffect } from "react";
import { useLang } from "../utils/useLang";
import { t } from "../utils/translate";

export default function WhatsAppDashboard() {
  useLang();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/whatsapp/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: 80, padding: "40px 20px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: "clamp(24px,4vw,36px)", marginBottom: 10 }}>
          📱 WhatsApp Bot Dashboard
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", fontSize: 15 }}>
          Real-time activity monitoring
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif" }}>
          Loading...
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 20, color: "#f87171", textAlign: "center", fontFamily: "'DM Sans',sans-serif" }}>
          ⚠️ {error}
        </div>
      )}

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { label: "Active Users", value: stats.totalUsers || 0, icon: "👥", color: "#10b981" },
            { label: "Total Messages", value: stats.totalMessages || 0, icon: "💬", color: "#0ea5e9" },
            { label: "🔴 Emergency Cases", value: stats.emergencyCount || 0, icon: "🚨", color: "#ef4444" },
          ].map((card) => (
            <div key={card.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{card.icon}</div>
              <div style={{ color: card.color, fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
                {card.value.toLocaleString()}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: 40, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, padding: 24 }}>
        <h3 style={{ color: "#10b981", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, marginBottom: 12 }}>
          📲 How to Test WhatsApp Bot
        </h3>
        <ol style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, lineHeight: 1.8, marginLeft: 20 }}>
          <li>Open WhatsApp on your phone</li>
          <li>Text the test code to the Twilio number</li>
          <li>Send a symptom description (e.g., "I have fever and chest pain")</li>
          <li>AI responds within 5 seconds</li>
          <li>Refresh this page to see stats update</li>
        </ol>
      </div>

      {/* Status Indicator */}
      <div style={{ marginTop: 20, padding: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, color: "#22c55e", fontFamily: "'DM Sans',sans-serif", fontSize: 13, textAlign: "center" }}>
        ✅ WhatsApp bot is live and monitoring
      </div>
    </div>
  );
}
