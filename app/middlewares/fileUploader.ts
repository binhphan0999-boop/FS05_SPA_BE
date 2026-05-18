import multer from "multer";

/**
 * Middleware hỗ trợ xử lý multipart/form-data
 * Sử dụng memoryStorage để chuyển tiếp file cho Storage Adapter
 */
export const fileUploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
});
