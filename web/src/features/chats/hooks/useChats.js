import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { chatsApi } from "../api/chats.api.js";
import { setActiveChat } from "../state/chatSlice.js";

export function useChats() {
  return useQuery({
    queryKey: ["chats"],
    queryFn: chatsApi.list,
  });
}

export function useChat(chatId) {
  return useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => chatsApi.getOne(chatId),
    enabled: Boolean(chatId),
  });
}

/** Open (or create) a 1-to-1 chat and select it. */
export function useOpenDirectChat() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: chatsApi.openDirect,
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      dispatch(setActiveChat(chat.id));
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: chatsApi.createGroup,
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      dispatch(setActiveChat(chat.id));
    },
  });
}

export function useUpdateGroup(chatId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => chatsApi.updateGroup(chatId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
    },
  });
}
