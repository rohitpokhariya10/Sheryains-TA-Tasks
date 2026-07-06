import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

/**
 * Collects express-validator results and throws a 400 with a clean list.
 * Place after a validator chain on a route.
 */
export const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  throw ApiError.badRequest("Validation failed", errors);
};
