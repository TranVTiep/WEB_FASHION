import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// Middleware xác thực người dùng (Đăng nhập chưa?)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Kiểm tra xem header có chứa Bearer Token không
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Lấy token từ header ("Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // 2. Giải mã token để lấy ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Tìm user trong DB (Loại bỏ trường password)
      // QUAN TRỌNG: Phải dùng await ở đây
      const user = await User.findById(decoded.id).select("-password");

      // 🛑 BẢO MẬT: Nếu Token đúng nhưng User đã bị xóa khỏi Database thì vẫn phải chặn
      if (!user) {
        res.status(401);
        throw new Error("User không tồn tại (Có thể đã bị xóa)");
      }

      // Gán user vào request để các hàm sau dùng
      req.user = user;

      next(); // Cho phép đi tiếp
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Không được phép, Token sai hoặc hết hạn");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Không được phép, chưa có Token");
  }
});

// Middleware xác thực Admin (Có phải sếp không?)
const isAdmin = (req, res, next) => {
  // Kiểm tra xem req.user có tồn tại không và role có phải admin không
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403); // 403: Forbidden (Cấm truy cập)
    throw new Error("Yêu cầu quyền Admin (Không đủ thẩm quyền)");
  }
};

export { protect, isAdmin };
