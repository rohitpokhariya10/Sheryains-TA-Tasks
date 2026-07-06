import { createSlice } from "@reduxjs/toolkit";

/**
 * Chat UI/realtime state kept in Redux (server data lives in React Query).
 * - activeChatId: currently opened conversation
 * - presence:     userId -> { isOnline, lastSeen }
 * - typing:       chatId -> array of userIds currently typing
 */
const initialState = {
  activeChatId: null,
  presence: {},
  typing: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChat(state, action) {
      state.activeChatId = action.payload;
    },
    setPresence(state, action) {
      const { userId, isOnline, lastSeen } = action.payload;
      state.presence[userId] = { isOnline, lastSeen };
    },
    setTyping(state, action) {
      const { chatId, userId, isTyping } = action.payload;
      const list = state.typing[chatId] || [];
      if (isTyping) {
        if (!list.includes(userId)) state.typing[chatId] = [...list, userId];
      } else {
        state.typing[chatId] = list.filter((id) => id !== userId);
      }
    },
  },
});

export const { setActiveChat, setPresence, setTyping } = chatSlice.actions;

export const selectActiveChatId = (s) => s.chat.activeChatId;
export const selectPresence = (userId) => (s) => s.chat.presence[userId];
export const selectTypingInChat = (chatId) => (s) => s.chat.typing[chatId] || [];

export default chatSlice.reducer;
