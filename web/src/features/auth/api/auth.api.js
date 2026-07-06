import { api } from "../../../lib/axios.js";

export const authApi = {
  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data.data; // { user, accessToken }
  },

  async login(payload) {
    const { data } = await api.post("/auth/login", payload);
    return data.data; // { user, accessToken }
  },

  async logout() {
    const { data } = await api.post("/auth/logout");
    return data.data;
  },

  async me() {
    const { data } = await api.get("/auth/me");
    return data.data.user;
  },
};
