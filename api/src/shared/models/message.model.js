import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    fileId: { type: String },
    url: { type: String },
    thumbnailUrl: { type: String },
    name: { type: String },
    size: { type: Number },
    mimeType: { type: String },
  },
  { _id: false }
);

/**
 * A chat message.
 *
 * Delivery is modelled with a simple status ladder used for the tick UI:
 *   sent      -> single grey tick
 *   delivered -> double grey tick
 *   read      -> double blue tick
 *
 * Per-recipient detail lives in MessageReceipt (needed for group chats),
 * while `status` is the aggregate state shown to the sender.
 */
const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    messageType: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    content: { type: String, default: "" }, // text body
    media: { type: mediaSchema, default: null }, // image metadata

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
