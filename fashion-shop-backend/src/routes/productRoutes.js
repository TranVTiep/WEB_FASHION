import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductReview, // 👈 1. Nhớ import hàm này từ Controller
} from "../controllers/productController.js";

import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// --- PUBLIC ROUTES (Ai cũng xem được) ---
router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/:id/reviews", protect, createProductReview);

// --- ADMIN ROUTES (Chỉ Admin mới dùng được) ---
router.post("/", protect, isAdmin, createProduct);
router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;
