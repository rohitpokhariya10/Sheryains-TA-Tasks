import { Message } from "../models/message.model.js";
import { MessageReceipt } from "../models/messageReceipt.model.js";

const senderFields = "name username avatar";

/**
 * Data access for messages and their per-recipient receipts.
 */
export const messageDao = {
  create(data) {
    return Message.create(data);
  },

  findByIdPopulated(id) {
    return Message.findById(id).populate("sender", senderFields);
  },

  /**
   * Paginated history for a chat, newest first.
   * `before` (a message _id) enables "load older messages" cursor paging.
   */
  async listForChat(chatId, { limit = 25, before = null, userId }) {
    const filter = { chat: chatId, deletedFor: { $ne: userId } };
    if (before) filter._id = { $lt: before };

    const items = await Message.find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .populate("sender", senderFields)
      .lean();

    return items.reverse(); // return chronological order
  },

  updateStatus(messageId, status) {
    return Message.findByIdAndUpdate(messageId, { status }, { new: true });
  },

  // ---- receipts ----

  createReceipts(docs) {
    return MessageReceipt.insertMany(docs);
  },

  /** Mark delivered for a recipient across pending messages of a chat. */
  markDelivered(chatId, userId) {
    return MessageReceipt.updateMany(
      { chat: chatId, user: userId, status: "sent" },
      { status: "delivered", deliveredAt: new Date() }
    );
  },

  /** Mark read for a recipient across all messages in a chat. */
  markRead(chatId, userId) {
    return MessageReceipt.updateMany(
      { chat: chatId, user: userId, status: { $ne: "read" } },
      { status: "read", deliveredAt: new Date(), readAt: new Date() }
    );
  },

  /** Lowest aggregate status among all recipients of a message. */
  async aggregateStatus(messageId) {
    const receipts = await MessageReceipt.find({ message: messageId }).lean();
    if (!receipts.length) return "sent";
    if (receipts.every((r) => r.status === "read")) return "read";
    if (receipts.every((r) => r.status !== "sent")) return "delivered";
    return "sent";
  },

  listReceiptsForMessages(messageIds) {
    return MessageReceipt.find({ message: { $in: messageIds } }).lean();
  },
};
