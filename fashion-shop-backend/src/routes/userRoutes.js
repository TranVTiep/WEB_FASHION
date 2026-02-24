import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js"; // Sửa từ authController thành userController
import { forgotPassword } from "../controllers/authController.js"; // Giữ lại hàm này từ authController
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/forgot-password", forgotPassword);

export default router;
