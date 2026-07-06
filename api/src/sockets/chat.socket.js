import { messagesService } from "../modules/messages/messages.service.js";
import { logger } from "../config/logger.config.js";

/**
 * Realtime message sending — the PRIMARY send path.
 *
 * Flow:
 *  1. client emits "message:send" with { chatId, messageType, content, media }
 *  2. server persists the message + per-recipient receipts
 *  3. server broadcasts "message:new" to the chat room
 *  4. any online recipient auto-acks delivery (see receipt.socket.js), which
 *     flips the sender's single tick -> double tick
 */
export function registerChatHandlers(io, socket) {
  const userId = socket.userId;

  socket.on("chat:join", ({ chatId }) => {
    if (chatId) socket.join(`chat:${chatId}`);
  });

  socket.on("message:send", async (payload, cb) => {
    try {
      const { chatId, messageType, content, media, tempId } = payload || {};
      const { message, recipients } = await messagesService.createMessage({
        chatId,
        senderId: userId,
        messageType,
        content,
        media,
      });

      // Ack to the sender (lets the client reconcile its optimistic message).
      if (typeof cb === "function") {
        cb({ success: true, message, tempId });
      }

      // Broadcast to everyone in the chat room, including the sender's other
      // devices. `tempId` lets the sender de-dupe its optimistic entry.
      io.to(`chat:${chatId}`).emit("message:new", { message, tempId });

      // Notify recipients not currently in the room (for chat-list badges).
      recipients.forEach((r) =>
        io.to(`user:${r}`).emit("chat:activity", {
          chatId,
          lastMessage: message,
        })
      );
    } catch (error) {
      logger.error({ err: error }, "message:send failed");
      if (typeof cb === "function") {
        cb({ success: false, error: error.message });
      }
    }
  });
}
