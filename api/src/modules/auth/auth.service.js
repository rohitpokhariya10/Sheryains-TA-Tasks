import bcrypt from "bcryptjs";
import { userDao } from "../../shared/dao/user.dao.js";
import { authDao } from "../../shared/dao/auth.dao.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../shared/utils/token.utils.js";

/** Public-safe user shape sent to the client. */
function toPublicUser(user) {
  const u = user.toObject ? user.toObject() : user;
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    username: u.username,
    about: u.about,
    avatar: u.avatar || {},
    isOnline: u.isOnline,
    lastSeen: u.lastSeen,
  };
}

const refreshExpiryMs = 7 * 24 * 60 * 60 * 1000;

/**
 * Creates a session + token pair. The refresh token embeds the session id (sid)
 * so it can be rotated and revoked independently per device.
 */
async function issueTokens(user, { userAgent, ip }) {
  const session = await authDao.createSession({
    user: user._id,
    refreshTokenHash: "pending",
    userAgent,
    ip,
    expiresAt: new Date(Date.now() + refreshExpiryMs),
  });

  const accessToken = signAccessToken({ sub: user._id.toString() });
  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
    sid: session._id.toString(),
  });

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await authDao.updateHash(
    session._id,
    refreshTokenHash,
    new Date(Date.now() + refreshExpiryMs)
  );

  return { accessToken, refreshToken };
}

export const authService = {
  async register(payload, meta) {
    const { name, email, username, password } = payload;

    if (await userDao.findByEmail(email)) {
      throw ApiError.conflict("Email already registered");
    }
    if (await userDao.findByUsername(username)) {
      throw ApiError.conflict("Username already taken");
    }

    const user = await userDao.create({ name, email, username, password });
    const tokens = await issueTokens(user, meta);
    return { user: toPublicUser(user), ...tokens };
  },

  async login({ identifier, password }, meta) {
    const user = await userDao.findByEmailOrUsername(identifier, true);
    if (!user) throw ApiError.unauthorized("Invalid credentials");

    const ok = await user.comparePassword(password);
    if (!ok) throw ApiError.unauthorized("Invalid credentials");

    const tokens = await issueTokens(user, meta);
    return { user: toPublicUser(user), ...tokens };
  },

  /**
   * Rotates the refresh token: verifies it, checks the stored hash for the
   * session, then issues a fresh pair and replaces the stored hash.
   */
  async refresh(oldRefreshToken, meta) {
    if (!oldRefreshToken) throw ApiError.unauthorized("Refresh token missing");

    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const session = await authDao.findByIdAndUser(payload.sid, payload.sub);
    if (!session) throw ApiError.unauthorized("Session not found");

    const matches = await bcrypt.compare(
      oldRefreshToken,
      session.refreshTokenHash
    );
    if (!matches) {
      // Token reuse / theft — nuke every session for safety.
      await authDao.deleteAllForUser(payload.sub);
      throw ApiError.unauthorized("Refresh token reuse detected");
    }

    const user = await userDao.findById(payload.sub);
    if (!user) throw ApiError.unauthorized("User no longer exists");

    const accessToken = signAccessToken({ sub: user._id.toString() });
    const refreshToken = signRefreshToken({
      sub: user._id.toString(),
      sid: session._id.toString(),
    });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await authDao.updateHash(
      session._id,
      refreshTokenHash,
      new Date(Date.now() + refreshExpiryMs)
    );

    void meta;
    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  async logout(refreshToken) {
    if (!refreshToken) return;
    try {
      const payload = verifyRefreshToken(refreshToken);
      await authDao.deleteById(payload.sid);
    } catch {
      // Already invalid — nothing to revoke.
    }
  },

  async me(userId) {
    const user = await userDao.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return toPublicUser(user);
  },

  toPublicUser,
};
