import { userDao } from "../shared/dao/user.dao.js";

/**
 * Online/offline presence. A user is marked online on connect and offline on
 * disconnect; the change is broadcast so contacts can update "last seen".
 */
export function registerPresenceHandlers(io, socket) {
  const userId = socket.userId;

  const goOnline = async () => {
    await userDao.setPresence(userId, true);
    io.emit("presence:update", { userId, isOnline: true });
  };

  const goOffline = async () => {
    const user = await userDao.setPresence(userId, false);
    io.emit("presence:update", {
      userId,
      isOnline: false,
      lastSeen: user?.lastSeen,
    });
  };

  goOnline();

  // Allow clients to explicitly query a user's presence.
  socket.on("presence:get", async (targetId, cb) => {
    const user = await userDao.findById(targetId);
    if (typeof cb === "function") {
      cb({
        userId: targetId,
        isOnline: user?.isOnline || false,
        lastSeen: user?.lastSeen,
      });
    }
  });

  socket.on("disconnect", goOffline);
}
