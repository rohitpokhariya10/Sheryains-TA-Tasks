import { Session } from "../models/session.model.js";

/**
 * Data access for refresh-token sessions.
 */
export const authDao = {
  createSession(data) {
    return Session.create(data);
  },

  findById(id) {
    return Session.findById(id);
  },

  findByIdAndUser(id, userId) {
    return Session.findOne({ _id: id, user: userId });
  },

  updateHash(id, refreshTokenHash, expiresAt) {
    return Session.findByIdAndUpdate(
      id,
      { refreshTokenHash, expiresAt },
      { new: true }
    );
  },

  deleteById(id) {
    return Session.findByIdAndDelete(id);
  },

  deleteAllForUser(userId) {
    return Session.deleteMany({ user: userId });
  },
};
