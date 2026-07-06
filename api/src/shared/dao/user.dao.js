import { User } from "../models/user.model.js";

/**
 * Data access for users. Keeps Mongoose queries out of services.
 */
export const userDao = {
  create(data) {
    return User.create(data);
  },

  findById(id) {
    return User.findById(id);
  },

  findManyByIds(ids) {
    return User.find({ _id: { $in: ids } }).select("_id").lean();
  },

  findByEmail(email, withPassword = false) {
    const q = User.findOne({ email: email.toLowerCase() });
    return withPassword ? q.select("+password") : q;
  },

  findByUsername(username) {
    return User.findOne({ username: username.toLowerCase() });
  },

  findByEmailOrUsername(identifier, withPassword = false) {
    const value = identifier.toLowerCase();
    const q = User.findOne({ $or: [{ email: value }, { username: value }] });
    return withPassword ? q.select("+password") : q;
  },

  /** Search by name/username, excluding the requesting user. */
  search(term, excludeUserId, limit = 20) {
    const regex = new RegExp(term.trim(), "i");
    return User.find({
      _id: { $ne: excludeUserId },
      $or: [{ name: regex }, { username: regex }],
    })
      .limit(limit)
      .lean();
  },

  updateById(id, update) {
    return User.findByIdAndUpdate(id, update, { new: true });
  },

  setPresence(id, isOnline) {
    return User.findByIdAndUpdate(
      id,
      { isOnline, lastSeen: new Date() },
      { new: true }
    );
  },
};
