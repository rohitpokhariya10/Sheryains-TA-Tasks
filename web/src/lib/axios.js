import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "";

/**
 * Axios instance for the API.
 * - `withCredentials` so the httpOnly refresh cookie is sent.
 * - a request interceptor injects the in-memory access token.
 * - a response interceptor transparently refreshes on 401 then retries once.
 */
export const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
});

// The access token lives in memory (mirrored into Redux). We keep a module
// reference so interceptors can read it without importing the store (avoids
// a circular dependency).
let accessToken = null;
let onAuthChange = null; // (token|null) => void, wired from the store setup
let onLogout = null; // () => void

export function setAccessToken(token) {
  accessToken = token;
}

export function registerAuthHandlers({ onToken, onLogoutHandler }) {
  onAuthChange = onToken;
  onLogout = onLogoutHandler;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Single-flight refresh so concurrent 401s don't trigger many refresh calls.
let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/api/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const token = res.data?.data?.accessToken;
        accessToken = token;
        onAuthChange?.(token, res.data?.data?.user);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Don't try to refresh the refresh call itself.
    const isAuthRoute = original?.url?.includes("/auth/");

    if (status === 401 && !original?._retry && !isAuthRoute) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch {
        onLogout?.();
      }
      onLogout?.();
    }

    return Promise.reject(error);
  }
);
