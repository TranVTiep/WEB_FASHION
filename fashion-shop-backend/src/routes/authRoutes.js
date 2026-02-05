import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// test route bảo vệ
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

export default router;
