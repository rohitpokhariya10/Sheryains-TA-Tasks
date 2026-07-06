import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { messagesService } from "./messages.service.js";

export const messagesController = {
  list: asyncHandler(async (req, res) => {
    const result = await messagesService.listMessages(
      req.userId,
      req.params.chatId,
      req.query
    );
    return ApiResponse.ok(res, result, "Messages");
  }),

  /**
   * REST fallback for sending a message (the primary path is the socket).
   * Emits the same realtime events via the io instance attached to the app.
   */
  send: asyncHandler(async (req, res) => {
    const { messageType, content, media } = req.body;
    const { message } = await messagesService.createMessage({
      chatId: req.params.chatId,
      senderId: req.userId,
      messageType,
      content,
      media,
    });

    const io = req.app.get("io");
    if (io) io.to(`chat:${req.params.chatId}`).emit("message:new", { message });

    return ApiResponse.created(res, { message }, "Message sent");
  }),

  markRead: asyncHandler(async (req, res) => {
    const updates = await messagesService.markRead(
      req.params.chatId,
      req.userId
    );
    const io = req.app.get("io");
    if (io) {
      updates.forEach((u) =>
        io.to(`chat:${req.params.chatId}`).emit("message:status", {
          chatId: req.params.chatId,
          messageId: u.messageId,
          status: u.status,
        })
      );
    }
    return ApiResponse.ok(res, { updates }, "Marked as read");
  }),
};
