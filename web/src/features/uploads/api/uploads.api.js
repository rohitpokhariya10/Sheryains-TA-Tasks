import { api } from "../../../lib/axios.js";

export const uploadsApi = {
  /**
   * Fetch ImageKit upload-authentication params from the backend.
   * Returns { token, expire, signature, publicKey, urlEndpoint }.
   */
  async getUploadAuth() {
    const { data } = await api.get("/uploads/auth");
    return data.data;
  },
};
