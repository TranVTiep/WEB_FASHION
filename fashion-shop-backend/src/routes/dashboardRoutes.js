// src/routes/dashboardRoutes.js
import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Chỉ Admin mới xem được thống kê
router.get("/", protect, isAdmin, getDashboardStats);

export default router;
