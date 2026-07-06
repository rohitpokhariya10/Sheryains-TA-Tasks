import { api } from "../../../lib/axios.js";

export const messagesApi = {
  /** Fetch a page of messages; `before` is a message id for older-history paging. */
  async list(chatId, { before = null, limit = 25 } = {}) {
    const { data } = await api.get(`/messages/${chatId}`, {
      params: { before, limit },
    });
    return data.data; // { messages, hasMore, oldestId }
  },

  /** REST fallback send (primary path is the socket). */
  async send(chatId, payload) {
    const { data } = await api.post(`/messages/${chatId}`, payload);
    return data.data.message;
  },

  async markRead(chatId) {
    const { data } = await api.post(`/messages/${chatId}/read`);
    return data.data;
  },
};
