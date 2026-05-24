// src/pages/ChatPage.jsx
import { useState, useRef, useEffect } from "react";
import {
  sendMessage,
  parseUrgency,
  stripUrgencyLine,
} from "../services/claudeApi";
import { getLanguage } from "../utils/language";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hello! I'm RuralCare AI — your healthcare guidance assistant.\n\nI can help you understand symptoms, assess urgency, and find the right care. I'm not a doctor, but I'm here to help you navigate your health situation safely.\n\nHow can I help you today? You can describe symptoms, ask a health question, or request first aid guidance.",
  urgency: null,
};

const QUICK_PROMPTS = [
  "I have a fever and body aches",
  "My child has diarrhea and vomiting",
  "I was bitten by a snake",
  "How do I treat a burn at home?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 useEffect(() => {
  const updateRecognitionLanguage = () => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getLanguage();
    }
  };

  const rebuildRecognition = () => {
    recognitionRef.current = null;
  };

  window.addEventListener("storage", updateRecognitionLanguage);
  window.addEventListener("languagechange", rebuildRecognition);

  return () => {
    window.removeEventListener("storage", updateRecognitionLanguage);
    window.removeEventListener("languagechange", rebuildRecognition);
  };
}, []);



  useEffect(() => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) return;

  const createRecognition = () => {
    const recognition = new SpeechRecognition();

    recognition.lang = getLanguage(); // 👈 ALWAYS CURRENT LANGUAGE
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onerror = (e) => {
      console.error(e);
      setListening(false);
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    return recognition;
  };

  recognitionRef.current = createRecognition();

  // 🔥 IMPORTANT: update recognition when language changes
  const onStorageChange = () => {
    recognitionRef.current = createRecognition();
  };

  window.addEventListener("storage", onStorageChange);

  return () => {
    window.removeEventListener("storage", onStorageChange);
  };
}, []);



  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const reply = await sendMessage(apiMessages);
      const urgency = parseUrgency(reply);
      const cleaned = stripUrgencyLine(reply);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: cleaned, urgency },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting. Please check your connection and try again.",
          urgency: null,
        },
      ]);
    }

    setLoading(false);
  };
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: 60,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          maxWidth: 780,
          width: "100%",
          margin: "0 auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px 0",
        }}
      >
        {/* Header */}
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          🌍 Language: {getLanguage()}
        </div>
        <div style={{ textAlign: "center", padding: "20px 0 16px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#fff",
              fontSize: "clamp(22px,3vw,28px)",
              marginBottom: 6,
            }}
          >
            AI Health Chat
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ⚠️ This does not replace professional medical advice
          </p>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingBottom: 16,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minHeight: 0,
            maxHeight: "calc(100vh - 280px)",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                gap: 10,
                alignItems: "flex-end",
              }}
            >
              {m.role === "assistant" && (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#10b981,#0ea5e9)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  🏥
                </div>
              )}
              <div
                style={{
                  maxWidth: "78%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    background:
                      m.role === "user"
                        ? "linear-gradient(135deg,#10b981,#059669)"
                        : "rgba(255,255,255,0.06)",
                    border:
                      m.role === "user"
                        ? "none"
                        : "1px solid rgba(255,255,255,0.08)",
                    borderRadius:
                      m.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    padding: "12px 16px",
                    color: "#fff",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>

                {m.urgency && (
                  <div
                    style={{
                      background: m.urgency.bg,
                      border: `1px solid ${m.urgency.color}40`,
                      borderRadius: 10,
                      padding: "8px 14px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{m.urgency.icon}</span>
                    <span
                      style={{
                        color: m.urgency.color,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {m.urgency.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#10b981,#0ea5e9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                🏥
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px 16px 16px 4px",
                  padding: "14px 18px",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#10b981",
                      display: "inline-block",
                      animation: `bounce 1.2s ${d * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick prompts — only shown on first message */}
        {messages.length <= 1 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              paddingBottom: 12,
            }}
          >
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ paddingBottom: 20, paddingTop: 8 }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: "10px 14px",
              alignItems: "flex-end",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Describe your symptoms or ask a health question..."
              rows={1}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                resize: "none",
                lineHeight: 1.5,
                maxHeight: 100,
              }}
            />
            <button
              onClick={toggleListening}
              style={{
                background: listening
                  ? "rgba(239,68,68,0.2)"
                  : "rgba(255,255,255,0.08)",
                border: listening
                  ? "1px solid rgba(239,68,68,0.5)"
                  : "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                width: 38,
                height: 38,
                color: listening ? "#ef4444" : "#fff",
                fontSize: 16,
                cursor: "pointer",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              {listening ? "🔴" : "🎤"}
            </button>
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                background:
                  loading || !input.trim()
                    ? "rgba(16,185,129,0.3)"
                    : "linear-gradient(135deg,#10b981,#059669)",
                border: "none",
                borderRadius: 10,
                width: 38,
                height: 38,
                color: "#fff",
                fontSize: 18,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
