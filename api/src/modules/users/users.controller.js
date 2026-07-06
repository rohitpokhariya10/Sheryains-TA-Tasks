import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { usersService } from "./users.service.js";

export const usersController = {
  search: asyncHandler(async (req, res) => {
    const users = await usersService.search(req.query.q, req.userId);
    return ApiResponse.ok(res, { users }, "Search results");
  }),

  getById: asyncHandler(async (req, res) => {
    const user = await usersService.getById(req.params.id);
    return ApiResponse.ok(res, { user }, "User");
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await usersService.updateProfile(req.userId, req.body);
    return ApiResponse.ok(res, { user }, "Profile updated");
  }),
};
