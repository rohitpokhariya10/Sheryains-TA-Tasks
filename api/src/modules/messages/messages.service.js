import { messageDao } from "../../shared/dao/message.dao.js";
import { chatDao } from "../../shared/dao/chat.dao.js";
import { ApiError } from "../../shared/utils/ApiError.js";

/** Attach the per-recipient receipts to a list of messages (for tick UI). */
async function withReceipts(messages) {
  if (!messages.length) return messages;
  const ids = messages.map((m) => m._id);
  const receipts = await messageDao.listReceiptsForMessages(ids);
  const byMessage = new Map();
  for (const r of receipts) {
    const key = r.message.toString();
    if (!byMessage.has(key)) byMessage.set(key, []);
    byMessage.get(key).push({ user: r.user, status: r.status });
  }
  return messages.map((m) => ({
    ...m,
    receipts: byMessage.get(m._id.toString()) || [],
  }));
}

export const messagesService = {
  /**
   * Persists a new message, creates receipts for every other member,
   * and bumps the chat's lastMessage pointer.
   * Called by both the REST controller and the socket handler.
   */
  async createMessage({ chatId, senderId, messageType, content, media }) {
    const chat = await chatDao.findById(chatId);
    if (!chat) throw ApiError.notFound("Chat not found");
    if (!chat.members.some((m) => m.toString() === senderId.toString())) {
      throw ApiError.forbidden("Not a member of this chat");
    }

    if (messageType === "image" && !media?.url) {
      throw ApiError.badRequest("Image message requires media");
    }
    if (messageType === "text" && !content?.trim()) {
      throw ApiError.badRequest("Text message cannot be empty");
    }

    const message = await messageDao.create({
      chat: chatId,
      sender: senderId,
      messageType: messageType || "text",
      content: content || "",
      media: media || null,
      status: "sent",
    });

    // One receipt per recipient (everyone except the sender).
    const recipients = chat.members
      .map((m) => m.toString())
      .filter((m) => m !== senderId.toString());

    if (recipients.length) {
      await messageDao.createReceipts(
        recipients.map((user) => ({
          message: message._id,
          chat: chatId,
          user,
          status: "sent",
        }))
      );
    }

    await chatDao.setLastMessage(chatId, message._id, message.createdAt);

    const populated = await messageDao.findByIdPopulated(message._id);
    return { message: populated.toObject(), recipients, chat };
  },

  async listMessages(userId, chatId, query) {
    const chat = await chatDao.findById(chatId);
    if (!chat) throw ApiError.notFound("Chat not found");
    if (!chat.members.some((m) => m.toString() === userId.toString())) {
      throw ApiError.forbidden("Not a member of this chat");
    }

    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
    const messages = await messageDao.listForChat(chatId, {
      limit,
      before: query.before || null,
      userId,
    });

    const withR = await withReceipts(messages);
    return {
      messages: withR,
      hasMore: messages.length === limit,
      oldestId: messages[0]?._id || null,
    };
  },

  /**
   * Marks all messages in a chat as delivered for a recipient, then
   * recomputes aggregate status for affected messages.
   * Returns the sender-facing status updates to broadcast.
   */
  async markDelivered(chatId, userId) {
    await messageDao.markDelivered(chatId, userId);
    return this.recomputeChatStatuses(chatId);
  },

  async markRead(chatId, userId) {
    await messageDao.markRead(chatId, userId);
    await chatDao.updateReadState(chatId, userId, null);
    return this.recomputeChatStatuses(chatId);
  },

  /**
   * Recomputes the aggregate `status` for messages of a chat whose stored
   * status is stale, and returns the changed {messageId, status} list.
   */
  async recomputeChatStatuses(chatId) {
    const { Message } = await import("../../shared/models/message.model.js");
    const pending = await Message.find({
      chat: chatId,
      status: { $ne: "read" },
    })
      .select("_id status sender")
      .lean();

    const updates = [];
    for (const msg of pending) {
      const agg = await messageDao.aggregateStatus(msg._id);
      if (agg !== msg.status) {
        await messageDao.updateStatus(msg._id, agg);
        updates.push({
          messageId: msg._id.toString(),
          status: agg,
          sender: msg.sender.toString(),
        });
      }
    }
    return updates;
  },
};
