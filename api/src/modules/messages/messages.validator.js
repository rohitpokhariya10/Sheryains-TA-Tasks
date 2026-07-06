import { body, param, query } from "express-validator";

export const listMessagesValidator = [
  param("chatId").isMongoId().withMessage("Valid chatId is required"),
  query("before").optional().isMongoId().withMessage("Invalid cursor"),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

export const sendMessageValidator = [
  param("chatId").isMongoId().withMessage("Valid chatId is required"),
  body("messageType")
    .optional()
    .isIn(["text", "image"])
    .withMessage("messageType must be text or image"),
  body("content").optional().isString(),
  body("media").optional().isObject(),
  body("media.url").optional().isString(),
];
