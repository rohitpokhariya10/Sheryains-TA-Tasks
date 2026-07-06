import { body, query } from "express-validator";

export const searchValidator = [
  query("q").trim().notEmpty().withMessage("Search term is required"),
];

export const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Name must be 1-50 characters"),
  body("about")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("About must be at most 200 characters"),
  body("avatar").optional().isObject().withMessage("Avatar must be an object"),
  body("avatar.url").optional().isString(),
  body("avatar.fileId").optional().isString(),
];
