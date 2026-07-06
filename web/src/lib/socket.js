import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL || "";

let socket = null;

/**
 * Lazily creates (and authenticates) the Socket.IO connection.
 * The access token is passed via `auth.token`, matching the server middleware.
 */
export function connectSocket(accessToken) {
  if (socket?.connected) return socket;

  socket = io(URL || "/", {
    autoConnect: true,
    withCredentials: true,
    auth: { token: accessToken },
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
