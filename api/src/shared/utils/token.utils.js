import jwt from "jsonwebtoken";
import { env } from "../../config/env.config.js";

/**
 * JWT helpers for the access/refresh token pair.
 * - access token  -> short lived, returned in the response body (Redux state)
 * - refresh token -> long lived, stored in an httpOnly cookie
 */

export function signAccessToken(payload) {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
}
