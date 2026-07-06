import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/token.utils.js";
import { User } from "../models/user.model.js";

/**
 * Protects routes by validating the Bearer access token.
 * Attaches the authenticated user document to `req.user`.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw ApiError.unauthorized("Access token missing");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw ApiError.unauthorized("User no longer exists");
  }

  req.user = user;
  req.userId = user._id.toString();
  next();
});
