import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
  },
});

/** Centralized query keys so cache updates stay consistent across features. */
export const queryKeys = {
  chats: ["chats"],
  messages: (chatId) => ["messages", chatId],
  userSearch: (term) => ["userSearch", term],
};
