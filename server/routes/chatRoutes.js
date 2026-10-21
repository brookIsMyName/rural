import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { sendWebsiteMessage } from "../services/claudeApiServer.js";

const router = express.Router();

// GENERATE WEBSITE AI RESPONSE
router.post("/ai-chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "At least one message is required.",
      });
    }

    const validMessages = messages.every(
      (message) =>
        message &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
    );

    if (!validMessages) {
      return res.status(400).json({
        error: "Messages must have a valid role and non-empty content.",
      });
    }

    const text = await sendWebsiteMessage(messages);

    return res.json({ text });
  } catch (err) {
    console.error("Website Gemini error:", err);

    return res.status(500).json({
      error: "Unable to generate a response right now. Please try again.",
    });
  }
});

// CREATE NEW CONVERSATION
router.post("/conversations", async (req, res) => {
  try {
    const { userId } = req.body;
    const convo = await Conversation.create({
      userId,
      title: "New Chat",
    });

    res.json(convo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET USER CONVERSATIONS
router.get("/conversations/:userId", async (req, res) => {
  try {
    const convos = await Conversation.find({
      userId: req.params.userId,
    }).sort({ updatedAt: -1 });

    res.json(convos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET MESSAGES
router.get("/messages/:conversationId", async (req, res) => {
  try {
    const msgs = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });

    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SAVE MESSAGE
router.post("/messages", async (req, res) => {
  try {
    const msg = await Message.create(req.body);

    await Conversation.findByIdAndUpdate(
      req.body.conversationId,
      {},
      { timestamps: true }
    );

    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE TITLE
router.patch("/conversations/:id", async (req, res) => {
  try {
    const convo = await Conversation.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title },
      { new: true }
    );

    res.json(convo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
