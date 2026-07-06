import { verifyAccessToken } from "../shared/utils/token.utils.js";
import { userDao } from "../shared/dao/user.dao.js";
import { chatDao } from "../shared/dao/chat.dao.js";
import { logger } from "../config/logger.config.js";
import { registerPresenceHandlers } from "./presence.socket.js";
import { registerTypingHandlers } from "./typing.socket.js";
import { registerChatHandlers } from "./chat.socket.js";
import { registerReceiptHandlers } from "./receipt.socket.js";

/**
 * Socket.IO authentication middleware.
 * Expects the access token via `auth.token` (preferred) or the Authorization
 * header, mirroring the REST access-token flow.
 */
async function socketAuth(socket, next) {
  try {
    const raw =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");
    if (!raw) return next(new Error("Access token missing"));

    const payload = verifyAccessToken(raw);
    const user = await userDao.findById(payload.sub);
    if (!user) return next(new Error("User not found"));

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
}

/**
 * Wires the whole Socket.IO server: auth, per-connection room joins, and the
 * feature handler groups.
 */
export function initSocket(io) {
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    logger.debug(`🔌 socket connected: ${userId} (${socket.id})`);

    // Personal room (for user-targeted events) + a room per chat.
    socket.join(`user:${userId}`);
    const chats = await chatDao.listForUser(userId);
    chats.forEach((c) => socket.join(`chat:${c._id}`));

    registerPresenceHandlers(io, socket);
    registerTypingHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerReceiptHandlers(io, socket);

    socket.on("disconnect", () => {
      logger.debug(`❌ socket disconnected: ${userId} (${socket.id})`);
    });
  });
}
