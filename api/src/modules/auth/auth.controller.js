import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { authService } from "./auth.service.js";
import {
  setRefreshCookie,
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
} from "../../shared/utils/cookie.utils.js";

function reqMeta(req) {
  return { userAgent: req.headers["user-agent"], ip: req.ip };
}

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.register(
      req.body,
      reqMeta(req)
    );
    setRefreshCookie(res, refreshToken);
    return ApiResponse.created(res, { user, accessToken }, "Registered");
  }),

  login: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(
      req.body,
      reqMeta(req)
    );
    setRefreshCookie(res, refreshToken);
    return ApiResponse.ok(res, { user, accessToken }, "Logged in");
  }),

  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    const { user, accessToken, refreshToken } = await authService.refresh(
      token,
      reqMeta(req)
    );
    setRefreshCookie(res, refreshToken);
    return ApiResponse.ok(res, { user, accessToken }, "Token refreshed");
  }),

  logout: asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(token);
    clearRefreshCookie(res);
    return ApiResponse.ok(res, null, "Logged out");
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.me(req.userId);
    return ApiResponse.ok(res, { user }, "Current user");
  }),
};
