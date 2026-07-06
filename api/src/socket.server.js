import { Server } from "socket.io";
import { corsOptions } from "./config/cors.config.js";
import { initSocket } from "./sockets/index.socket.js";

/**
 * Attaches a Socket.IO server to the given HTTP server and returns the io
 * instance (also stored on the Express app as `io` for use in controllers).
 */
export function createSocketServer(httpServer, app) {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });

  app.set("io", io);
  initSocket(io);

  return io;
}
