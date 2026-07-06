import { Chat } from "../models/chat.model.js";
import { ChatParticipant } from "../models/chatParticipant.model.js";

const userPreviewFields = "name username avatar isOnline lastSeen about";

/**
 * Data access for chats and their participants.
 */
export const chatDao = {
  create(data) {
    return Chat.create(data);
  },

  findById(id) {
    return Chat.findById(id);
  },

  findByIdPopulated(id) {
    return Chat.findById(id)
      .populate("members", userPreviewFields)
      .populate("admins", userPreviewFields)
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name username" },
      });
  },

  /** Existing 1-to-1 chat between exactly two users, if any. */
  findDirectChat(userA, userB) {
    return Chat.findOne({
      isGroup: false,
      members: { $all: [userA, userB], $size: 2 },
    });
  },

  /** All chats a user belongs to, newest activity first. */
  listForUser(userId) {
    return Chat.find({ members: userId })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate("members", userPreviewFields)
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name username" },
      })
      .lean();
  },

  updateById(id, update) {
    return Chat.findByIdAndUpdate(id, update, { new: true });
  },

  deleteById(id) {
    return Chat.findByIdAndDelete(id);
  },

  setLastMessage(chatId, messageId, at) {
    return Chat.findByIdAndUpdate(
      chatId,
      { lastMessage: messageId, lastMessageAt: at },
      { new: true }
    );
  },

  // ---- participants ----

  addParticipant(data) {
    return ChatParticipant.create(data);
  },

  addParticipants(docs) {
    return ChatParticipant.insertMany(docs);
  },

  findParticipant(chatId, userId) {
    return ChatParticipant.findOne({ chat: chatId, user: userId });
  },

  listParticipants(chatId) {
    return ChatParticipant.find({ chat: chatId, isActive: true }).lean();
  },

  updateReadState(chatId, userId, messageId) {
    return ChatParticipant.findOneAndUpdate(
      { chat: chatId, user: userId },
      { lastReadMessage: messageId, lastReadAt: new Date() },
      { new: true }
    );
  },

  deactivateParticipant(chatId, userId) {
    return ChatParticipant.findOneAndUpdate(
      { chat: chatId, user: userId },
      { isActive: false },
      { new: true }
    );
  },
};
