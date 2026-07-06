import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Zod schema for environment variables.
 * The process fails fast on startup if any required value is missing/invalid.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(8000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required"),
  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_SECRET: z.string().min(1, "REFRESH_TOKEN_SECRET is required"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),

  COOKIE_DOMAIN: z.string().default("localhost"),

  IMAGEKIT_PUBLIC_KEY: z.string().min(1, "IMAGEKIT_PUBLIC_KEY is required"),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1, "IMAGEKIT_PRIVATE_KEY is required"),
  IMAGEKIT_URL_ENDPOINT: z
    .string()
    .url("IMAGEKIT_URL_ENDPOINT must be a valid url"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:");
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
