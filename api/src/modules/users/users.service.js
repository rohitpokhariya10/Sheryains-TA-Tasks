import { userDao } from "../../shared/dao/user.dao.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { authService } from "../auth/auth.service.js";

export const usersService = {
  async search(term, currentUserId) {
    if (!term || !term.trim()) return [];
    const users = await userDao.search(term, currentUserId);
    return users.map((u) => ({
      id: u._id,
      name: u.name,
      username: u.username,
      about: u.about,
      avatar: u.avatar || {},
      isOnline: u.isOnline,
      lastSeen: u.lastSeen,
    }));
  },

  async getById(id) {
    const user = await userDao.findById(id);
    if (!user) throw ApiError.notFound("User not found");
    return authService.toPublicUser(user);
  },

  async updateProfile(userId, payload) {
    const update = {};
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.about !== undefined) update.about = payload.about;
    // `avatar` is the structured ImageKit media object saved after a
    // successful direct upload from the client.
    if (payload.avatar !== undefined) update.avatar = payload.avatar;

    const user = await userDao.updateById(userId, update);
    if (!user) throw ApiError.notFound("User not found");
    return authService.toPublicUser(user);
  },
};
