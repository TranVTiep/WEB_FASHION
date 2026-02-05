import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem, // 👈 1. Đã thêm import này
} from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js"; // (Lưu ý: kiểm tra xem folder của bạn tên là 'middleware' hay 'middlewares' nhé)

const router = express.Router();

// Lấy giỏ hàng
router.get("/", protect, getCart);

// Thêm vào giỏ
router.post("/", protect, addToCart);

// 👇 2. CẬP NHẬT SỐ LƯỢNG (Dòng này quan trọng nhất)
router.put("/", protect, updateCartItem);

// Xóa khỏi giỏ (Đổi thành :id cho ngắn gọn và khớp Controller)
router.delete("/:id", protect, removeFromCart);

export default router;
