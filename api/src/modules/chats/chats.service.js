import { chatDao } from "../../shared/dao/chat.dao.js";
import { userDao } from "../../shared/dao/user.dao.js";
import { ApiError } from "../../shared/utils/ApiError.js";

/** Shape a chat document for the client, adding the "other user" for DMs. */
function shapeChat(chat, currentUserId) {
  const c = chat.toObject ? chat.toObject() : chat;
  let title = c.name;
  let avatar = c.avatar || {};

  if (!c.isGroup && Array.isArray(c.members)) {
    const other = c.members.find(
      (m) => m._id?.toString() !== currentUserId.toString()
    );
    if (other) {
      title = other.name;
      avatar = other.avatar || {};
    }
  }

  return {
    id: c._id,
    isGroup: c.isGroup,
    title,
    avatar,
    name: c.name,
    members: c.members,
    admins: c.admins,
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt,
    createdBy: c.createdBy,
    updatedAt: c.updatedAt,
  };
}

export const chatsService = {
  async listMyChats(userId) {
    const chats = await chatDao.listForUser(userId);
    return chats.map((c) => shapeChat(c, userId));
  },

  /** Get or create a 1-to-1 chat between the current user and a target. */
  async openDirectChat(userId, targetUserId) {
    if (userId === targetUserId) {
      throw ApiError.badRequest("Cannot open a chat with yourself");
    }

    const target = await userDao.findById(targetUserId);
    if (!target) throw ApiError.notFound("Target user not found");

    let chat = await chatDao.findDirectChat(userId, targetUserId);
    if (!chat) {
      chat = await chatDao.create({
        isGroup: false,
        members: [userId, targetUserId],
        createdBy: userId,
      });
      await chatDao.addParticipants([
        { chat: chat._id, user: userId, role: "member" },
        { chat: chat._id, user: targetUserId, role: "member" },
      ]);
    }

    const populated = await chatDao.findByIdPopulated(chat._id);
    return shapeChat(populated, userId);
  },

  async createGroup(userId, { name, memberIds, avatar }) {
    const uniqueMembers = Array.from(
      new Set([userId, ...(memberIds || [])].map((id) => id.toString()))
    );
    if (uniqueMembers.length < 2) {
      throw ApiError.badRequest("A group needs at least one other member");
    }

    const users = await userDao.findManyByIds(uniqueMembers);
    const foundIds = new Set(users.map((u) => u._id.toString()));
    const missingIds = uniqueMembers.filter((id) => !foundIds.has(id));
    if (missingIds.length) {
      throw ApiError.badRequest("One or more selected members do not exist");
    }

    const chat = await chatDao.create({
      isGroup: true,
      name,
      avatar: avatar || {},
      members: uniqueMembers,
      admins: [userId],
      createdBy: userId,
    });

    try {
      const participants = await chatDao.addParticipants(
        uniqueMembers.map((m) => ({
          chat: chat._id,
          user: m,
          role: m === userId.toString() ? "admin" : "member",
        }))
      );

      if (participants.length !== uniqueMembers.length) {
        throw new Error("Not all group members were added");
      }
    } catch (error) {
      await chatDao.deleteById(chat._id);
      throw ApiError.badRequest("Could not add all selected group members");
    }

    const populated = await chatDao.findByIdPopulated(chat._id);
    return shapeChat(populated, userId);
  },

  async getChat(userId, chatId) {
    const chat = await chatDao.findByIdPopulated(chatId);
    if (!chat) throw ApiError.notFound("Chat not found");
    const isMember = chat.members.some(
      (m) => m._id.toString() === userId.toString()
    );
    if (!isMember) throw ApiError.forbidden("Not a member of this chat");
    return shapeChat(chat, userId);
  },

  async assertMember(userId, chatId) {
    const chat = await chatDao.findById(chatId);
    if (!chat) throw ApiError.notFound("Chat not found");
    const isMember = chat.members.some(
      (m) => m.toString() === userId.toString()
    );
    if (!isMember) throw ApiError.forbidden("Not a member of this chat");
    return chat;
  },

  async updateGroup(userId, chatId, payload) {
    const chat = await chatDao.findById(chatId);
    if (!chat) throw ApiError.notFound("Chat not found");
    if (!chat.isGroup) throw ApiError.badRequest("Not a group chat");
    if (!chat.admins.some((a) => a.toString() === userId.toString())) {
      throw ApiError.forbidden("Only admins can update the group");
    }

    const update = {};
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.avatar !== undefined) update.avatar = payload.avatar;

    await chatDao.updateById(chatId, update);
    const populated = await chatDao.findByIdPopulated(chatId);
    return shapeChat(populated, userId);
  },
};

export { shapeChat };
