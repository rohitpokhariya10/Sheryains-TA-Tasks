import { Router } from "express";
import { uploadsController } from "./uploads.controller.js";
import { authenticate } from "../../shared/middlewares/index.middleware.js";

const router = Router();

// Protected: only logged-in users can request upload credentials.
router.get("/auth", authenticate, uploadsController.getAuth);

export default router;
