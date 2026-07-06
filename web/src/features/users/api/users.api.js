import { api } from "../../../lib/axios.js";

export const usersApi = {
  async search(term) {
    const { data } = await api.get("/users/search", { params: { q: term } });
    return data.data.users;
  },

  async getById(id) {
    const { data } = await api.get(`/users/${id}`);
    return data.data.user;
  },

  /** Update the logged-in user's profile (name, about, avatar media object). */
  async updateProfile(payload) {
    const { data } = await api.patch("/users/me", payload);
    return data.data.user;
  },
};
