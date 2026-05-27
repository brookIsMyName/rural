// server/services/claudeApiServer.js
// Backend-only Claude service for WhatsApp bot
// Uses process.env — NOT import.meta.env

const SYSTEM_PROMPT = `You are RuralCare AI — a compassionate healthcare guidance assistant for WhatsApp.
You help people in rural Africa understand symptoms, assess urgency, and find the right care.

RULES (WhatsApp — mobile first):
- Keep responses concise and easy to read on a small screen
- Use short paragraphs, not walls of text
- Be warm and human, not clinical
- Always end with exactly one urgency line

URGENCY LEVELS — always include one at the very end:
🔴 EMERGENCY — Seek immediate medical care now
🟡 CLINIC VISIT — Visit a clinic within 24–48 hours
🟢 HOME CARE — Can be managed at home with guidance

End your response with this exact format:
URGENCY: 🟡 CLINIC VISIT RECOMMENDED

STRICT RULES:
- Never give a definitive diagnosis
- Never recommend specific drug dosages
- Always recommend professional care for serious symptoms`;

export async function sendWhatsAppMessage(messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not found in server/.env");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system:     SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Claude API ${response.status}: ${err?.error?.message || "Unknown"}`);
  }

  const data = await response.json();
  return data.content?.map((b) => b.text || "").join("") || "Sorry, I could not process that.";
}

export function parseUrgency(text) {
  if (text.includes("🔴") || text.toUpperCase().includes("EMERGENCY"))
    return { level: "emergency", icon: "🔴", label: "Emergency — seek care now" };
  if (text.includes("🟡") || text.toUpperCase().includes("CLINIC VISIT"))
    return { level: "clinic",    icon: "🟡", label: "Clinic Visit Recommended" };
  if (text.includes("🟢") || text.toUpperCase().includes("HOME CARE"))
    return { level: "home",      icon: "🟢", label: "Home Care Guidance" };
  return null;
}

export function stripUrgencyLine(text) {
  return text.replace(/URGENCY:.*$/m, "").trim();
}