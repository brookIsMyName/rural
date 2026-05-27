// server/models/WhatsAppUser.js
// Completely standalone model — no relation to the main User model

import mongoose from "mongoose";

// Use a brand new connection schema — no shared validators with User.js
const whatsAppUserSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
    },
    displayName: {
      type:    String,
      default: "WhatsApp User",
    },
    language: {
      type:    String,
      default: "en",
    },
    lastMessageAt: {
      type:    Date,
      default: Date.now,
    },
    messageCount: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "WhatsAppUsers", // explicit collection name avoids any model conflicts
  }
);

// Guard against model recompilation in dev (nodemon hot reload)
const WhatsAppUser =
  mongoose.models.WhatsAppUser ||
  mongoose.model("WhatsAppUser", whatsAppUserSchema);

export default WhatsAppUser;
