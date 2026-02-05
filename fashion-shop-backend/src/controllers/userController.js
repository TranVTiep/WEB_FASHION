import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs"; // Nhớ import bcrypt

// @desc    Lấy hồ sơ
// @route   GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }
});

// @desc    Cập nhật hồ sơ
// @route   PUT /api/users/profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // 1. Cập nhật thông tin thường
    user.name = req.body.username || req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    // 2. Xử lý Đổi Mật Khẩu
    if (req.body.password) {
      // Kiểm tra độ dài
      if (req.body.password.length < 6) {
        res.status(400);
        throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
      }

      // Kiểm tra có nhập mật khẩu cũ không
      if (!req.body.currentPassword) {
        res.status(400);
        throw new Error("Vui lòng nhập mật khẩu cũ để xác thực");
      }

      // So sánh mật khẩu cũ với Database
      const isMatch = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );
      if (!isMatch) {
        res.status(400);
        throw new Error("Mật khẩu cũ không chính xác!"); // Frontend sẽ hiện câu này
      }

      // Mã hóa mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }
});

export { getUserProfile, updateUserProfile };
