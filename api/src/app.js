import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import pinoHttp from "pino-http";

import { corsOptions } from "./config/cors.config.js";
import { logger } from "./config/logger.config.js";
import { isProd } from "./config/env.config.js";
import apiRouter from "./shared/routers/index.router.js";
import {
  notFound,
  errorHandler,
} from "./shared/middlewares/index.middleware.js";

/**
 * Builds and configures the Express application (no server binding here so it
 * can be reused by the HTTP + Socket.IO bootstrap).
 */
export function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // HTTP request logging: Pino structured logs + Morgan dev output.
  app.use(pinoHttp({ logger }));
  if (!isProd) app.use(morgan("dev"));

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
