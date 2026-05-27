// server/models/WhatsAppMessage.js
import mongoose from "mongoose";

const whatsAppMessageSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    urgency: {
      level: { type: String, enum: ["emergency", "clinic", "home"], default: null },
      icon: String,
      label: String,
      color: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { collection: "WhatsAppMessages" }
);

export default mongoose.model("WhatsAppMessage", whatsAppMessageSchema);
