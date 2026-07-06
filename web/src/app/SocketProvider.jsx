import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket } from "../lib/socket.js";
import { selectAccessToken } from "../features/auth/state/authSlice.js";
import { setPresence, setTyping } from "../features/chats/state/chatSlice.js";
import { useMessageCache } from "../features/messages/hooks/useMessages.js";

/**
 * Establishes the authenticated socket connection and translates realtime
 * events into React Query cache updates + Redux UI state. Mounted once inside
 * the authenticated area of the app.
 */
export function SocketProvider({ children }) {
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { appendMessage, updateStatus } = useMessageCache();

  useEffect(() => {
    if (!accessToken) return;

    const socket = connectSocket(accessToken);

    // New message arrives in a chat.
    socket.on("message:new", ({ message, tempId }) => {
      const chatId = message.chat;
      appendMessage(chatId, message, tempId);
      queryClient.invalidateQueries({ queryKey: ["chats"] });

      // Auto-ack delivery to the sender (drives the double grey tick).
      socket.emit("message:delivered", { chatId });
    });

    // Tick status change (sent -> delivered -> read).
    socket.on("message:status", ({ chatId, messageId, status }) => {
      updateStatus(chatId, messageId, status);
    });

    // Presence + typing.
    socket.on("presence:update", (payload) => dispatch(setPresence(payload)));
    socket.on("typing:start", ({ chatId, userId }) =>
      dispatch(setTyping({ chatId, userId, isTyping: true }))
    );
    socket.on("typing:stop", ({ chatId, userId }) =>
      dispatch(setTyping({ chatId, userId, isTyping: false }))
    );

    // Chat list activity (for reordering/badges).
    socket.on("chat:activity", () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    });

    return () => {
      socket.off("message:new");
      socket.off("message:status");
      socket.off("presence:update");
      socket.off("typing:start");
      socket.off("typing:stop");
      socket.off("chat:activity");
    };
  }, [accessToken, appendMessage, updateStatus, dispatch, queryClient]);

  useEffect(() => {
    return () => disconnectSocket();
  }, []);

  return children;
}
