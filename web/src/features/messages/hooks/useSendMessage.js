import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getSocket } from "../../../lib/socket.js";
import { selectCurrentUser } from "../../auth/state/authSlice.js";
import { useMessageCache } from "./useMessages.js";

let tempCounter = 0;

/**
 * Sends a message over the socket (primary path) with an optimistic entry
 * that shows a single tick until the server acks. The server broadcast
 * (message:new with tempId) reconciles the optimistic message.
 */
export function useSendMessage(chatId) {
  const user = useSelector(selectCurrentUser);
  const { appendMessage } = useMessageCache();
  const queryClient = useQueryClient();

  return useCallback(
    ({ content = "", media = null, messageType = "text" }) => {
      const socket = getSocket();
      const tempId = `temp-${Date.now()}-${tempCounter++}`;

      const optimistic = {
        _id: tempId,
        chat: chatId,
        sender: {
          _id: user?.id,
          name: user?.name,
          username: user?.username,
          avatar: user?.avatar,
        },
        messageType,
        content,
        media,
        status: "sent",
        pending: true,
        createdAt: new Date().toISOString(),
      };

      appendMessage(chatId, optimistic);

      if (!socket) return;

      socket.emit(
        "message:send",
        { chatId, content, media, messageType, tempId },
        (ack) => {
          if (ack?.success && ack.message) {
            appendMessage(chatId, ack.message, tempId);
            queryClient.invalidateQueries({ queryKey: ["chats"] });
          }
        }
      );
    },
    [chatId, user, appendMessage, queryClient]
  );
}
