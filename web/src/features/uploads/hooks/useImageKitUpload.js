import { useState, useCallback } from "react";
import { uploadsApi } from "../api/uploads.api.js";

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

/**
 * Reusable hook for direct-to-ImageKit uploads.
 *
 * Flow:
 *   1. request signed upload auth from our backend (GET /api/uploads/auth)
 *   2. POST the file straight to ImageKit with those params (private key is
 *      never involved on the client)
 *   3. normalize and return the media metadata used across the app
 *
 * Reused by: profile picture, group avatar, and chat image uploads.
 */
export function useImageKitUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = useCallback(async (file, { folder = "/chotuapp" } = {}) => {
    if (!file) throw new Error("No file provided");
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1) Signed auth params from our server.
      const auth = await uploadsApi.getUploadAuth();

      // 2) Direct upload to ImageKit.
      const form = new FormData();
      form.append("file", file);
      form.append("fileName", file.name || `upload-${Date.now()}`);
      form.append("publicKey", auth.publicKey);
      form.append("signature", auth.signature);
      form.append("expire", auth.expire);
      form.append("token", auth.token);
      form.append("folder", folder);
      form.append("useUniqueFileName", "true");

      const result = await uploadWithProgress(form, setProgress);

      // 3) Normalize to the shared media object shape.
      return {
        fileId: result.fileId,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl || result.url,
        name: result.name,
        size: result.size,
        mimeType: file.type || result.fileType,
      };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, isUploading, progress, error };
}

/** XHR upload so we can surface real progress events. */
function uploadWithProgress(form, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", IMAGEKIT_UPLOAD_URL);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(json);
        else reject(new Error(json?.message || "ImageKit upload failed"));
      } catch {
        reject(new Error("Invalid ImageKit response"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}
