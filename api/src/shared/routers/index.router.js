import { Router } from "express";
import authRouter from "../../modules/auth/auth.router.js";
import usersRouter from "../../modules/users/users.router.js";
import chatsRouter from "../../modules/chats/chats.router.js";
import messagesRouter from "../../modules/messages/messages.router.js";
import uploadsRouter from "../../modules/uploads/uploads.router.js";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({ success: true, message: "OK", data: { uptime: process.uptime() } })
);

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/chats", chatsRouter);
router.use("/messages", messagesRouter);
router.use("/uploads", uploadsRouter);

export default router;
