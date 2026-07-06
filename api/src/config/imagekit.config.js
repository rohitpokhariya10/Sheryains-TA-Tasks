import ImageKit from "imagekit";
import { env } from "./env.config.js";

/**
 * Configured ImageKit instance.
 * The private key lives ONLY here (server side) and is never sent to the client.
 * Used to generate secure upload-authentication parameters.
 */
export const imagekit = new ImageKit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});
