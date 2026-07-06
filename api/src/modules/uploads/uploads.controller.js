import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { uploadsService } from "./uploads.service.js";

export const uploadsController = {
  getAuth: asyncHandler(async (_req, res) => {
    const auth = uploadsService.getUploadAuth();
    return ApiResponse.ok(res, auth, "ImageKit upload auth generated");
  }),
};
