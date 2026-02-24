import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Thêm kiểm tra status để chặn user bị blocked
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401);
        throw new Error("User không tồn tại");
      }

      if (user.status === "blocked") {
        res.status(401);
        throw new Error("Tài khoản của bạn đã bị khóa");
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Token không hợp lệ hoặc hết hạn");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Chưa cung cấp Token");
  }
});

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Yêu cầu quyền Admin");
  }
};

export { protect, isAdmin };
