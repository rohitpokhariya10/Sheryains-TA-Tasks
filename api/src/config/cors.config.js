import { env } from "./env.config.js";

/**
 * CORS options shared by Express and Socket.IO.
 * Credentials are enabled so the refresh-token cookie can flow.
 */
export const corsOptions = {
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
