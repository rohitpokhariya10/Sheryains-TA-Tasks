import { env, isProd } from "../../config/env.config.js";

export const REFRESH_COOKIE_NAME = "refreshToken";

/**
 * Cookie options for the refresh token.
 * httpOnly so JS can't read it; sameSite/secure tuned per environment.
 */
export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  domain: env.COOKIE_DOMAIN,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...refreshCookieOptions,
    maxAge: undefined,
  });
}
