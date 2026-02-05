import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder, // 👈 1. Import thêm hàm này
} from "../controllers/orderController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tạo đơn hàng
router.post("/", protect, createOrder);

// Lấy danh sách đơn hàng của tôi
// (Lưu ý: Nếu Frontend bạn gọi api.get("/orders") thì API này nên đổi thành router.get("/", ...)
// nhưng cẩn thận trùng với Admin bên dưới. Tốt nhất Frontend nên gọi api.get("/orders/my-orders"))
router.get("/my-orders", protect, getMyOrders);

// 👇 2. Route Hủy đơn hàng (User) - Thêm dòng này
router.put("/:id/cancel", protect, cancelOrder);

// --- ADMIN ROUTES ---
// Lấy tất cả đơn hàng (Admin)
router.get("/", protect, isAdmin, getAllOrders);

// Cập nhật trạng thái đơn hàng (Admin)
router.put("/:id", protect, isAdmin, updateOrderStatus);

export default router;
