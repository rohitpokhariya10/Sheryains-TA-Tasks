import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { chatsService } from "./chats.service.js";

export const chatsController = {
  list: asyncHandler(async (req, res) => {
    const chats = await chatsService.listMyChats(req.userId);
    return ApiResponse.ok(res, { chats }, "Your chats");
  }),

  openDirect: asyncHandler(async (req, res) => {
    const chat = await chatsService.openDirectChat(
      req.userId,
      req.body.userId
    );
    return ApiResponse.ok(res, { chat }, "Direct chat");
  }),

  createGroup: asyncHandler(async (req, res) => {
    const chat = await chatsService.createGroup(req.userId, req.body);
    return ApiResponse.created(res, { chat }, "Group created");
  }),

  getOne: asyncHandler(async (req, res) => {
    const chat = await chatsService.getChat(req.userId, req.params.id);
    return ApiResponse.ok(res, { chat }, "Chat");
  }),

  updateGroup: asyncHandler(async (req, res) => {
    const chat = await chatsService.updateGroup(
      req.userId,
      req.params.id,
      req.body
    );
    return ApiResponse.ok(res, { chat }, "Group updated");
  }),
};
