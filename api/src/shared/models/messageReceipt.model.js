import mongoose from "mongoose";

/**
 * Per-recipient delivery/read state for a message.
 * Required for correct group-chat ticks: a message is "read" (blue) only when
 * every recipient has read it; "delivered" when every recipient received it.
 */
const messageReceiptSchema = new mongoose.Schema(
  {
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      index: true,
    },
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
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageReceiptSchema.index({ message: 1, user: 1 }, { unique: true });

export const MessageReceipt = mongoose.model(
  "MessageReceipt",
  messageReceiptSchema
);
