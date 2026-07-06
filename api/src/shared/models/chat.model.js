import mongoose from "mongoose";

const avatarSchema = new mongoose.Schema(
  {
    fileId: { type: String },
    url: { type: String },
    thumbnailUrl: { type: String },
    name: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

/**
 * A conversation. `isGroup=false` => 1-to-1, `isGroup=true` => group chat.
 * Participants live in the ChatParticipant collection (for read-state, roles).
 */
const chatSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    name: { type: String, trim: true }, // group name only
    avatar: { type: avatarSchema, default: {} }, // group avatar only

    // Denormalized participant ids for quick membership checks / uniqueness.
    members: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    ],

    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Pointer to the latest message for the chat-list preview.
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
);

chatSchema.index({ members: 1, lastMessageAt: -1 });

export const Chat = mongoose.model("Chat", chatSchema);
