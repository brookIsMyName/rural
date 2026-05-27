import { API_BASE } from "../config/api";

const API = `${API_BASE}/api/chat`;

function withAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("rc_token");
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}


// CREATE CHAT
export async function createConversation(userId) {
  const res = await fetch(
    `${API}/conversations`,
    {
      method: "POST",
      headers: {
        ...withAuthHeaders({ "Content-Type": "application/json" }),
      },
      body: JSON.stringify({ userId }),
    }
  );

  return res.json();
}


// GET CHATS
export async function getConversations(userId) {
  const res = await fetch(`${API}/conversations/${userId}`, {
    headers: withAuthHeaders(),
  });

  return res.json();
}


// GET MESSAGES
export async function getMessages(conversationId) {
  const res = await fetch(`${API}/messages/${conversationId}`, {
    headers: withAuthHeaders(),
  });

  return res.json();
}


// SAVE MESSAGE
// SAVE MESSAGE
export async function saveMessage(
  conversationId,
  message
) {
  const res = await fetch(
    `${API}/messages`,
    {
      method: "POST",
      headers: {
        ...withAuthHeaders({ "Content-Type": "application/json" }),
      },

      body: JSON.stringify({
        conversationId,
        role: message.role,
        content: message.content,
        urgency: message.urgency || null,
      }),
    }
  );

  return res.json();
}

// UPDATE TITLE
export async function updateConversationTitle(
  id,
  title
) {
  const res = await fetch(
    `${API}/conversations/${id}`,
    {
      method: "PATCH",
      headers: {
        ...withAuthHeaders({ "Content-Type": "application/json" }),
      },
      body: JSON.stringify({ title }),
    }
  );

  return res.json();
}