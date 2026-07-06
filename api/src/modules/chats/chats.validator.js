import { body } from "express-validator";

export const openDirectValidator = [
  body("userId").isMongoId().withMessage("Valid userId is required"),
];

export const createGroupValidator = [
  body("name").trim().notEmpty().withMessage("Group name is required"),
  body("memberIds")
    .isArray({ min: 1 })
    .withMessage("At least one member is required"),
  body("memberIds.*").isMongoId().withMessage("Invalid member id"),
  body("avatar").optional().isObject(),
];

export const updateGroupValidator = [
  body("name").optional().trim().isLength({ min: 1, max: 50 }),
  body("avatar").optional().isObject(),
];
