import { Router } from "express";
import { chatsController } from "./chats.controller.js";
import {
  openDirectValidator,
  createGroupValidator,
  updateGroupValidator,
} from "./chats.validator.js";
import {
  validate,
  authenticate,
} from "../../shared/middlewares/index.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", chatsController.list);
router.post("/direct", openDirectValidator, validate, chatsController.openDirect);
router.post("/group", createGroupValidator, validate, chatsController.createGroup);
router.get("/:id", chatsController.getOne);
router.patch("/:id", updateGroupValidator, validate, chatsController.updateGroup);

export default router;
