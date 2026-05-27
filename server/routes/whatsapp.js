// server/routes/whatsapp.js

import express from "express";
import twilio  from "twilio";
import { sendWhatsAppMessage, parseUrgency, stripUrgencyLine } from "../services/claudeApiServer.js";
import WhatsAppUser    from "../services/WhatsAppUser.js";
import WhatsAppMessage from "../models/WhatsAppMessage.js";

const router = express.Router();

const getClient = () => twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ── POST /api/whatsapp/incoming ───────────────────────────────────────────────
router.post("/incoming", async (req, res) => {
  // Must respond to Twilio within 15s with TwiML — do it first
  res.setHeader("Content-Type", "text/xml");
  res.status(200).send("<?xml version='1.0' encoding='UTF-8'?><Response></Response>");

  // Everything else runs after response is sent
  try {
    const From        = req.body?.From;
    const Body        = req.body?.Body;
    const ProfileName = req.body?.ProfileName;

    console.log(`\n[WhatsApp] ← Incoming`);
    console.log(`  From:    ${From}`);
    console.log(`  Message: ${Body}`);

    if (!From?.startsWith("whatsapp:") || !Body?.trim()) {
      console.warn("[WhatsApp] Invalid message — skipping");
      return;
    }

    const phoneNumber = From.replace("whatsapp:", "");

    // ── Find or create WhatsApp user ─────────────────────────────────────────
    let waUser = await WhatsAppUser.findOne({ phoneNumber });
    if (!waUser) {
      waUser = await WhatsAppUser.create({
        phoneNumber,
        displayName: ProfileName || "WhatsApp User",
      });
      console.log(`[WhatsApp] ✅ New user: ${phoneNumber}`);
    }

    // ── Save incoming message ─────────────────────────────────────────────────
    await WhatsAppMessage.create({
      phoneNumber,
      role:    "user",
      content: Body.trim(),
    });

    // ── Build conversation context (last 10 messages) ─────────────────────────
    const recent = await WhatsAppMessage
      .find({ phoneNumber })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    const context = recent
      .reverse()
      .map((m) => ({ role: m.role, content: m.content }));

    console.log(`[WhatsApp] Sending ${context.length} messages to Claude...`);

    // ── Call Claude ───────────────────────────────────────────────────────────
    const aiResponse   = await sendWhatsAppMessage(context);
    const urgency      = parseUrgency(aiResponse);
    const cleanedReply = stripUrgencyLine(aiResponse);

    console.log(`[WhatsApp] Claude replied — urgency: ${urgency?.level || "none"}`);

    // ── Save assistant reply ──────────────────────────────────────────────────
    await WhatsAppMessage.create({
      phoneNumber,
      role:    "assistant",
      content: cleanedReply,
      urgency: urgency || undefined,
    });

    // ── Update user stats ─────────────────────────────────────────────────────
    await WhatsAppUser.findByIdAndUpdate(waUser._id, {
      lastMessageAt: new Date(),
      $inc: { messageCount: 1 },
    });

    // ── Send reply via Twilio ─────────────────────────────────────────────────
    const replyBody = cleanedReply +
      (urgency ? `\n\n${urgency.icon} ${urgency.label}` : "");

    const sent = await getClient().messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to:   From,
      body: replyBody,
    });

    console.log(`[WhatsApp] ✅ Reply sent — SID: ${sent.sid}`);

  } catch (err) {
    console.error(`[WhatsApp] ❌ Error: ${err.message}`);
    // Try to notify user of failure
    try {
      await getClient().messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to:   req.body?.From,
        body: "Sorry, I'm having trouble right now. Please try again in a moment. 🙏",
      });
    } catch { /* ignore secondary error */ }
  }
});

// ── GET /api/whatsapp/ping ────────────────────────────────────────────────────
router.get("/ping", (_req, res) => {
  res.json({
    ok:             true,
    twilio_number:  process.env.TWILIO_WHATSAPP_NUMBER || "❌ NOT SET",
    anthropic_key:  process.env.ANTHROPIC_API_KEY      ? "✅ SET" : "❌ MISSING — add to server/.env",
    twilio_sid:     process.env.TWILIO_ACCOUNT_SID     ? "✅ SET" : "❌ MISSING",
    twilio_token:   process.env.TWILIO_AUTH_TOKEN      ? "✅ SET" : "❌ MISSING",
  });
});

// ── GET /api/whatsapp/stats ───────────────────────────────────────────────────
router.get("/stats", async (_req, res) => {
  try {
    const totalUsers     = await WhatsAppUser.countDocuments();
    const totalMessages  = await WhatsAppMessage.countDocuments();
    const emergencyCount = await WhatsAppMessage.countDocuments({ "urgency.level": "emergency" });
    res.json({ totalUsers, totalMessages, emergencyCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
