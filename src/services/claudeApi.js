// src/services/claudeApi.js
// ─────────────────────────────────────────────────────────────────────────────
// All AI calls go through this file.
// Model: claude-sonnet-4-6  (fast, smart, great for chat)
// Docs:  https://docs.anthropic.com
// ─────────────────────────────────────────────────────────────────────────────

const CLAUDE_URL   = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are Salvia AI — a compassionate, knowledgeable healthcare guidance assistant serving underserved rural communities in Africa.

Your responsibilities:
- Ask adaptive, helpful follow-up questions to better understand the user's situation
- Provide safe, practical healthcare guidance appropriate for low-resource settings
- Explain medical information in simple, clear language (avoid jargon)
- Classify urgency using one of three levels at the end of your response:
  🔴 EMERGENCY — Seek immediate care now
  🟡 CLINIC VISIT — Visit a clinic within 24–48 hours
  🟢 HOME CARE — Can be managed at home with guidance
- Consider rural context: limited access to clinics, medications, and diagnostics
- Encourage professional healthcare whenever there is any doubt

STRICT SAFETY RULES — NEVER violate these:
- NEVER provide a definitive diagnosis
- NEVER prescribe specific medication dosages
- NEVER claim certainty about a medical condition
- ALWAYS recommend a healthcare professional when symptoms are serious or unclear
- ALWAYS include this reminder when relevant: "This guidance does not replace professional medical advice."

Your tone should be: warm, calm, trustworthy, and empowering. You are a knowledgeable friend, not a doctor.

When the user describes symptoms, always:
1. Acknowledge their concern warmly
2. Ask 1-2 clarifying follow-up questions before giving guidance (unless it is clearly an emergency)
3. Give practical, actionable guidance
4. End with the urgency classification

Format responses cleanly using markdown.

Use:
- headings
- bullet points
- short paragraphs

Do not overuse bold formatting.

Format urgency at the END of your response on its own line, like:
URGENCY: 🟡 CLINIC VISIT RECOMMENDED`;

// ─────────────────────────────────────────────────────────────────────────────
// Claude expects { role: "user" | "assistant", content: string }
// The initial assistant greeting must be stripped — Claude's API requires the
// conversation to begin with a "user" turn.
// ─────────────────────────────────────────────────────────────────────────────
function toClaudeMessages(messages) {
  const firstUserIndex = messages.findIndex((m) => m.role === "user");
  if (firstUserIndex === -1) return [];
  return messages.slice(firstUserIndex).map((m) => ({
    role:    m.role, // "user" or "assistant" — Claude uses these natively
    content: m.content,
  }));
}

/**
 * Sends a conversation to Claude and returns the text reply.
 * @param {Array<{role: "user"|"assistant", content: string}>} messages
 * @returns {Promise<string>}
 */
export async function sendMessage(messages) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "your_anthropic_api_key_here") {
    throw new Error("API key not set. Open .env.local and add your VITE_ANTHROPIC_API_KEY.");
  }

  const claudeMessages = toClaudeMessages(messages);

  if (claudeMessages.length === 0) {
    throw new Error("No user messages to send.");
  }

  const body = {
    model:      CLAUDE_MODEL,
    max_tokens: 1024,
    system:     SYSTEM_PROMPT,
    messages:   claudeMessages,
  };

  console.log("[Claude] sending", claudeMessages.length, "turns to", CLAUDE_MODEL);

  let response;
  try {
    response = await fetch(CLAUDE_URL, {
      method:  "POST",
      headers: {
        "Content-Type":                          "application/json",
        "x-api-key":                             apiKey,
        "anthropic-version":                     "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    console.error("[Claude] Network error:", networkErr);
    throw new Error("Network error — check your internet connection.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[Claude] API error:", response.status, JSON.stringify(data, null, 2));
    const msg = data?.error?.message || `Claude API error ${response.status}`;
    if (response.status === 401) throw new Error("Invalid API key — check VITE_ANTHROPIC_API_KEY in .env.local");
    if (response.status === 429) throw new Error("Rate limit hit — slow down and try again.");
    if (response.status === 529) throw new Error("Claude is overloaded right now. Try again in a moment.");
    throw new Error(msg);
  }

  // Claude response shape: content[0].text
  const text = data?.content?.[0]?.text;

  if (!text) {
    console.error("[Claude] Unexpected response shape:", JSON.stringify(data, null, 2));
    throw new Error("Empty or unexpected response from Claude.");
  }

  console.log("[Claude] reply received OK");
  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// Urgency helpers — same as before, model-agnostic
// ─────────────────────────────────────────────────────────────────────────────

export function parseUrgency(text) {
  const upper = text.toUpperCase();
  if (text.includes("🔴") || upper.includes("EMERGENCY")) {
    return { level: "emergency", icon: "🔴", label: "Emergency — Seek immediate care", color: "#ef4444", bg: "rgba(239,68,68,0.15)" };
  }
  if (text.includes("🟡") || upper.includes("CLINIC VISIT")) {
    return { level: "clinic", icon: "🟡", label: "Clinic Visit Recommended", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" };
  }
  if (text.includes("🟢") || upper.includes("HOME CARE")) {
    return { level: "home", icon: "🟢", label: "Home Care Guidance", color: "#22c55e", bg: "rgba(34,197,94,0.15)" };
  }
  return null;
}

export function stripUrgencyLine(text) {
  return text.replace(/URGENCY:.*$/m, "").trim();
}
