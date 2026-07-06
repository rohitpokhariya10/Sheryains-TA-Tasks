import mongoose from "mongoose";
import { env } from "./env.config.js";
import { logger } from "./logger.config.js";

/**
 * Connect to MongoDB. Exits the process on a fatal connection failure.
 */
export async function connectDB() {
  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error({ err: error }, "❌ MongoDB connection failed");
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    logger.warn("⚠️  MongoDB disconnected");
  });
}
