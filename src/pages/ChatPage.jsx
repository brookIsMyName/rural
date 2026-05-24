// src/pages/ChatPage.jsx
import { useState, useRef, useEffect } from "react";
import { sendMessage, parseUrgency, stripUrgencyLine } from "../services/claudeApi";
import { useLang } from "../utils/useLang";
import { t } from "../utils/translate";
import { getLanguage } from "../utils/language";

const QUICK_PROMPTS = [
  "I have a fever and body aches",
  "My child has diarrhea and vomiting",
  "I was bitten by a snake",
  "How do I treat a burn at home?",
];

export default function ChatPage() {
  useLang(); // re-render when language changes

  // Build the initial message fresh using t() so it respects current language
  const [messages, setMessages] = useState(() => [{
    role: "assistant",
    content: t("initialMessage"),
    urgency: null,
  }]);

  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [listening, setListening] = useState(false);

  const bottomRef      = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Build / rebuild speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const build = () => {
      const r = new SpeechRecognition();
      r.lang              = getLanguage();
      r.continuous        = false;
      r.interimResults    = true;
      r.onstart           = () => setListening(true);
      r.onend             = () => setListening(false);
      r.onerror           = () => setListening(false);
      r.onresult          = (e) => {
        let transcript = "";
        for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
        setInput(transcript);
      };
      recognitionRef.current = r;
    };

    build();

    // Rebuild when language changes so recognition uses correct lang
    const handler = () => build();
    window.addEventListener("rc:langchange", handler);
    return () => window.removeEventListener("rc:langchange", handler);
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) { alert("Speech recognition is not supported in your browser."); return; }
    listening ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Strip extra fields before sending to API
      const apiMessages = newMessages
        .filter((m) => m.role === "user" || (m.role === "assistant" && newMessages.indexOf(m) > 0))
        .map((m) => ({ role: m.role, content: m.content }));

      // Ensure first message is always user
      const firstUser = apiMessages.findIndex((m) => m.role === "user");
      const trimmed   = firstUser === -1 ? apiMessages : apiMessages.slice(firstUser);

      const reply   = await sendMessage(trimmed);
      const urgency = parseUrgency(reply);
      const cleaned = stripUrgencyLine(reply);
      setMessages((prev) => [...prev, { role: "assistant", content: cleaned, urgency }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I'm having trouble connecting. Please check your connection and try again.",
        urgency: null,
      }]);
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: 62, display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 780, width: "100%", margin: "0 auto", flex: 1, display: "flex", flexDirection: "column", padding: "20px 16px 0" }}>

        {/* Header */}
        <div style={{ textAlign: "center", padding: "20px 0 16px" }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: "#fff", fontSize: "clamp(22px,3vw,28px)", marginBottom: 6 }}>{t("aiHealthChat")}</h1>
          <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>{t("chatSubtitle")}</p>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16, display: "flex", flexDirection: "column", gap: 16, minHeight: 0, maxHeight: "calc(100vh - 280px)" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
              {m.role === "assistant" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#0ea5e9)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏥</div>
              )}
              <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ background: m.role === "user" ? "linear-gradient(135deg,#10b981,#059669)" : "rgba(255,255,255,0.06)", border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "12px 16px", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {m.content}
                </div>
                {m.urgency && (
                  <div style={{ background: m.urgency.bg, border: `1px solid ${m.urgency.color}40`, borderRadius: 10, padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{m.urgency.icon}</span>
                    <span style={{ color: m.urgency.color, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600 }}>{m.urgency.label}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏥</div>
              <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px 16px 16px 4px", padding: "14px 18px", display: "flex", gap: 6, alignItems: "center" }}>
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: `bounce 1.2s ${d * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 12 }}>
            {QUICK_PROMPTS.map((q) => (
              <button key={q} onClick={() => setInput(q)} style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 20, padding: "6px 14px", color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div style={{ paddingBottom: 20, paddingTop: 8 }}>
          <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "10px 12px", alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={t("placeholder")}
              rows={1}
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 14, resize: "none", lineHeight: 1.5, maxHeight: 100 }}
            />
            {/* Mic button */}
            <button onClick={toggleListening} title="Voice input" style={{ background: listening ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)", border: listening ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)", borderRadius: 10, width: 38, height: 38, color: listening ? "#ef4444" : "rgba(255,255,255,0.6)", fontSize: 16, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
              {listening ? "🔴" : "🎤"}
            </button>
            {/* Send button */}
            <button onClick={send} disabled={loading || !input.trim()} style={{ background: loading || !input.trim() ? "rgba(16,185,129,0.25)" : "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 10, width: 38, height: 38, color: "#fff", fontSize: 18, cursor: loading || !input.trim() ? "not-allowed" : "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
              →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
