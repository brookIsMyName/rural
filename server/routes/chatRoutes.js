import express from "express";

import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const router = express.Router();


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
    res.status(500).json({
      error: err.message,
    });
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
    res.status(500).json({
      error: err.message,
    });
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
    res.status(500).json({
      error: err.message,
    });
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
    res.status(500).json({
      error: err.message,
    });
  }
});


// UPDATE TITLE
router.patch("/conversations/:id", async (req, res) => {
  try {
    const convo =
      await Conversation.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title,
        },
        { new: true }
      );

    res.json(convo);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;