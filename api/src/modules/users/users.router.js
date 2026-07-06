import { Router } from "express";
import { usersController } from "./users.controller.js";
import { searchValidator, updateProfileValidator } from "./users.validator.js";
import {
  validate,
  authenticate,
} from "../../shared/middlewares/index.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/search", searchValidator, validate, usersController.search);
router.patch(
  "/me",
  updateProfileValidator,
  validate,
  usersController.updateProfile
);
router.get("/:id", usersController.getById);

export default router;
