import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { messagesApi } from "../api/messages.api.js";

/**
 * Infinite history for a chat. Page 0 is the newest 25 messages; each further
 * page fetches OLDER messages using the `before` cursor. Rendered chronological.
 */
export function useMessages(chatId) {
  const query = useInfiniteQuery({
    queryKey: ["messages", chatId],
    enabled: Boolean(chatId),
    queryFn: ({ pageParam }) =>
      messagesApi.list(chatId, { before: pageParam, limit: 25 }),
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.oldestId : undefined,
  });

  // pages: [newest, older, ...] -> flatten oldest-first for display.
  const messages =
    query.data?.pages
      ?.slice()
      .reverse()
      .flatMap((p) => p.messages) || [];

  return { ...query, messages };
}

/**
 * Cache mutators used by the socket layer to keep the message list live
 * without refetching.
 */
export function useMessageCache() {
  const queryClient = useQueryClient();

  /** Append a newly received/sent message to page 0. */
  const appendMessage = useCallback(
    (chatId, message, tempId) => {
      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old) {
          return {
            pages: [{ messages: [message], hasMore: false, oldestId: null }],
            pageParams: [null],
          };
        }
        const pages = old.pages.map((p) => ({ ...p }));
        const first = { ...pages[0], messages: [...pages[0].messages] };

        // Replace an optimistic temp entry, or de-dupe by id.
        const tempIdx = tempId
          ? first.messages.findIndex((m) => m._id === tempId)
          : -1;
        const dupIdx = first.messages.findIndex((m) => m._id === message._id);

        if (tempIdx !== -1) first.messages[tempIdx] = message;
        else if (dupIdx === -1) first.messages.push(message);

        pages[0] = first;
        return { ...old, pages };
      });
    },
    [queryClient]
  );

  /** Update the delivery status (tick) of a message in cache. */
  const updateStatus = useCallback(
    (chatId, messageId, status) => {
      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old) return old;
        const pages = old.pages.map((p) => ({
          ...p,
          messages: p.messages.map((m) =>
            m._id === messageId ? { ...m, status } : m
          ),
        }));
        return { ...old, pages };
      });
    },
    [queryClient]
  );

  return { appendMessage, updateStatus };
}
