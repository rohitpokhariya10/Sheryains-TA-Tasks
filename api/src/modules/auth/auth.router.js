import { Router } from "express";
import { authController } from "./auth.controller.js";
import { registerValidator, loginValidator } from "./auth.validator.js";
import { validate, authenticate } from "../../shared/middlewares/index.middleware.js";

const router = Router();

router.post("/register", registerValidator, validate, authController.register);
router.post("/login", loginValidator, validate, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
