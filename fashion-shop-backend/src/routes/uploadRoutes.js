import express from "express";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js"; // Middleware Upload
import { importProductsFromExcel } from "../controllers/uploadController.js"; // Controller

const router = express.Router();

// Định nghĩa Route: POST /api/upload/import
router.post(
  "/import",
  protect, // 1. Phải đăng nhập
  isAdmin, // 2. Phải là Admin
  upload.single("file"), // 3. Xử lý file upload
  importProductsFromExcel, // 4. Xử lý logic Excel
);

export default router;
