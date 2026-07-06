import { ApiError } from "../utils/ApiError.js";
import { logger } from "../../config/logger.config.js";
import { isProd } from "../../config/env.config.js";

/** 404 handler for unknown routes. */
export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/** Central error formatter. Always returns the standard error envelope. */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let error = err;

  // Normalize common non-ApiError cases.
  if (!(error instanceof ApiError)) {
    if (error?.name === "ValidationError") {
      error = ApiError.badRequest("Validation failed");
    } else if (error?.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || "field";
      error = ApiError.conflict(`${field} already exists`);
    } else if (error?.name === "CastError") {
      error = ApiError.badRequest("Invalid identifier");
    } else {
      error = new ApiError(error.statusCode || 500, error.message);
    }
  }

  if (error.statusCode >= 500) {
    logger.error({ err }, "Unhandled error");
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(isProd ? {} : { stack: err.stack }),
  });
};
