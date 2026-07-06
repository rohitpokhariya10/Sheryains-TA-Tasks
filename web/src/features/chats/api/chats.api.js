import { api } from "../../../lib/axios.js";

export const chatsApi = {
  async list() {
    const { data } = await api.get("/chats");
    return data.data.chats;
  },

  async openDirect(userId) {
    const { data } = await api.post("/chats/direct", { userId });
    return data.data.chat;
  },

  async createGroup(payload) {
    const { data } = await api.post("/chats/group", payload);
    return data.data.chat;
  },

  async getOne(chatId) {
    const { data } = await api.get(`/chats/${chatId}`);
    return data.data.chat;
  },

  async updateGroup(chatId, payload) {
    const { data } = await api.patch(`/chats/${chatId}`, payload);
    return data.data.chat;
  },
};
