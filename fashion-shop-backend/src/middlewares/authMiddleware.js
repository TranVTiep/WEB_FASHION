import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      return next(); // ✅ rất quan trọng
    } catch (error) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
  }

  // ❗ nếu không có token
  return res.status(401).json({ message: "Chưa đăng nhập" });
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Không có quyền admin" });
};
