
// server/services/claudeApiServer.js
// Backend-only Gemini service for WhatsApp and website chat.
// Uses process.env — NOT import.meta.env.

import { GoogleGenAI } from "@google/genai";

const WHATSAPP_SYSTEM_PROMPT = `You are RuralCare AI — a compassionate healthcare guidance assistant for WhatsApp.
You help people in rural Africa understand symptoms, assess urgency, and find the right care.

RULES:
- Keep responses concise and easy to read on a small screen.
- Use short paragraphs and simple language.
- Be warm and human, not clinical.
- Never give a definitive diagnosis.
- Never recommend specific drug dosages.
- Recommend professional care for serious symptoms.
- End with exactly one appropriate urgency line.

Choose the urgency level based on the symptoms described:
URGENCY: 🔴 EMERGENCY
URGENCY: 🟡 CLINIC VISIT RECOMMENDED
URGENCY: 🟢 HOME CARE

When symptoms suggest a potentially life-threatening emergency, prioritize immediate emergency care.`;

const WEBSITE_SYSTEM_PROMPT = `You are Salvia AI — a compassionate healthcare guidance assistant serving communities in Africa.
Help users understand symptoms and general health topics using clear, accessible language.

RULES:
- Be warm, respectful, calm, and supportive.
- Never give a definitive diagnosis.
- Never recommend specific drug dosages.
- Never invent medical facts or claim certainty when information is incomplete.
- Ask relevant follow-up questions when essential information is missing.
- Recommend professional care for serious, persistent, or unclear symptoms.
- For potentially life-threatening symptoms, advise seeking emergency medical care immediately.
- Consider practical guidance suitable for communities with limited healthcare access.
- End each response with exactly one appropriate urgency line.

Use these urgency classifications:
URGENCY: 🔴 EMERGENCY
URGENCY: 🟡 CLINIC VISIT RECOMMENDED
URGENCY: 🟢 HOME CARE

Choose the level based on the available information. Do not claim a situation is safe when there is not enough information to assess it. For general health questions without symptoms, explain that urgency cannot be determined from the question alone.`;

let ai;

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not found in server environment.");
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }

  return ai;
}

async function generateReply(messages, systemInstruction, maxOutputTokens) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("At least one message is required.");
  }

  const conversation = messages.map((message) => {
    if (
      !message ||
      !["user", "assistant"].includes(message.role) ||
      typeof message.content !== "string" ||
      !message.content.trim()
    ) {
      throw new Error("Invalid message format.");
    }

    return {
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    };
  });

  // Gemini conversations must begin with a user message.
  const firstUserIndex = conversation.findIndex(
    (message) => message.role === "user"
  );

  if (firstUserIndex === -1) {
    throw new Error("A user message is required.");
  }

  const validConversation = conversation.slice(firstUserIndex);

  const response = await getAI().models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: validConversation,
    config: {
      systemInstruction,
      maxOutputTokens,
      temperature: 0.3,
    },
  });

  const text = response.text;

  if (!text || !text.trim()) {
    throw new Error("Gemini returned an empty response.");
  }

  return text.trim();
}

// Existing WhatsApp function — preserved.
export async function sendWhatsAppMessage(messages) {
  return generateReply(messages, WHATSAPP_SYSTEM_PROMPT, 600);
}

// New website function — used by chatRoutes.js.
export async function sendWebsiteMessage(messages) {
  return generateReply(messages, WEBSITE_SYSTEM_PROMPT, 1024);
}

// Existing urgency helper — preserved.
export function parseUrgency(text) {
  const normalized = text.toUpperCase();

  if (text.includes("🔴") || normalized.includes("EMERGENCY")) {
    return {
      level: "emergency",
      icon: "🔴",
      label: "Emergency — seek care now",
    };
  }

  if (text.includes("🟡") || normalized.includes("CLINIC VISIT")) {
    return {
      level: "clinic",
      icon: "🟡",
      label: "Clinic Visit Recommended",
    };
  }

  if (text.includes("🟢") || normalized.includes("HOME CARE")) {
    return {
      level: "home",
      icon: "🟢",
      label: "Home Care Guidance",
    };
  }

  return null;
}

// Existing urgency helper — preserved.
export function stripUrgencyLine(text) {
  return text.replace(/^URGENCY:\s*.*$/gim, "").trim();
}
