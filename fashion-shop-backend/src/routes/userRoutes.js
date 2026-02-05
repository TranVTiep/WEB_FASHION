// File: src/routes/userRoutes.js
import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js"; // Đảm bảo bạn có file này

const router = express.Router();

// Gom 2 lệnh GET và PUT vào chung 1 đường dẫn cho gọn
router
  .route("/profile")
  .get(protect, getUserProfile) // Xem hồ sơ
  .put(protect, updateUserProfile); // Cập nhật hồ sơ

export default router;
