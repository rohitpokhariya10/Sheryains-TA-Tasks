import { messagesService } from "../modules/messages/messages.service.js";
import { logger } from "../config/logger.config.js";

/**
 * Delivery + read receipts, which drive the tick states:
 *   sent      -> single grey tick
 *   delivered -> double grey tick
 *   read      -> double blue tick
 *
 * "delivered" is acked by the recipient's client when a message arrives while
 * they are online. "read" is acked when the recipient opens the chat.
 */
export function registerReceiptHandlers(io, socket) {
  const userId = socket.userId;

  const broadcastStatus = (chatId, updates) => {
    updates.forEach((u) =>
      io.to(`chat:${chatId}`).emit("message:status", {
        chatId,
        messageId: u.messageId,
        status: u.status,
      })
    );
  };

  // Recipient confirms messages in a chat were delivered to their device.
  socket.on("message:delivered", async ({ chatId }) => {
    try {
      if (!chatId) return;
      const updates = await messagesService.markDelivered(chatId, userId);
      broadcastStatus(chatId, updates);
    } catch (error) {
      logger.error({ err: error }, "message:delivered failed");
    }
  });

  // Recipient opened the chat — mark everything read (blue tick).
  socket.on("message:read", async ({ chatId }) => {
    try {
      if (!chatId) return;
      const updates = await messagesService.markRead(chatId, userId);
      broadcastStatus(chatId, updates);
      // Tell others who read it (for group read state / "seen by").
      socket.to(`chat:${chatId}`).emit("message:seen", { chatId, userId });
    } catch (error) {
      logger.error({ err: error }, "message:read failed");
    }
  });
}
