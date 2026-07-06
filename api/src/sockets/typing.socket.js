/**
 * Typing indicators. Relayed to the other members of a chat room only;
 * nothing is persisted.
 */
export function registerTypingHandlers(io, socket) {
  const userId = socket.userId;

  socket.on("typing:start", ({ chatId }) => {
    if (!chatId) return;
    socket.to(`chat:${chatId}`).emit("typing:start", { chatId, userId });
  });

  socket.on("typing:stop", ({ chatId }) => {
    if (!chatId) return;
    socket.to(`chat:${chatId}`).emit("typing:stop", { chatId, userId });
  });
}
