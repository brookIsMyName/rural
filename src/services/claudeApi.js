// src/services/claudeApi.js
// All AI calls go through the backend Gemini service.

import { API_BASE } from "../config/api";

function toChatMessages(messages) {
  const firstUserIndex = messages.findIndex(
    (message) => message.role === "user"
  );

  if (firstUserIndex === -1) {
    return [];
  }

  return messages.slice(firstUserIndex).map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

export async function sendMessage(messages) {
  const chatMessages = toChatMessages(messages);

  if (chatMessages.length === 0) {
    throw new Error("No user messages to send.");
  }

  let response;

  try {
    response = await fetch(`${API_BASE}/api/chat/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        messages: chatMessages,
      }),
    });
  } catch (networkErr) {
    console.error("[Gemini] Network error:", networkErr);
    throw new Error(
      "Network error — check your internet connection."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("[Gemini] Backend error:", response.status, data);

    if (response.status === 401) {
      throw new Error(
        "Your session may have expired. Please sign in again."
      );
    }

    if (response.status === 429) {
      throw new Error(
        "Too many requests. Please wait and try again."
      );
    }

    throw new Error(
      data?.error ||
        data?.message ||
        `AI request failed (${response.status}).`
    );
  }

  const text = data?.text;

  if (typeof text !== "string" || !text.trim()) {
    console.error("[Gemini] Unexpected backend response:", data);
    throw new Error(
      "Empty or unexpected response from the AI service."
    );
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
      color: "red",
      bg: "bg-red-100",
    };
  }

  if (text.includes("🟡") || normalized.includes("CLINIC VISIT")) {
    return {
      level: "clinic",
      icon: "🟡",
      label: "Clinic Visit Recommended",
      color: "yellow",
      bg: "bg-yellow-100",
    };
  }

  if (text.includes("🟢") || normalized.includes("HOME CARE")) {
    return {
      level: "home",
      icon: "🟢",
      label: "Home Care Guidance",
      color: "green",
      bg: "bg-green-100",
    };
  }

  return null;
}

export function stripUrgencyLine(text) {
  return text.replace(/^URGENCY:.*$/gim, "").trim();
}
