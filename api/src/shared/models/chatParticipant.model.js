import mongoose from "mongoose";

/**
 * Per-user membership row for a chat. Tracks role and read state so we can
 * compute unread counts and "blue tick" read receipts efficiently.
 */
const chatParticipantSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: { type: String, enum: ["member", "admin"], default: "member" },

    // Last message this participant has read (drives unread count / receipts).
    lastReadMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastReadAt: { type: Date, default: null },

    // Soft-leave for groups.
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

chatParticipantSchema.index({ chat: 1, user: 1 }, { unique: true });

export const ChatParticipant = mongoose.model(
  "ChatParticipant",
  chatParticipantSchema
);
