import { imagekit } from "../../config/imagekit.config.js";
import { env } from "../../config/env.config.js";

/**
 * Generates the ImageKit upload-authentication parameters the frontend needs
 * to upload a file DIRECTLY to ImageKit.
 *
 * The private key is used here (server side) to sign the request and never
 * leaves the backend. The client receives only a short-lived token/signature
 * plus the public key and url endpoint.
 */
export const uploadsService = {
  getUploadAuth() {
    // { token, expire, signature } — signed with the private key.
    const authParams = imagekit.getAuthenticationParameters();

    return {
      token: authParams.token,
      expire: authParams.expire,
      signature: authParams.signature,
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    };
  },
};
