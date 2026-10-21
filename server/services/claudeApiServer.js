// server/services/claudeApiServer.js
// Backend-only Claude service for WhatsApp bot
// Uses process.env — NOT import.meta.env
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY not found in server/.env");
}

const ai = new GoogleGenAI({ apiKey });

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

End your response with exactly one line matching the appropriate urgency level:
URGENCY: 🔴 EMERGENCY
URGENCY: 🟡 CLINIC VISIT RECOMMENDED
URGENCY: 🟢 HOME CARE

Choose the level based on the symptoms described. When symptoms suggest a potentially life-threatening emergency, prioritize immediate emergency care.

STRICT RULES:
- Never give a definitive diagnosis
- Never recommend specific drug dosages
- Always recommend professional care for serious symptoms`;

export async function sendWhatsAppMessage(messages) {
  const conversation = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: conversation,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 600,
      temperature: 0.3,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}


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

export function stripUrgencyLine(text) {
  return text.replace(/^URGENCY:\s*.*$/gim, "").trim();
}