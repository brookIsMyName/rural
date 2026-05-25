// src/pages/ChatPage.jsx

import { useState, useRef, useEffect } from "react";

import {
  sendMessage,
  parseUrgency,
  stripUrgencyLine,
} from "../services/claudeApi";

import { useLang } from "../utils/useLang";
import { t } from "../utils/translate";
import { getLanguage } from "../utils/language";

import {
  createConversation,
  getConversations,
  getMessages,
  saveMessage,
  updateConversationTitle,
} from "../services/chatService";

export default function ChatPage({ user }) {
  const [isMobile, setIsMobile] = useState(
  window.innerWidth < 768
);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);

  return () =>
    window.removeEventListener(
      "resize",
      handleResize
    );
}, []);
  useEffect(() => {
  const style = document.createElement("style");

  style.innerHTML = `
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }

      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;

  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}, []);
  const { lang } = useLang();

  const getInitialMessage = () => [
    {
      role: "assistant",
      content: t("initialMessage"),
      urgency: null,
    },
  ];

  const [messages, setMessages] = useState(getInitialMessage);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [conversations, setConversations] = useState([]);

  const [currentConversationId, setCurrentConversationId] =
    useState(null);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  // Reset assistant message on language change
  useEffect(() => {
    setMessages(getInitialMessage());
  }, [lang]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const build = () => {
      const r = new SpeechRecognition();

      r.lang = getLanguage();
      r.continuous = false;
      r.interimResults = true;

      r.onstart = () => setListening(true);

      r.onend = () => setListening(false);

      r.onerror = () => setListening(false);

      r.onresult = (e) => {
        let transcript = "";

        for (let i = 0; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }

        setInput(transcript);
      };

      recognitionRef.current = r;
    };

    build();

    const handler = () => build();

    window.addEventListener("rc:langchange", handler);

    return () =>
      window.removeEventListener(
        "rc:langchange",
        handler
      );
  }, []);

  // Load conversations
  useEffect(() => {
    if (!user?.id) return;

    async function loadChats() {
      try {
        const data = await getConversations(user.id);

        setConversations(data);

        if (data.length > 0) {
          openConversation(data[0]._id);
        } else {
          createNewChat();
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadChats();
  }, [user]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported in your browser."
      );
      return;
    }

    listening
      ? recognitionRef.current.stop()
      : recognitionRef.current.start();
  };

  const createNewChat = async () => {
    try {
      const convo = await createConversation(user.id);

      setConversations((prev) => [convo, ...prev]);

      setCurrentConversationId(convo._id);

      setMessages(getInitialMessage());
    } catch (err) {
      console.error(err);
    }
  };

  const openConversation = async (conversationId) => {
    try {
      if (isMobile) {
  setSidebarOpen(false);
}
      setCurrentConversationId(conversationId);

      const msgs = await getMessages(conversationId);

      if (!msgs || msgs.length === 0) {
        setMessages(getInitialMessage());
      } else {
        setMessages(msgs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const send = async () => {
    const text = input.trim();

    if (!text || loading) return;

let conversationId = currentConversationId;

if (!conversationId) {
  const convo = await createConversation(user.id);

  setConversations((prev) => [convo, ...prev]);

  setCurrentConversationId(convo._id);

  conversationId = convo._id;
}

    const userMessage = {
      role: "user",
      content: text,
    };

    setInput("");

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);

    setLoading(true);

    try {
      // Save user message
      await saveMessage(
        conversationId,
        userMessage
      );

      // Update title
      const currentConvo = conversations.find(
        (c) => c._id === conversationId
      );

      if (
        currentConvo &&
        (!currentConvo.title ||
          currentConvo.title === "New Chat")
      ) {
        const title = text.slice(0, 40);

        await updateConversationTitle(
          conversationId,
          title
        );

        setConversations((prev) =>
          prev.map((c) =>
            c._id === conversationId
              ? { ...c, title }
              : c
          )
        );
      }

      // Claude messages
      const firstUser = updatedMessages.findIndex(
        (m) => m.role === "user"
      );

      const apiMessages = updatedMessages
        .slice(firstUser)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // AI reply
      const reply = await sendMessage(apiMessages);

      const urgency = parseUrgency(reply);

      const cleaned = stripUrgencyLine(reply);

      const assistantMessage = {
        role: "assistant",
        content: cleaned,
        urgency,
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);

      // Save assistant reply
      await saveMessage(
        conversationId,
        assistantMessage
      );
    } catch (err) {
      console.error(err);

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

  const handleBodyMapSubmit = (
  report
) => {
  setInput(report);
};




  const quickPrompts = [
    t("quickPrompt1"),
    t("quickPrompt2"),
    t("quickPrompt3"),
    t("quickPrompt4"),
  ];

  return (
   <div
  style={{
    minHeight: "100vh",
    display: "flex",
    background: "#07110f",
    overflow: "hidden",
  }}
>
      {/* SIDEBAR */}

      <div
       style={{
  width: isMobile
    ? 260
    : sidebarOpen
    ? 280
    : 0,

  position: isMobile ? "fixed" : "relative",

  left:
    isMobile && !sidebarOpen
      ? -280
      : 0,

  top: 62,

  height: "calc(100vh - 62px)",

  zIndex: 1000,

  transition: "0.25s ease",

  overflow: "hidden",

  borderRight:
    sidebarOpen
      ? "1px solid rgba(255,255,255,0.08)"
      : "none",

  background: "#07110f",

  display: "flex",

  flexDirection: "column",

  flexShrink: 0,
}}
      >

        {isMobile && sidebarOpen && (
  <div
    onClick={() => setSidebarOpen(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      zIndex: 999,
    }}
  />
)}
        {/* Header */}

        <div
          style={{
            padding: 16,
            borderBottom:
              "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={createNewChat}
            style={{
              width: "100%",
              background:
                "linear-gradient(135deg,#10b981,#059669)",
              border: "none",
              borderRadius: 12,
              padding: "12px",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            + New Chat
          </button>
        </div>

        {/* Conversations */}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 10,
          }}
        >
          {conversations.map((convo) => (
            <button
              key={convo._id}
              onClick={() =>
                openConversation(convo._id)
              }
              style={{
                width: "100%",
                textAlign: "left",
                background:
                  convo._id === currentConversationId
                    ? "rgba(16,185,129,0.18)"
                    : "transparent",
                border:
                  "1px solid rgba(255,255,255,0.05)",
                borderRadius: 12,
                padding: "12px 14px",
                color: "#fff",
                marginBottom: 8,
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {convo.title || "New Chat"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CHAT */}

      <div
  style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    position: "relative",

    paddingTop: 62,
  }}
>
        {/* TOP BAR */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px 10px",
          }}
        >
          <button
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            style={{
              background:
                "rgba(255,255,255,0.06)",
              border:
                "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              width: 40,
              height: 40,
              color: "#fff",
              cursor: "pointer",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            ☰
          </button>

          <div>
            <h1
              style={{
                fontFamily:
                  "'Playfair Display', serif",
                color: "#fff",
                fontSize: "clamp(22px,3vw,28px)",
                margin: 0,
              }}
            >
              {t("aiHealthChat")}
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 13,
                marginTop: 4,
                fontFamily:
                  "'DM Sans', sans-serif",
              }}
            >
              {t("chatSubtitle")}
            </p>
          </div>
        </div>

        {/* USER */}

        {user && (
          <div
            style={{
              padding: "0 24px 10px",
              color: "rgba(255,255,255,0.3)",
              fontSize: 12,
              fontFamily:
                "'DM Sans', sans-serif",
            }}
          >
            Signed in as{" "}
            {user.name?.split(" ")[0]}
          </div>
        )}

        {/* MESSAGES */}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobile
  ? "10px 12px 16px"
  : "10px 24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  m.role === "user"
                    ? "flex-end"
                    : "flex-start",
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
                    background:
                      "linear-gradient(135deg,#10b981,#0ea5e9)",
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
                  maxWidth: isMobile ? "88%" : "78%",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
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
                    fontFamily:
                      "'DM Sans',sans-serif",
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
                    <span
                      style={{
                        fontSize: 16,
                      }}
                    >
                      {m.urgency.icon}
                    </span>

                    <span
                      style={{
                        color: m.urgency.color,
                        fontFamily:
                          "'DM Sans',sans-serif",
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

          {loading && (
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,#10b981,#0ea5e9)",
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
                  background:
                    "rgba(255,255,255,0.06)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  borderRadius:
                    "16px 16px 16px 4px",
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
      animation: "bounce 1.2s infinite",
      animationDelay: `${d * 0.15}s`,
    }}
  />
))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        
        {/* QUICK PROMPTS */}

        {messages.length <= 1 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              padding: "0 24px 12px",
            }}
          >
            {quickPrompts.map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                style={{
                  background:
                    "rgba(16,185,129,0.08)",
                  border:
                    "1px solid rgba(16,185,129,0.2)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  color:
                    "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  fontFamily:
                    "'DM Sans',sans-serif",
                  cursor: "pointer",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* INPUT */}

        <div
          style={{
            padding: isMobile
  ? "8px 12px 14px"
  : "8px 24px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              background:
                "rgba(255,255,255,0.05)",
              border:
                "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: "10px 12px",
              alignItems: "flex-end",
            }}
          >
            <textarea
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={t("placeholder")}
              rows={1}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "#fff",
                fontFamily:
                  "'DM Sans',sans-serif",
                fontSize: 14,
                resize: "none",
                lineHeight: 1.5,
                maxHeight: 100,
              }}
            />

            <button
              onClick={toggleListening}
              title="Voice input"
              style={{
                background: listening
                  ? "rgba(239,68,68,0.2)"
                  : "rgba(255,255,255,0.07)",

                border: listening
                  ? "1px solid rgba(239,68,68,0.5)"
                  : "1px solid rgba(255,255,255,0.1)",

                borderRadius: 10,
                width: 38,
                height: 38,
                color: listening
                  ? "#ef4444"
                  : "rgba(255,255,255,0.6)",

                fontSize: 16,
                cursor: "pointer",
                flexShrink: 0,
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
                    ? "rgba(16,185,129,0.25)"
                    : "linear-gradient(135deg,#10b981,#059669)",

                border: "none",
                borderRadius: 10,
                width: 38,
                height: 38,
                color: "#fff",
                fontSize: 18,
                cursor:
                  loading || !input.trim()
                    ? "not-allowed"
                    : "pointer",

                flexShrink: 0,
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