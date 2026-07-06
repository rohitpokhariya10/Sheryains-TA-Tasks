import { Router } from "express";
import { messagesController } from "./messages.controller.js";
import {
  listMessagesValidator,
  sendMessageValidator,
} from "./messages.validator.js";
import {
  validate,
  authenticate,
} from "../../shared/middlewares/index.middleware.js";

const router = Router();

router.use(authenticate);

router.get(
  "/:chatId",
  listMessagesValidator,
  validate,
  messagesController.list
);
router.post(
  "/:chatId",
  sendMessageValidator,
  validate,
  messagesController.send
);
router.post("/:chatId/read", messagesController.markRead);

export default router;
