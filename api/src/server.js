import http from "http";
import { createApp } from "./app.js";
import { createSocketServer } from "./socket.server.js";
import { connectDB } from "./config/db.config.js";
import { env } from "./config/env.config.js";
import { logger } from "./config/logger.config.js";

async function bootstrap() {
  await connectDB();

  const app = createApp();
  const httpServer = http.createServer(app);
  createSocketServer(httpServer, app);

  httpServer.listen(env.PORT, () => {
    logger.info(`🚀 Server listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down...`);
    httpServer.close(() => process.exit(0));
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Fatal bootstrap error");
  process.exit(1);
});
